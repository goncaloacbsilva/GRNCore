import { create } from 'zustand'

interface PersistenceStatusState {
    isSaving: boolean
    setSaving: (isSaving: boolean) => void
}

export const usePersistenceStatus = create<PersistenceStatusState>((set) => ({
    isSaving: false,
    setSaving: (isSaving) => set({ isSaving }),
}))
