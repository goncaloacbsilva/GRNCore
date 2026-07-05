import { importModel } from '@/lib/interchange'
import { createLocalModel } from '@/lib/persistence'
import type { ModelMetadata } from '@/lib/schema'
import { create } from 'zustand'

interface LocalModelImportState {
    open: boolean
    destination: 'list' | 'editor'
    onImported: ((metadata: ModelMetadata) => void) | null

    setOpen: (open: boolean) => void
    setDestination: (destination: 'list' | 'editor') => void
    setOnImported: (
        onImported: ((metadata: ModelMetadata) => void) | null
    ) => void
    importFile: (file: File) => Promise<ModelMetadata>
}

export const useLocalModelImportStore = create<LocalModelImportState>()(
    (set, get) => ({
        open: false,
        destination: 'list',
        onImported: null,

        setOpen: (open) => set(() => ({ open })),
        setDestination: (destination) => set(() => ({ destination })),
        setOnImported: (onImported) => set(() => ({ onImported })),
        importFile: async (file) => {
            const snapshot = await importModel(file)
            const metadata = await createLocalModel(snapshot)

            get().onImported?.(metadata)
            return metadata
        },
    })
)
