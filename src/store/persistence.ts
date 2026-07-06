import { create } from 'zustand'

interface PersistenceStatusState {
    isSaving: boolean
    localModelsVersion: number
    setSaving: (isSaving: boolean) => void
    bumpLocalModelsVersion: () => void
}

export const usePersistenceStatus = create<PersistenceStatusState>((set) => ({
    isSaving: false,
    localModelsVersion: 0,
    setSaving: (isSaving) => set({ isSaving }),
    bumpLocalModelsVersion: () =>
        set((state) => ({
            localModelsVersion: state.localModelsVersion + 1,
        })),
}))
