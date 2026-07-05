import { dir, file, write } from 'opfs-tools'
import type {
    InternalGRNModel,
    ModelMetadataDetails,
    ModelMetadata,
    PersistedAnnotations,
} from '@/lib/schema'
import { normalizeModelMetadataDetails } from '@/lib/schema'
import { usePersistenceStatus } from '@/store/persistence'
import type { SerializedEditorState } from 'lexical'
import {
    createEmptyModelSnapshot,
    stripTransientSnapshotFields,
} from './model-snapshot'

const METADATA_FILE_PATH = '/metadata.json'
const SNAPSHOTS_DIRECTORY_PATH = '/snapshots'
const MIN_SAVING_FEEDBACK_MS = 800

const isOPFSAvailable = () =>
    typeof navigator !== 'undefined' &&
    typeof navigator.storage?.getDirectory === 'function'

let pendingWrites = 0
let savingStartedAt = 0
let finishTimer: ReturnType<typeof setTimeout> | null = null
let persistenceWriteQueue = Promise.resolve()

const startSaving = () => {
    pendingWrites += 1
    if (finishTimer) {
        clearTimeout(finishTimer)
        finishTimer = null
    }
    if (pendingWrites === 1) {
        savingStartedAt = Date.now()
    }
    usePersistenceStatus.getState().setSaving(true)
}

const finishSaving = () => {
    pendingWrites = Math.max(0, pendingWrites - 1)
    if (pendingWrites !== 0) {
        return
    }

    const elapsed = Date.now() - savingStartedAt
    const remaining = Math.max(0, MIN_SAVING_FEEDBACK_MS - elapsed)

    if (remaining === 0) {
        usePersistenceStatus.getState().setSaving(false)
        return
    }

    finishTimer = setTimeout(() => {
        finishTimer = null
        if (pendingWrites === 0) {
            usePersistenceStatus.getState().setSaving(false)
        }
    }, remaining)
}

const enqueuePersistenceWrite = async <T>(
    task: () => Promise<T>
): Promise<T> => {
    const queuedTask = persistenceWriteQueue.then(task)

    persistenceWriteQueue = queuedTask.then(
        () => undefined,
        () => undefined
    )

    return queuedTask
}

const snapshotPath = (modelId: string) =>
    `${SNAPSHOTS_DIRECTORY_PATH}/${modelId}.json`

const ensureSnapshotsDirectory = async () => {
    await dir(SNAPSHOTS_DIRECTORY_PATH).create()
}

const parseJson = <T>(value: string, fallback: T): T => {
    try {
        return JSON.parse(value) as T
    } catch {
        return fallback
    }
}

const readMetadataList = async (): Promise<ModelMetadata[]> => {
    if (!isOPFSAvailable()) {
        return []
    }

    const metadataFile = file(METADATA_FILE_PATH)
    const exists = await metadataFile.exists()
    if (!exists) {
        await write(METADATA_FILE_PATH, '[]')
        return []
    }

    return parseJson<ModelMetadata[]>(await metadataFile.text(), [])
}

const writeMetadataList = async (items: ModelMetadata[]) => {
    if (!isOPFSAvailable()) {
        return
    }

    await write(METADATA_FILE_PATH, JSON.stringify(items, null, 2))
}

const annotationsToDescription = (
    annotations: PersistedAnnotations | undefined
): string => {
    const unstructured: unknown = annotations?.unstructured

    if (!unstructured || typeof unstructured !== 'object') {
        return ''
    }

    const collectText = (value: unknown): string => {
        if (typeof value === 'string') {
            return value
        }

        if (Array.isArray(value)) {
            return value.map((entry) => collectText(entry)).join('')
        }

        if (!value || typeof value !== 'object') {
            return ''
        }

        const record = value as Record<string, unknown>
        if (typeof record.text === 'string') {
            return record.text
        }

        const children = record.children
        return Array.isArray(children)
            ? children.map((child) => collectText(child)).join('')
            : ''
    }

    const root = (unstructured as Record<string, unknown>).root
    if (!root || typeof root !== 'object') {
        return ''
    }

    const children = (root as Record<string, unknown>).children
    if (!Array.isArray(children)) {
        return ''
    }

    return children
        .map((child) => collectText(child).trim())
        .filter((text) => text.length > 0)
        .join('\n\n')
        .trim()
}

