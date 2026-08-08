import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import {
    MODEL_DISPLAY_TAG_VALUES,
    getModelDisplayTags,
    type ModelDisplayTag,
    type ModelMetadata,
} from '@/lib/schema'
import {
    MODEL_SORT_OPTIONS,
    type ModelsSortOption,
    useModelsFiltersStore,
} from '@/store'
import { SearchXIcon } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ModelsList, type ModelsListProps } from './models-list'
import {
    getModelSearchKeywords,
    modelMatchesSearchKeywords,
} from './model-filtering'

export interface FilterableModelsListProps extends Pick<
    ModelsListProps,
    | 'onDelete'
    | 'onEdit'
    | 'lazyRenderBatchSize'
    | 'lazyRenderInitialCount'
    | 'visibleLimit'
> {
    items: ModelMetadata[]
    availableTags?: readonly ModelDisplayTag[]
    renderItemActions?: (item: ModelMetadata) => ReactNode
    emptyState?: ReactNode
}

const sortModels = (items: ModelMetadata[], sortBy: ModelsSortOption) =>
    [...items].sort((left, right) => {
        switch (sortBy) {
            case MODEL_SORT_OPTIONS.LastChangedAsc:
                return left.lastChangedAt - right.lastChangedAt
            case MODEL_SORT_OPTIONS.TitleAsc:
                return left.title.localeCompare(right.title, undefined, {
                    sensitivity: 'base',
                })
            case MODEL_SORT_OPTIONS.TitleDesc:
                return right.title.localeCompare(left.title, undefined, {
                    sensitivity: 'base',
                })
            case MODEL_SORT_OPTIONS.LastChangedDesc:
            default:
                return right.lastChangedAt - left.lastChangedAt
        }
    })

export function FilterableModelsList({
    items,
    availableTags = MODEL_DISPLAY_TAG_VALUES,
    onDelete,
    onEdit,
    renderItemActions,
    emptyState,
    lazyRenderBatchSize,
    lazyRenderInitialCount,
    visibleLimit,
}: FilterableModelsListProps) {
    const { query, selectedTags, sortBy } = useModelsFiltersStore(
        useShallow((state) => ({
            query: state.query,
            selectedTags: state.selectedTags,
            sortBy: state.sortBy,
        }))
    )

    const filteredItems = useMemo(() => {
        const keywords = getModelSearchKeywords(query)
        const activeSelectedTags = selectedTags.filter((tag) =>
            availableTags.includes(tag)
        )

        return sortModels(
            items.filter((item) => {
                const matchesQuery = modelMatchesSearchKeywords(item, keywords)

                const modelTags = getModelDisplayTags(item)
                const matchesTags =
                    activeSelectedTags.length === 0 ||
                    activeSelectedTags.every((tag) => modelTags.includes(tag))

                return matchesQuery && matchesTags
            }),
            sortBy
        )
    }, [availableTags, items, query, selectedTags, sortBy])

    const activeSelectedTagsCount = selectedTags.filter((tag) =>
        availableTags.includes(tag)
    ).length

    const shouldUseLazyRender =
        lazyRenderBatchSize !== undefined &&
        query.trim().length === 0 &&
        activeSelectedTagsCount === 0 &&
        sortBy === MODEL_SORT_OPTIONS.LastChangedDesc

    if (filteredItems.length === 0 && items.length > 0) {
        return (
            <Empty className="p-4">
                <EmptyHeader>
                    <EmptyMedia
                        variant="icon"
                        className="bg-[#2F80ED] text-sidebar-primary-foreground"
                    >
                        <SearchXIcon className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No models match your filters</EmptyTitle>
                    <EmptyDescription>
                        Adjust the search query or selected tags to find a
                        model.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent />
            </Empty>
        )
    }

    return (
        <ModelsList
            items={filteredItems}
            onDelete={onDelete}
            onEdit={onEdit}
            renderItemActions={renderItemActions}
            emptyState={emptyState}
            lazyRenderBatchSize={
                shouldUseLazyRender ? lazyRenderBatchSize : undefined
            }
            lazyRenderInitialCount={
                shouldUseLazyRender ? lazyRenderInitialCount : undefined
            }
            visibleLimit={visibleLimit}
        />
    )
}
