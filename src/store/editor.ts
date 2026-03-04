import { toast } from 'sonner'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

interface EditorState {
    addNodeDialogVisible: boolean
    connectModeEnabled: boolean

    setAddNodeDialogVisible: (visible: boolean) => void
    setConnectMode: (enabled: boolean) => void
}

export const useEditorStore = create<EditorState>()(
    combine(
        {
            addNodeDialogVisible: false,
            connectModeEnabled: false,
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
        })
    )
)
