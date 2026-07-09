import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import type { ModelMetadata } from '@/lib/schema'
import {
    MODEL_SORT_OPTIONS,
    type ModelsSortOption,
    useModelsFiltersStore,
} from '@/store'
import { SearchXIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ModelsList, type ModelsListProps } from './models-list'

export interface FilterableModelsListProps
    extends Pick<ModelsListProps, 'onDelete' | 'onEdit'> {
    items: ModelMetadata[]
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
    onDelete,
    onEdit,
}: FilterableModelsListProps) {
    const { query, selectedTags, sortBy } = useModelsFiltersStore(
        useShallow((state) => ({
            query: state.query,
            selectedTags: state.selectedTags,
            sortBy: state.sortBy,
        }))
    )

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        return sortModels(
            items.filter((item) => {
                const matchesQuery =
                    normalizedQuery.length === 0 ||
                    item.title.toLowerCase().includes(normalizedQuery) ||
                    item.description.toLowerCase().includes(normalizedQuery)

                const matchesTags =
                    selectedTags.length === 0 ||
                    selectedTags.every((tag) => item.tags.includes(tag))

                return matchesQuery && matchesTags
            }),
            sortBy
        )
    }, [items, query, selectedTags, sortBy])

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
        <ModelsList items={filteredItems} onDelete={onDelete} onEdit={onEdit} />
    )
}
