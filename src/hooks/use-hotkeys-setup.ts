import { useHotkeys } from '@tanstack/react-hotkeys'
import { useElementsActions } from './use-elements-actions'
import { useEditorStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { useHistory } from './use-history'
import { useViewActions } from './use-view-actions'

export function useHotkeysSetup() {
    const {
        copyAction,
        pasteAction,
        duplicateAction,
        cutAction,
        deleteAction,
    } = useElementsActions()

    const { resetZoom } = useViewActions()

    const { setAddNodeDialogVisible, connectModeEnabled, setConnectMode } =
        useEditorStore(
            useShallow((state) => ({
                setAddNodeDialogVisible: state.setAddNodeDialogVisible,
                connectModeEnabled: state.connectModeEnabled,
                setConnectMode: state.setConnectMode,
            }))
        )

    const { undo, redo } = useHistory()

    useHotkeys(
        [
            {
                hotkey: 'Mod+0',
                callback: () => resetZoom(),
            },
            {
                hotkey: 'Mod+Z',
                callback: () => undo(),
            },
            {
                hotkey: 'Mod+Shift+Z',
                callback: () => redo(),
            },
            {
                hotkey: 'Backspace',
                callback: () => deleteAction(),
            },
            {
                hotkey: 'Delete',
                callback: () => deleteAction(),
            },
            {
                hotkey: 'Mod+D',
                callback: () => duplicateAction(),
            },
            {
                hotkey: 'Mod+C',
                callback: () => copyAction(),
            },
            {
                hotkey: 'Mod+V',
                callback: () => pasteAction(),
            },
            {
                hotkey: 'Mod+X',
                callback: () => cutAction(),
            },
            {
                hotkey: 'Mod+G',
                callback: () => {
                    if (!connectModeEnabled) {
                        setAddNodeDialogVisible(true)
                    }
                },
            },
            {
                hotkey: 'Mod+E',
                callback: () => setConnectMode(!connectModeEnabled),
            },
            {
                hotkey: 'Escape',
                callback: () => setConnectMode(false),
            },
        ],
        {
            ignoreInputs: true,
            preventDefault: true,
        }
    )
}
