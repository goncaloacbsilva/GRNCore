import {
    fetchCatalogs,
    getCatalogVersion,
    listSupportedSources,
} from '@grn-core/model-fetchers'
import { dir, file, write } from 'opfs-tools'
import {
    CommunityCatalogSchema,
    type CommunityCatalog,
    type ModelMetadata,
} from '@/lib/schema'

const CATALOGS_DIRECTORY_PATH = '/catalogs'
const CATALOGS_VERSION_FILE_PATH = '/catalogs-version.json'

const isOPFSAvailable = () =>
    typeof navigator !== 'undefined' &&
    typeof navigator.storage?.getDirectory === 'function'

let catalogPersistenceQueue = Promise.resolve()
let inFlightCatalogRefresh: Promise<{
    catalogs: CommunityCatalogsMap
    version: string
    refreshed: boolean
}> | null = null

const parseJson = <T>(value: string, fallback: T): T => {
    try {
        return JSON.parse(value) as T
    } catch {
        return fallback
    }
}

const normalizeCatalog = (value: unknown, source: string): CommunityCatalog => {
    const parsed = CommunityCatalogSchema.safeParse(value)

    if (!parsed.success) {
        throw new Error(`Catalog "${source}" has an invalid format.`)
    }

    return parsed.data
}

const ensureCatalogsDirectory = async () => {
    await dir(CATALOGS_DIRECTORY_PATH).create()
}

const enqueueCatalogPersistence = async <T>(
    task: () => Promise<T>
): Promise<T> => {
    const queuedTask = catalogPersistenceQueue.then(task)

    catalogPersistenceQueue = queuedTask.then(
        () => undefined,
        () => undefined
    )

    return queuedTask
}

const catalogPath = (source: string) =>
    `${CATALOGS_DIRECTORY_PATH}/${source}.json`

export type CommunityCatalogSource = ReturnType<
    typeof listSupportedSources
>[number]

export interface CommunityModelMetadata extends ModelMetadata {
    source: CommunityCatalogSource
}

export type CommunityCatalogsMap = Partial<
    Record<CommunityCatalogSource, CommunityCatalog>
>

function decodeBase64Url(value: string): string | null {
    try {
        const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
        const paddedBase64 = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            '='
        )
        const binary = atob(paddedBase64)
        const bytes = Uint8Array.from(binary, (character) =>
            character.charCodeAt(0)
        )

        return new TextDecoder().decode(bytes)
    } catch {
        return null
    }
}

function getCommunityModelFilename(
    model: ModelMetadata,
    source: CommunityCatalogSource
): string | undefined {
    const catalogFilename = model.filename?.trim()

    if (catalogFilename) {
        return catalogFilename
    }

    if (source === 'biomodels') {
        return `${model.id}.xml`
    }

    if (source === 'ginsim') {
        const sourcePath = decodeBase64Url(model.id)
        return sourcePath?.split('/').at(-1)
    }

    return undefined
}

export async function readCachedCatalogVersion(): Promise<string | null> {
    if (!isOPFSAvailable()) {
        return null
    }

    const target = file(CATALOGS_VERSION_FILE_PATH)
    if (!(await target.exists())) {
        return null
    }

    const parsed = parseJson<{ version?: string } | null>(
        await target.text(),
        null
    )
    return typeof parsed?.version === 'string' && parsed.version.length > 0
        ? parsed.version
        : null
}

export async function writeCachedCatalogVersion(
    version: string
): Promise<void> {
    if (!isOPFSAvailable()) {
        return
    }

    await enqueueCatalogPersistence(async () => {
        await write(
            CATALOGS_VERSION_FILE_PATH,
            JSON.stringify({ version }, null, 2)
        )
    })
}

export async function readCachedCatalogs(): Promise<CommunityCatalogsMap> {
    if (!isOPFSAvailable()) {
        return {}
    }

    const sources = listSupportedSources()
    const entries = await Promise.all(
        sources.map(async (source) => {
            const target = file(catalogPath(source))

            if (!(await target.exists())) {
                return null
            }

            const parsed = normalizeCatalog(
                parseJson<unknown>(await target.text(), null),
                source
            )

            return [source, parsed] as const
        })
    )

    return Object.fromEntries(entries.filter((entry) => entry !== null))
}

export async function writeCachedCatalogs(
    catalogs: CommunityCatalogsMap
): Promise<void> {
    if (!isOPFSAvailable()) {
        return
    }

    await enqueueCatalogPersistence(async () => {
        await ensureCatalogsDirectory()

        for (const [source, catalog] of Object.entries(catalogs)) {
            if (!catalog) {
                continue
            }

            await write(catalogPath(source), JSON.stringify(catalog, null, 2))
        }
    })
}

export function flattenCommunityCatalogs(
    catalogs: CommunityCatalogsMap
): CommunityModelMetadata[] {
    return Object.entries(catalogs).flatMap(([source, catalog]) =>
        (catalog?.models ?? []).map((model) => ({
            ...model,
            filename: getCommunityModelFilename(
                model,
                source as CommunityCatalogSource
            ),
            source: source as CommunityCatalogSource,
        }))
    )
}

export async function refreshCommunityCatalogsIfNeeded(): Promise<{
    catalogs: CommunityCatalogsMap
    version: string
    refreshed: boolean
}> {
    if (inFlightCatalogRefresh) {
        return inFlightCatalogRefresh
    }

    inFlightCatalogRefresh = (async () => {
        const cachedCatalogs = await readCachedCatalogs()
        const cachedVersion = await readCachedCatalogVersion()
        const hasCachedCatalogs = Object.keys(cachedCatalogs).length > 0
        const currentVersion = await getCatalogVersion()

        if (hasCachedCatalogs && cachedVersion === currentVersion) {
            return {
                catalogs: cachedCatalogs,
                version: currentVersion,
                refreshed: false,
            }
        }

        const fetchedCatalogs = await fetchCatalogs()
        const normalizedCatalogs = Object.fromEntries(
            listSupportedSources().map((source) => [
                source,
                normalizeCatalog(fetchedCatalogs[source], source),
            ])
        ) as CommunityCatalogsMap

        await writeCachedCatalogs(normalizedCatalogs)
        await writeCachedCatalogVersion(currentVersion)

        return {
            catalogs: normalizedCatalogs,
            version: currentVersion,
            refreshed: true,
        }
    })()

    try {
        return await inFlightCatalogRefresh
    } finally {
        inFlightCatalogRefresh = null
    }
}
