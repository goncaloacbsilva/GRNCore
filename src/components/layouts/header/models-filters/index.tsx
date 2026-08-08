import {
    MODEL_DISPLAY_TAG_GROUPS,
    MODEL_METADATA_TAG_GROUPS,
    type ModelDisplayTag,
} from '@/lib/schema'
import { useModelsFiltersStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { ModelsFiltersPopover } from './models-filters-popover'
import { ModelsSearchBox } from './models-search-box'
import { ModelsSortSelect } from './models-sort-select'

interface ModelsFiltersProps {
    variant: 'local' | 'community'
}

export function ModelsFilters({ variant }: ModelsFiltersProps) {
    const {
        query,
        selectedTags,
        sortBy,
        setQuery,
        toggleTag,
        setSortBy,
        clearTags,
        reset,
    } = useModelsFiltersStore(
        useShallow((state) => ({
            query: state.query,
            selectedTags: state.selectedTags,
            sortBy: state.sortBy,
            setQuery: state.setQuery,
            toggleTag: state.toggleTag,
            setSortBy: state.setSortBy,
            clearTags: state.clearTags,
            reset: state.reset,
        }))
    )

    const tagGroups =
        variant === 'local'
            ? MODEL_METADATA_TAG_GROUPS
            : MODEL_DISPLAY_TAG_GROUPS
    const availableTags = tagGroups.flatMap((group) => group.items)
    const visibleSelectedTags = selectedTags.filter((tag) =>
        availableTags.includes(tag)
    )

    return (
        <div className="flex items-center gap-2">
            <ModelsSearchBox query={query} onQueryChange={setQuery} />
            <ModelsFiltersPopover
                tagGroups={
                    tagGroups as {
                        value: string
                        items: readonly ModelDisplayTag[]
                    }[]
                }
                selectedTags={visibleSelectedTags}
                onToggleTag={toggleTag}
                onClearTags={clearTags}
                onReset={reset}
                hasSearchQuery={query.trim().length > 0}
            />
            <ModelsSortSelect sortBy={sortBy} onSortChange={setSortBy} />
        </div>
    )
}
