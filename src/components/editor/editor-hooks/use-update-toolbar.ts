import { useEffect } from 'react'

import {
    $getSelection,
    type BaseSelection,
    COMMAND_PRIORITY_CRITICAL,
    SELECTION_CHANGE_COMMAND,
} from 'lexical'

import { useToolbarContext } from '@/components/editor/context/toolbar-context-value'

export function useUpdateToolbarHandler(
    callback: (selection: BaseSelection) => void
) {
    const { activeEditor } = useToolbarContext()

    useEffect(() => {
        return activeEditor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                activeEditor.getEditorState().read(
                    () => {
                        const selection = $getSelection()
                        if (selection) {
                            callback(selection)
                        }
                    },
                    { editor: activeEditor }
                )
                return false
            },
            COMMAND_PRIORITY_CRITICAL
        )
    }, [activeEditor, callback])

    useEffect(() => {
        activeEditor.getEditorState().read(
            () => {
                const selection = $getSelection()
                if (selection) {
                    callback(selection)
                }
            },
            { editor: activeEditor }
        )
    }, [activeEditor, callback])
}
