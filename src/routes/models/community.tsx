import { FilterableModelsList } from '@/components/views/models'
import { Button } from '@/components/ui/button'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getInterchangeFormat, importModel } from '@/lib/interchange'
import {
    createLocalModel,
    flattenCommunityCatalogs,
    readCachedCatalogs,
    refreshCommunityCatalogsIfNeeded,
    type CommunityModelMetadata,
} from '@/lib/persistence'
import { usePageTransitionNavigate } from '@/hooks/use-page-transition'
import { createFileRoute } from '@tanstack/react-router'
import { CopyIcon, ExternalLinkIcon, LibraryBigIcon } from 'lucide-react'
import { getModelFetcher } from '@grn-core/model-fetchers'
import { useEffect, useMemo, useState } from 'react'
import { useCommunityModelsStatus, useModelsFiltersStore } from '@/store'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/models/community')({
    component: RouteComponent,
    staticData: {
        getTitle: () => 'Community Models',
    },
})

function normalizeImportedFilename({
    filename,
    source,
}: {
    filename: string
    source: CommunityModelMetadata['source']
}) {
    if (
        source === 'biomodels' &&
        filename.toLowerCase().endsWith('.xml') &&
        !filename.toLowerCase().endsWith('.sbml')
    ) {
        return `${filename.slice(0, -4)}.sbml`
    }

    return filename
}

interface DownloadedCommunityModel {
    filename: string
    content: Uint8Array
    contentType?: string
}

const COMMUNITY_MODEL_REQUEST_TIMEOUT_MS = 120_000

type CopyStage = 'download' | 'prepare' | 'convert' | 'save' | 'open'

interface CopyStageTiming {
    stage: CopyStage
    durationMs: number
}

interface CopyFailure {
    modelId: string
    message: string
}

const COPY_STAGE_LABELS: Record<CopyStage, string> = {
    download: 'Downloading...',
    prepare: 'Preparing...',
    convert: 'Converting...',
    save: 'Saving...',
    open: 'Opening editor...',
}

function formatDuration(durationMs: number) {
    return `${(durationMs / 1000).toFixed(1)}s`
}

function getCurrentTime() {
    return performance.now()
}

interface BiomodelsFileEntry {
    name?: unknown
    mimeType?: unknown
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Unknown error'
}

function decodeBase64Url(value: string): string {
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
}

function assertSafeGinsimSourcePath(sourcePath: string) {
    const parts = sourcePath.split('/')

    if (
        !sourcePath.startsWith('models/') ||
        sourcePath.includes('\\') ||
        parts.some((part) => part.length === 0 || part === '.' || part === '..')
    ) {
        throw new Error(`Unsafe GINsim model source path: ${sourcePath}`)
    }
}

function encodePathSegments(path: string) {
    return path.split('/').map(encodeURIComponent).join('/')
}

function getBiomodelsMainFileEntries(value: unknown): BiomodelsFileEntry[] {
    if (!value || typeof value !== 'object') {
        return []
    }

    const record = value as {
        main?: unknown
        files?: { main?: unknown }
    }
    const main = record.main ?? record.files?.main

    if (Array.isArray(main)) {
        return main.filter(
            (entry): entry is BiomodelsFileEntry =>
                entry !== null && typeof entry === 'object'
        )
    }

    if (main && typeof main === 'object') {
        return [main]
    }

    return []
}

function getBiomodelsMainFilename(value: unknown): string | null {
    const mainFiles = getBiomodelsMainFileEntries(value)
    const preferredFile =
        mainFiles.find(
            (file) =>
                typeof file.name === 'string' &&
                /\.(sbml|xml)$/i.test(file.name)
        ) ?? mainFiles[0]

    return typeof preferredFile?.name === 'string' &&
        preferredFile.name.trim().length > 0
        ? preferredFile.name
        : null
}

async function fetchWithTimeout(url: string, requestName: string) {
    const controller = new AbortController()
    const startedAt = getCurrentTime()
    const timeoutId = window.setTimeout(
        () => controller.abort(),
        COMMUNITY_MODEL_REQUEST_TIMEOUT_MS
    )

    try {
        const response = await fetch(url, { signal: controller.signal })
        console.info(
            '[community-model-request]',
            JSON.stringify({
                requestName,
                status: response.status,
                durationMs: Math.round(getCurrentTime() - startedAt),
            })
        )
        return response
    } catch (error) {
        const durationMs = Math.round(getCurrentTime() - startedAt)
        if (controller.signal.aborted) {
            const timeoutError = new Error(
                `${requestName} timed out after ${formatDuration(COMMUNITY_MODEL_REQUEST_TIMEOUT_MS)}`
            )
            console.info(
                '[community-model-request]',
                JSON.stringify({
                    requestName,
                    status: 'timed-out',
                    durationMs,
                })
            )
            throw timeoutError
        }

        console.info(
            '[community-model-request]',
            JSON.stringify({
                requestName,
                status: 'failed',
                durationMs,
                error: getErrorMessage(error),
            })
        )
        throw error
    } finally {
        window.clearTimeout(timeoutId)
    }
}