const EMPTY_SERIALIZED_EDITOR_STATE = {
    root: {
        children: [
            {
                children: [],
                direction: null,
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                type: 'paragraph',
                version: 1,
            },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
    },
} as unknown as SerializedEditorState

const createMetadataFromSnapshot = (
    id: string,
    snapshot: InternalGRNModel
): ModelMetadata => ({
    id,
    title: snapshot.title,
    description: annotationsToDescription(snapshot.annotations),
    author: 'Unknown Author',
    tags: [],
})

const updateMetadataForSnapshot = (
    metadata: ModelMetadata,
    snapshot: InternalGRNModel
): ModelMetadata => ({
    ...metadata,
    title: snapshot.title,
    description: annotationsToDescription(snapshot.annotations),
})

export interface UpdateLocalModelDetailsInput extends ModelMetadataDetails {
    description: SerializedEditorState
}

const writeSnapshotFile = async (
    modelId: string,
    snapshot: InternalGRNModel
): Promise<void> => {
    await ensureSnapshotsDirectory()
    await write(
        snapshotPath(modelId),
        JSON.stringify(stripTransientSnapshotFields(snapshot), null, 2)
    )
}

export async function listLocalModels(): Promise<ModelMetadata[]> {
    return readMetadataList()
}

export async function getLocalModelSnapshot(
    modelId: string
): Promise<InternalGRNModel | null> {
    if (!isOPFSAvailable()) {
        return null
    }

    const target = file(snapshotPath(modelId))
    const exists = await target.exists()
    if (!exists) {
        return null
    }

    const parsedSnapshot = parseJson<InternalGRNModel | null>(
        await target.text(),
        null
    )

    if (!parsedSnapshot) {
        return null
    }

    return {
        ...createEmptyModelSnapshot(),
        ...parsedSnapshot,
    }
}

export async function createLocalModel(
    snapshot: InternalGRNModel
): Promise<ModelMetadata> {
    if (!isOPFSAvailable()) {
        throw new Error('OPFS is not available in this environment.')
    }

    return enqueuePersistenceWrite(async () => {
        const modelId = crypto.randomUUID()
        const metadata = createMetadataFromSnapshot(modelId, snapshot)
        const items = await readMetadataList()

        await writeSnapshotFile(modelId, snapshot)
        await writeMetadataList([...items, metadata])

        return metadata
    })
}

export async function deleteLocalModel(modelId: string): Promise<void> {
    if (!isOPFSAvailable()) {
        return
    }

    await enqueuePersistenceWrite(async () => {
        const items = await readMetadataList()
        await writeMetadataList(items.filter((item) => item.id !== modelId))

        try {
            await file(snapshotPath(modelId)).remove()
        } catch {
            // Ignore missing snapshots so metadata cleanup can still succeed.
        }
    })
}

export async function saveLocalModelSnapshot(
    modelId: string,
    snapshot: InternalGRNModel
): Promise<void> {
    if (!isOPFSAvailable()) {
        return
    }

    startSaving()
    try {
        await enqueuePersistenceWrite(async () => {
            await writeSnapshotFile(modelId, snapshot)

            const items = await readMetadataList()
            const nextItems = items.map((item) =>
                item.id === modelId
                    ? updateMetadataForSnapshot(item, snapshot)
                    : item
            )

            await writeMetadataList(nextItems)
        })
    } finally {
        finishSaving()
    }
}

export async function updateLocalModelDetails(
    modelId: string,
    input: UpdateLocalModelDetailsInput
): Promise<ModelMetadata> {
    if (!isOPFSAvailable()) {
        throw new Error('OPFS is not available in this environment.')
    }

    startSaving()
    try {
        return await enqueuePersistenceWrite(async () => {
            const snapshot = await getLocalModelSnapshot(modelId)

            if (!snapshot) {
                throw new Error(`Model "${modelId}" was not found.`)
            }

            const normalizedDetails = normalizeModelMetadataDetails(input)
            const nextSnapshot: InternalGRNModel = {
                ...snapshot,
                title: normalizedDetails.title,
                annotations: {
                    references: snapshot.annotations?.references ?? [],
                    unstructured:
                        input.description ??
                        snapshot.annotations?.unstructured ??
                        EMPTY_SERIALIZED_EDITOR_STATE,
                },
            }

            const items = await readMetadataList()
            const existingMetadata = items.find((item) => item.id === modelId)

            if (!existingMetadata) {
                throw new Error(
                    `Metadata for model "${modelId}" was not found.`
                )
            }

            const updatedMetadata: ModelMetadata = {
                ...existingMetadata,
                title: normalizedDetails.title,
                description: annotationsToDescription(nextSnapshot.annotations),
                author: normalizedDetails.author,
                tags: normalizedDetails.tags,
            }

            await writeSnapshotFile(modelId, nextSnapshot)
            await writeMetadataList(
                items.map((item) =>
                    item.id === modelId ? updatedMetadata : item
                )
            )

            return updatedMetadata
        })
    } finally {
        finishSaving()
    }
}
