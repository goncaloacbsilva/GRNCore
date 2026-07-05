import { useModelsFiltersStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { ModelsFiltersPopover } from './models-filters-popover'
import { ModelsSearchBox } from './models-search-box'
import { ModelsSortSelect } from './models-sort-select'

export function ModelsFilters() {
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

    return (
        <div className="flex items-center gap-2">
            <ModelsSearchBox query={query} onQueryChange={setQuery} />
            <ModelsFiltersPopover
                selectedTags={selectedTags}
                onToggleTag={toggleTag}
                onClearTags={clearTags}
                onReset={reset}
                hasSearchQuery={query.trim().length > 0}
            />
            <ModelsSortSelect sortBy={sortBy} onSortChange={setSortBy} />
        </div>
    )
}