async function fetchBytes(
    url: string,
    requestName: string
): Promise<{
    content: Uint8Array
    contentType?: string
}> {
    const response = await fetchWithTimeout(url, requestName)

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    return {
        content: new Uint8Array(await response.arrayBuffer()),
        contentType: response.headers.get('content-type') ?? undefined,
    }
}

async function fetchBiomodelsModel(
    item: CommunityModelMetadata
): Promise<DownloadedCommunityModel> {
    const metadataResponse = await fetchWithTimeout(
        `https://www.biomodels.org/model/files/${encodeURIComponent(item.id)}?format=json`,
        'BioModels metadata request'
    )

    if (!metadataResponse.ok) {
        throw new Error(
            `BioModels files request failed with status ${metadataResponse.status}`
        )
    }

    const filename = getBiomodelsMainFilename(await metadataResponse.json())

    if (!filename) {
        throw new Error(
            `BioModels model ${item.id} does not expose a main file`
        )
    }

    const downloadedFile = await fetchBytes(
        `https://www.biomodels.org/model/download/${encodeURIComponent(item.id)}?filename=${encodeURIComponent(filename)}`,
        'BioModels model download'
    )

    if (downloadedFile.content.byteLength === 0) {
        throw new Error(`BioModels model ${item.id} returned empty content`)
    }

    return {
        filename,
        ...downloadedFile,
    }
}

async function fetchGinsimModel(
    item: CommunityModelMetadata
): Promise<DownloadedCommunityModel> {
    const sourcePath = decodeBase64Url(item.id)
    assertSafeGinsimSourcePath(sourcePath)

    const downloadedFile = await fetchBytes(
        `https://raw.githubusercontent.com/GINsim/GINsim.github.io/master/${encodePathSegments(sourcePath)}`,
        'GINsim model download'
    )

    if (downloadedFile.content.byteLength === 0) {
        throw new Error(`GINsim model ${item.id} returned empty content`)
    }

    return {
        filename: sourcePath.split('/').at(-1) ?? sourcePath,
        ...downloadedFile,
    }
}

async function fetchCommunityModel(
    item: CommunityModelMetadata
): Promise<DownloadedCommunityModel> {
    if (item.source === 'biomodels') {
        return fetchBiomodelsModel(item)
    }

    if (item.source === 'ginsim') {
        return fetchGinsimModel(item)
    }

    return getModelFetcher(item.source).fetchModel(item.id)
}

function getCommunityModelSourceWebpageUrl(item: CommunityModelMetadata) {
    return getModelFetcher(item.source).getModelSource(item.id)
}

