import { create } from 'zustand'
import { combine } from 'zustand/middleware'

interface EditorState {
    addNodeDialogVisible: boolean

    setAddNodeDialogVisible: (visible: boolean) => void
}

export const useEditorStore = create<EditorState>()(
    combine(
        {
            addNodeDialogVisible: false,
        },
        (set) => ({
            setAddNodeDialogVisible: (visible: boolean) =>
                set(() => ({ addNodeDialogVisible: visible })),
        })
    )
)
