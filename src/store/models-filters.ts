import type { ModelMetadataTag } from '@/lib/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const MODEL_SORT_OPTIONS = {
    LastChangedDesc: 'last-changed-desc',
    LastChangedAsc: 'last-changed-asc',
    TitleAsc: 'title-asc',
    TitleDesc: 'title-desc',
} as const

export type ModelsSortOption =
    (typeof MODEL_SORT_OPTIONS)[keyof typeof MODEL_SORT_OPTIONS]

interface ModelsFiltersState {
    query: string
    selectedTags: ModelMetadataTag[]
    sortBy: ModelsSortOption

    setQuery: (query: string) => void
    toggleTag: (tag: ModelMetadataTag) => void
    setSortBy: (sortBy: ModelsSortOption) => void
    clearTags: () => void
    reset: () => void
}

const initialState = {
    query: '',
    selectedTags: [] as ModelMetadataTag[],
    sortBy: MODEL_SORT_OPTIONS.LastChangedDesc as ModelsSortOption,
}

export const useModelsFiltersStore = create<ModelsFiltersState>()(
    persist(
        (set) => ({
            ...initialState,
            setQuery: (query) => set(() => ({ query })),
            toggleTag: (tag) =>
                set((state) => ({
                    selectedTags: state.selectedTags.includes(tag)
                        ? state.selectedTags.filter((value) => value !== tag)
                        : [...state.selectedTags, tag],
                })),
            setSortBy: (sortBy) => set(() => ({ sortBy })),
            clearTags: () => set(() => ({ selectedTags: [] })),
            reset: () => set(() => initialState),
        }),
        {
            name: 'models-filters',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                query: state.query,
                selectedTags: state.selectedTags,
                sortBy: state.sortBy,
            }),
        }
    )
)