function RouteComponent() {
    const navigate = useNavigate()
    const navigateWithTransition = usePageTransitionNavigate()
    const setRefreshing = useCommunityModelsStatus(
        (state) => state.setRefreshing
    )
    const query = useModelsFiltersStore((state) => state.query)
    const [items, setItems] = useState<CommunityModelMetadata[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copyingModelId, setCopyingModelId] = useState<string | null>(null)
    const [copyingStage, setCopyingStage] = useState<CopyStage | null>(null)
    const [copyFailure, setCopyFailure] = useState<CopyFailure | null>(null)

    useEffect(() => {
        let cancelled = false

        const loadCatalogs = async () => {
            setIsLoading(true)
            setRefreshing(true)
            setError(null)

            let cachedItems: CommunityModelMetadata[] = []

            try {
                const cachedCatalogs = await readCachedCatalogs()
                cachedItems = flattenCommunityCatalogs(cachedCatalogs)

                if (!cancelled && cachedItems.length > 0) {
                    setItems(cachedItems)
                    setIsLoading(false)
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : 'Failed to load cached catalogs.'
                    )
                }
            }

            try {
                const refreshedCatalogs =
                    await refreshCommunityCatalogsIfNeeded()

                if (cancelled) {
                    return
                }

                setItems(flattenCommunityCatalogs(refreshedCatalogs.catalogs))
                setError(null)
            } catch (refreshError) {
                if (cancelled) {
                    return
                }

                const nextError =
                    refreshError instanceof Error
                        ? refreshError.message
                        : 'Failed to refresh community catalogs.'

                if (cachedItems.length === 0) {
                    setError(nextError)
                } else {
                    setError(`${nextError} Showing cached catalogs.`)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
                setRefreshing(false)
            }
        }

        void loadCatalogs()

        return () => {
            cancelled = true
            setRefreshing(false)
        }
    }, [setRefreshing])

    const handleCopyAndEdit = async (item: CommunityModelMetadata) => {
        setCopyingModelId(item.id)
        setCopyFailure(null)

        const startedAt = getCurrentTime()
        const timings: CopyStageTiming[] = []
        let currentStage: CopyStage = 'download'
        let completed = false
        const runStage = <Result,>(
            stage: CopyStage,
            operation: () => Result | Promise<Result>
        ) => {
            currentStage = stage
            setCopyingStage(stage)
            const stageStartedAt = getCurrentTime()

            return Promise.resolve()
                .then(operation)
                .finally(() => {
                    timings.push({
                        stage,
                        durationMs: getCurrentTime() - stageStartedAt,
                    })
                })
        }

        try {
            const fetchedModel = await runStage('download', () =>
                fetchCommunityModel(item)
            )

            const { modelFile, normalizedFilename } = await runStage(
                'prepare',
                () => {
                    const normalizedFilename = normalizeImportedFilename({
                        filename: fetchedModel.filename,
                        source: item.source,
                    })
                    const fileBytes = new Uint8Array(
                        fetchedModel.content.byteLength
                    )
                    fileBytes.set(fetchedModel.content)

                    return {
                        normalizedFilename,
                        modelFile: new File([fileBytes], normalizedFilename, {
                            type:
                                fetchedModel.contentType ??
                                'application/octet-stream',
                        }),
                    }
                }
            )
            const snapshot = await runStage('convert', () =>
                importModel(modelFile)
            )
            const metadata = await runStage('save', () =>
                createLocalModel(snapshot, {
                    sourceFormat: getInterchangeFormat(normalizedFilename),
                    metadata: {
                        title: item.title,
                        filename: normalizedFilename,
                        description: item.description,
                        author: item.author,
                        tags: item.tags,
                    },
                })
            )

            await runStage('open', () =>
                navigateWithTransition('forward', () =>
                    navigate({
                        to: '/edit/$modelId',
                        params: { modelId: metadata.id },
                    })
                )
            )
            completed = true
        } catch (copyError) {
            const durationMs = getCurrentTime() - startedAt
            const message = `${COPY_STAGE_LABELS[currentStage]} failed after ${formatDuration(durationMs)}: ${getErrorMessage(copyError)}`
            setCopyFailure({ modelId: item.id, message })
            toast.error('Failed to copy community model', {
                description: message,
                position: 'top-right',
            })
            console.info(
                '[community-model-copy]',
                JSON.stringify({
                    modelId: item.id,
                    status: 'failed',
                    failedStage: currentStage,
                    durationMs,
                    timings,
                    error: getErrorMessage(copyError),
                })
            )
        } finally {
            if (completed) {
                console.info(
                    '[community-model-copy]',
                    JSON.stringify({
                        modelId: item.id,
                        status: 'completed',
                        durationMs: getCurrentTime() - startedAt,
                        timings,
                    })
                )
            }
            setCopyingModelId(null)
            setCopyingStage(null)
        }
    }

    const emptyState = useMemo(
        () => (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia
                        variant="icon"
                        className="bg-[#2F80ED] text-sidebar-primary-foreground"
                    >
                        <LibraryBigIcon className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No Community Models Available</EmptyTitle>
                    <EmptyDescription>
                        Community catalogs are empty or could not be loaded.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent />
            </Empty>
        ),
        []
    )

    const visibleItems = useMemo(() => {
        if (query.trim().length > 0) {
            return items
        }

        return items.filter(
            (item) =>
                item.author.trim().length > 0 || (item.tags?.length ?? 0) > 0
        )
    }, [items, query])

    const initialLoader = (
        <div className="flex min-h-[240px] items-center justify-center p-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                <span>Loading community models...</span>
            </div>
        </div>
    )

    if (isLoading && items.length === 0) {
        return initialLoader
    }

    return (
        <div className="flex flex-col">
            {error ? (
                <div className="px-4 pt-4">
                    <Alert variant="destructive">
                        <AlertTitle>Community catalogs unavailable</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            ) : null}
            {copyFailure ? (
                <div className="px-4 pt-4">
                    <Alert variant="destructive">
                        <AlertTitle>Unable to copy community model</AlertTitle>
                        <AlertDescription>
                            {copyFailure.message}
                        </AlertDescription>
                    </Alert>
                </div>
            ) : null}
            <FilterableModelsList
                items={visibleItems}
                onDelete={() => undefined}
                onEdit={() => undefined}
                emptyState={emptyState}
                visibleLimit={20}
                lazyRenderBatchSize={20}
                lazyRenderInitialCount={20}
                renderItemActions={(item) => {
                    const communityItem = item as CommunityModelMetadata
                    const isCopying = copyingModelId === communityItem.id
                    const sourceWebpageUrl =
                        getCommunityModelSourceWebpageUrl(communityItem)

                    return (
                        <>
                            {sourceWebpageUrl ? (
                                <Button
                                    asChild
                                    variant="link"
                                    className="cursor-pointer"
                                >
                                    <a
                                        href={sourceWebpageUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLinkIcon />
                                        Open webpage
                                    </a>
                                </Button>
                            ) : null}
                            <Button
                                variant="secondary"
                                className="cursor-pointer"
                                disabled={isCopying}
                                onClick={() =>
                                    void handleCopyAndEdit(communityItem)
                                }
                            >
                                {isCopying && copyingStage ? (
                                    <>
                                        <Spinner className="size-4" />
                                        {COPY_STAGE_LABELS[copyingStage]}
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon />
                                        Copy and Edit
                                    </>
                                )}
                            </Button>
                        </>
                    )
                }}
            />
        </div>
    )
}
