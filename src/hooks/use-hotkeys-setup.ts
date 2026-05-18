import { useHotkeys } from 'react-hotkeys-hook'
import { useElementsActions } from './use-elements-actions'
import { useEditorStore } from '@/store'
import { useShallow } from 'zustand/react/shallow'
import { useHistory } from './use-history'
import { useEffect } from 'react'

function isEditableHotkeyTarget(event: KeyboardEvent) {
    const editableSelector =
        'input, textarea, select, [contenteditable="true"], [data-lexical-editor="true"]'
    const eventPath = event.composedPath()

    if (
        eventPath.some(
            (target) =>
                target instanceof HTMLElement &&
                (target.matches(editableSelector) ||
                    target.isContentEditable ||
                    Boolean(target.closest(editableSelector)))
        )
    ) {
        return true
    }

    const activeElement = document.activeElement

    return (
        activeElement instanceof HTMLElement &&
        (activeElement.matches(editableSelector) ||
            activeElement.isContentEditable ||
            Boolean(activeElement.closest(editableSelector)))
    )
}

function shouldHandleGlobalHotkey(event: KeyboardEvent) {
    return !isEditableHotkeyTarget(event)
}

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

    // History: use a native listener to avoid mod+z / mod+shift+z parsing edge-cases.
    useEffect(() => {
        const handleHistoryHotkeys = (event: KeyboardEvent) => {
            if (event.defaultPrevented) {
                return
            }

            const isModPressed = event.metaKey || event.ctrlKey
            if (!isModPressed || event.altKey) {
                return
            }

            if (event.key.toLowerCase() !== 'z') {
                return
            }

            if (!shouldHandleGlobalHotkey(event)) {
                return
            }

            event.preventDefault()

            if (event.shiftKey) {
                redo()
                return
            }

            undo()
        }

        document.addEventListener('keydown', handleHistoryHotkeys)
        return () => {
            document.removeEventListener('keydown', handleHistoryHotkeys)
        }
    }, [undo, redo])

    // Support Windows delete
    useHotkeys(
        'delete',
        (event) => {
            if (isEditableHotkeyTarget(event)) {
                return
            }

            deleteAction()
        },
        {
            preventDefault: shouldHandleGlobalHotkey,
        }
    )

    useHotkeys(
        'mod+d',
        (event) => {
            if (isEditableHotkeyTarget(event)) {
                return
            }

            duplicateAction()
        },
        {
            preventDefault: shouldHandleGlobalHotkey,
        }
    )

    useHotkeys(
        'mod+c',
        (event) => {
            if (isEditableHotkeyTarget(event)) {
                return
            }

            copyAction()
        },
        {
            preventDefault: shouldHandleGlobalHotkey,
        }
    )

    useHotkeys(
        'mod+v',
        (event) => {
            if (isEditableHotkeyTarget(event)) {
                return
            }

            pasteAction()
        },
        {
            preventDefault: shouldHandleGlobalHotkey,
        }
    )

    useHotkeys(
        'mod+x',
        (event) => {
            if (isEditableHotkeyTarget(event)) {
                return
            }

            cutAction()
        },
        {
            preventDefault: shouldHandleGlobalHotkey,
        }
    )

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
