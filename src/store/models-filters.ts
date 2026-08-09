import {
    MODEL_DISPLAY_TAG_VALUES,
    isModelDisplayTag,
    type ModelDisplayTag,
} from '@/lib/schema'
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
    selectedTags: ModelDisplayTag[]
    sortBy: ModelsSortOption

    setQuery: (query: string) => void
    toggleTag: (tag: ModelDisplayTag) => void
    setSortBy: (sortBy: ModelsSortOption) => void
    clearTags: () => void
    reset: () => void
}

const initialState = {
    query: '',
    selectedTags: [] as ModelDisplayTag[],
    sortBy: MODEL_SORT_OPTIONS.LastChangedDesc as ModelsSortOption,
}

const normalizeSelectedTags = (selectedTags: unknown): ModelDisplayTag[] => {
    if (!Array.isArray(selectedTags)) {
        return initialState.selectedTags
    }

    const validSelectedTags = selectedTags.filter(isModelDisplayTag)
    const hasAllTagsSelected =
        validSelectedTags.length === MODEL_DISPLAY_TAG_VALUES.length &&
        MODEL_DISPLAY_TAG_VALUES.every((tag) => validSelectedTags.includes(tag))

    return hasAllTagsSelected ? initialState.selectedTags : validSelectedTags
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
            version: 2,
            storage: createJSONStorage(() => localStorage),
            migrate: (persistedState) => {
                if (
                    !persistedState ||
                    typeof persistedState !== 'object' ||
                    !('selectedTags' in persistedState)
                ) {
                    return persistedState
                }

                return {
                    ...persistedState,
                    selectedTags: normalizeSelectedTags(
                        persistedState.selectedTags
                    ),
                }
            },
            partialize: (state) => ({
                query: state.query,
                selectedTags: state.selectedTags,
                sortBy: state.sortBy,
            }),
        }
    )
)
