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

function getCommunityModelSourceWebpageUrl(item: CommunityModelMetadata) {
    if (item.source === 'biomodels') {
        return `https://www.biomodels.org/${encodeURIComponent(item.id)}`
    }

    if (item.source === 'ginsim') {
        let sourcePath: string

        try {
            sourcePath = decodeBase64Url(item.id)
        } catch {
            return undefined
        }

        return `https://github.com/GINsim/GINsim.github.io/blob/master/${sourcePath
            .split('/')
            .map((part) => encodeURIComponent(part))
            .join('/')}`
    }

    return undefined
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

        try {
            const fetchedModel = await getModelFetcher(item.source).fetchModel(
                item.id
            )

            const normalizedFilename = normalizeImportedFilename({
                filename: fetchedModel.filename,
                source: item.source,
            })
            const fileBytes = new Uint8Array(fetchedModel.content.byteLength)
            fileBytes.set(fetchedModel.content)
            const modelFile = new File([fileBytes], normalizedFilename, {
                type: fetchedModel.contentType ?? 'application/octet-stream',
            })
            const snapshot = await importModel(modelFile)
            const metadata = await createLocalModel(snapshot, {
                sourceFormat: getInterchangeFormat(normalizedFilename),
                metadata: {
                    title: item.title,
                    description: item.description,
                    author: item.author,
                    tags: item.tags,
                },
            })

            await navigateWithTransition('forward', () =>
                navigate({
                    to: '/edit/$modelId',
                    params: { modelId: metadata.id },
                })
            )
        } catch (copyError) {
            toast.error('Failed to copy community model', {
                description:
                    copyError instanceof Error
                        ? copyError.message
                        : 'Unknown error',
                position: 'top-right',
            })
        } finally {
            setCopyingModelId(null)
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
                                    variant="outline"
                                    className="cursor-pointer"
                                >
                                    <a
                                        href={sourceWebpageUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <ExternalLinkIcon />
                                        Open source webpage
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
                                {isCopying ? (
                                    <>
                                        <Spinner className="size-4" />
                                        Copying...
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
