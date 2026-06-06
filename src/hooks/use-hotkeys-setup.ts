import { useHotkeys } from '@tanstack/react-hotkeys'
import { useElementsActions } from './use-elements-actions'
import { useEditorStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { useHistory } from './use-history'
import { useViewActions } from './use-view-actions'
import { useStore } from '@xyflow/react'

export function useHotkeysSetup() {
    const {
        copyAction,
        pasteAction,
        duplicateAction,
        cutAction,
        deleteAction,
    } = useElementsActions()

    const { resetZoom } = useViewActions()
    const { selectedNodesCount, selectedEdgesCount } = useStore((state) => ({
        selectedNodesCount: state.nodes.filter((node) => node.selected).length,
        selectedEdgesCount: state.edges.filter((edge) => edge.selected).length,
    }))

    const {
        setAddNodeDialogVisible,
        connectModeEnabled,
        setConnectMode,
        setMenuSheetTab,
    } = useEditorStore(
        useShallow((state) => ({
            setAddNodeDialogVisible: state.setAddNodeDialogVisible,
            connectModeEnabled: state.connectModeEnabled,
            setConnectMode: state.setConnectMode,
            setMenuSheetTab: state.setMenuSheetTab,
        }))
    )

    const { undo, redo } = useHistory()

    const focusSelectedNodeNameField = () => {
        if (selectedNodesCount !== 1 || selectedEdgesCount !== 0) {
            return
        }

        setMenuSheetTab('base')

        requestAnimationFrame(() => {
            const nameInput = document.querySelector<HTMLInputElement>(
                '[data-element-properties-menu="true"] input[name="name"]'
            )

            if (!nameInput) {
                return
            }

            nameInput.focus()
            nameInput.select()
        })
    }

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
            {
                hotkey: 'F2',
                callback: () => focusSelectedNodeNameField(),
            },
        ],
        {
            ignoreInputs: true,
            preventDefault: true,
        }
    )
}
