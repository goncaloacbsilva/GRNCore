import type { ModelMetadataTag } from '@/lib/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ModelsFiltersState {
    query: string
    selectedTags: ModelMetadataTag[]

    setQuery: (query: string) => void
    toggleTag: (tag: ModelMetadataTag) => void
    clearTags: () => void
    reset: () => void
}

const initialState = {
    query: '',
    selectedTags: [] as ModelMetadataTag[],
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
            clearTags: () => set(() => ({ selectedTags: [] })),
            reset: () => set(() => initialState),
        }),
        {
            name: 'models-filters',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                query: state.query,
                selectedTags: state.selectedTags,
            }),
        }
    )
)
