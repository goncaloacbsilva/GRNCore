import anime from 'animejs'
import type { ModelMetadata } from '@/lib/schema'
import { ModelItem } from './model-item'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { DnaOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useCreateModel } from '@/hooks/use-create-model'
import { useLocalModelImportStore } from '@/store'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface ModelsListProps {
    items: ModelMetadata[]
    onDelete: (modelId: string) => Promise<void> | void
    onEdit: (item: ModelMetadata) => Promise<void> | void
    renderItemActions?: (item: ModelMetadata) => ReactNode
    emptyState?: ReactNode
    lazyRenderBatchSize?: number
    lazyRenderInitialCount?: number
    visibleLimit?: number
}

function ModelsListEmpty() {
    const { createModel } = useCreateModel()
    const { setOpen, setDestination } = useLocalModelImportStore((state) => ({
        setOpen: state.setOpen,
        setDestination: state.setDestination,
    }))

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia
                    variant="icon"
                    className="bg-[#2F80ED] text-sidebar-primary-foreground"
                >
                    <DnaOffIcon className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No Models Available</EmptyTitle>
                <EmptyDescription>
                    You don&apos;t have any models yet. <br /> Get started by
                    adding your first model.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
                <Button
                    className="hover:cursor-pointer"
                    onClick={() => void createModel()}
                >
                    Create Model
                </Button>
                <Button
                    className="hover:cursor-pointer"
                    variant="outline"
                    onClick={() => {
                        setDestination('list')
                        setOpen(true)
                    }}
                >
                    Upload Model
                </Button>
            </EmptyContent>
        </Empty>
    )
}

interface AnimatedModelItemProps {
    item: ModelMetadata
    isEntering: boolean
    isExiting: boolean
    onEntered?: (modelId: string) => void
    onExited?: (modelId: string) => void
    onDelete: (modelId: string) => Promise<void> | void
    onEdit: (item: ModelMetadata) => Promise<void> | void
    renderItemActions?: (item: ModelMetadata) => ReactNode
}

function AnimatedModelItem({
    item,
    isEntering,
    isExiting,
    onEntered,
    onExited,
    onDelete,
    onEdit,
    renderItemActions,
}: AnimatedModelItemProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const hasPlayedEnterAnimation = useRef(false)
    const hasPlayedExitAnimation = useRef(false)

    useEffect(() => {
        const container = containerRef.current

        if (!container || !isEntering || hasPlayedEnterAnimation.current) {
            return
        }

        hasPlayedEnterAnimation.current = true
        anime.remove(container)
        anime.set(container, {
            opacity: 0,
            translateY: 16,
            scale: 0.98,
        })

        const animation = anime({
            targets: container,
            opacity: [0, 1],
            translateY: [16, 0],
            scale: [0.98, 1],
            duration: 260,
            easing: 'easeOutCubic',
            complete: () => {
                anime.set(container, {
                    opacity: 1,
                    translateY: 0,
                    scale: 1,
                })
                onEntered?.(item.id)
            },
        })

        return () => {
            animation.pause()
            anime.remove(container)
        }
    }, [isEntering, item.id, onEntered])

    useEffect(() => {
        const container = containerRef.current

        if (!container || !isExiting || hasPlayedExitAnimation.current) {
            return
        }

        hasPlayedExitAnimation.current = true
        const initialHeight = container.getBoundingClientRect().height

        anime.remove(container)
        anime.set(container, {
            overflow: 'hidden',
            height: initialHeight,
        })

        const animation = anime({
            targets: container,
            opacity: [1, 0],
            translateY: [0, -12],
            scale: [1, 0.98],
            height: [initialHeight, 0],
            marginTop: [0, 0],
            marginBottom: [0, -24],
            paddingTop: [0, 0],
            paddingBottom: [0, 0],
            duration: 220,
            easing: 'easeInOutQuad',
            complete: () => onExited?.(item.id),
        })

        return () => {
            animation.pause()
            anime.remove(container)
        }
    }, [isExiting, item.id, onExited])

    return (
        <div ref={containerRef}>
            <ModelItem
                item={item}
                onDelete={onDelete}
                onEdit={onEdit}
                renderActions={renderItemActions}
            />
        </div>
    )
}

