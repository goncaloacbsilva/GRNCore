import { useHotkeys } from 'react-hotkeys-hook'
import { useElementsActions } from './use-elements-actions'
import { useEditorStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { useHistory } from './use-history'

export function useHotkeysSetup() {
    const {
        copyAction,
        pasteAction,
        duplicateAction,
        cutAction,
        deleteAction,
    } = useElementsActions()
    const { setAddNodeDialogVisible, connectModeEnabled, setConnectMode } =
        useEditorStore(
            useShallow((state) => ({
                setAddNodeDialogVisible: state.setAddNodeDialogVisible,
                connectModeEnabled: state.connectModeEnabled,
                setConnectMode: state.setConnectMode,
            }))
        )
    const { undo, redo } = useHistory()

    // History
    useHotkeys('mod+shift+z', () => redo(), {
        preventDefault: true,
    })

    useHotkeys('mod+z', () => undo(), {
        preventDefault: true,
    })

    // Support Windows delete
    useHotkeys('delete', () => deleteAction(), {
        preventDefault: true,
    })

    useHotkeys('mod+d', () => duplicateAction(), {
        preventDefault: true,
    })

    useHotkeys('mod+c', () => copyAction(), {
        preventDefault: true,
    })

    useHotkeys('mod+v', () => pasteAction(), {
        preventDefault: true,
    })

    useHotkeys('mod+x', () => cutAction(), {
        preventDefault: true,
    })

    useHotkeys(
        'mod+g',
        () => {
            if (!connectModeEnabled) {
                setAddNodeDialogVisible(true)
            }
        },
        { preventDefault: true }
    )

    useHotkeys('mod+e', () => setConnectMode(!connectModeEnabled), {
        preventDefault: true,
    })

    useHotkeys('esc', () => setConnectMode(false), {
        preventDefault: true,
    })
}
