import { InteractionType } from '@/lib/schema'
import { toast } from 'sonner'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

interface EditorState {
    addNodeDialogVisible: boolean
    connectModeEnabled: boolean
    connectModeInteraction: InteractionType

    setAddNodeDialogVisible: (visible: boolean) => void
    setConnectMode: (enabled: boolean) => void
    setConnectModeInteraction: (interaction: InteractionType) => void
}

export const useEditorStore = create<EditorState>()(
    combine(
        {
            addNodeDialogVisible: false,
            connectModeEnabled: false,
            connectModeInteraction: 'activation' as InteractionType,
        },
        (set) => ({
            setAddNodeDialogVisible: (visible) =>
                set(() => ({ addNodeDialogVisible: visible })),
            setConnectMode: (enabled) => {
                if (enabled) {
                    toast.info('Switched to Connect Mode', {
                        position: 'top-right',
                        description:
                            'Edges can be created between nodes until this mode gets disabled',
                    })
                } else {
                    toast.info('Switched to Default Mode', {
                        position: 'top-right',
                    })
                }

                set(() => ({ connectModeEnabled: enabled }))
            },
            setConnectModeInteraction: (interaction) => {
                set(() => ({ connectModeInteraction: interaction }))
            },
        })
    )
)