export function ModelsList({
    items,
    onDelete,
    onEdit,
    renderItemActions,
    emptyState,
    lazyRenderBatchSize,
    lazyRenderInitialCount,
    visibleLimit,
}: ModelsListProps) {
    const [enteringIds, setEnteringIds] = useState<Set<string>>(() => new Set())
    const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set())
    const [visibleCount, setVisibleCount] = useState(() =>
        lazyRenderBatchSize
            ? Math.min(
                  items.length,
                  lazyRenderInitialCount ?? lazyRenderBatchSize
              )
            : items.length
    )
    const previousItemIdsRef = useRef(new Set(items.map((item) => item.id)))
    const hasInitializedRef = useRef(false)
    const loadMoreRef = useRef<HTMLDivElement | null>(null)
    const shouldLazyRender = (lazyRenderBatchSize ?? 0) > 0

    useEffect(() => {
        if (!shouldLazyRender) {
            setVisibleCount(items.length)
            return
        }

        setVisibleCount((current) => {
            if (current > 0) {
                return current
            }

            return Math.min(
                items.length,
                lazyRenderInitialCount ?? lazyRenderBatchSize!
            )
        })
    }, [
        items.length,
        lazyRenderBatchSize,
        lazyRenderInitialCount,
        shouldLazyRender,
    ])

    useEffect(() => {
        if (!hasInitializedRef.current) {
            previousItemIdsRef.current = new Set(items.map((item) => item.id))
            hasInitializedRef.current = true
            return
        }

        const currentIds = previousItemIdsRef.current
        const addedIds = items
            .filter((item) => !currentIds.has(item.id))
            .map((item) => item.id)

        if (addedIds.length > 0) {
            setEnteringIds((current) => {
                const next = new Set(current)
                addedIds.forEach((id) => next.add(id))
                return next
            })
        }

        previousItemIdsRef.current = new Set(items.map((item) => item.id))
    }, [items])

    useEffect(() => {
        if (!shouldLazyRender || visibleCount >= items.length) {
            return
        }

        const target = loadMoreRef.current

        if (!target) {
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries

                if (!entry?.isIntersecting) {
                    return
                }

                setVisibleCount((current) =>
                    Math.min(items.length, current + lazyRenderBatchSize!)
                )
            },
            {
                rootMargin: '600px 0px',
            }
        )

        observer.observe(target)

        return () => {
            observer.disconnect()
        }
    }, [items.length, lazyRenderBatchSize, shouldLazyRender, visibleCount])

    const visibleItems = (
        shouldLazyRender ? items.slice(0, visibleCount) : items
    ).slice(0, visibleLimit ?? Number.POSITIVE_INFINITY)

    const handleEntered = (modelId: string) => {
        setEnteringIds((current) => {
            if (!current.has(modelId)) {
                return current
            }

            const next = new Set(current)
            next.delete(modelId)
            return next
        })
    }

    const handleDelete = (modelId: string) => {
        setExitingIds((current) => {
            if (current.has(modelId)) {
                return current
            }

            const next = new Set(current)
            next.add(modelId)
            return next
        })
    }

    const handleExited = (modelId: string) => {
        setExitingIds((current) => {
            const next = new Set(current)
            next.delete(modelId)
            return next
        })
        setEnteringIds((current) => {
            const next = new Set(current)
            next.delete(modelId)
            return next
        })

        void onDelete(modelId)
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            {items.length === 0
                ? (emptyState ?? <ModelsListEmpty />)
                : visibleItems.map((model) => (
                      <AnimatedModelItem
                          key={model.id}
                          item={model}
                          isEntering={enteringIds.has(model.id)}
                          isExiting={exitingIds.has(model.id)}
                          onEntered={handleEntered}
                          onExited={handleExited}
                          onDelete={handleDelete}
                          onEdit={onEdit}
                          renderItemActions={renderItemActions}
                      />
                  ))}
            {shouldLazyRender &&
            visibleLimit === undefined &&
            visibleCount < items.length ? (
                <div
                    ref={loadMoreRef}
                    className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground"
                >
                    <Spinner className="size-4" />
                    <span>
                        Loading more models ({visibleCount} / {items.length})
                    </span>
                </div>
            ) : null}
        </div>
    )
}
