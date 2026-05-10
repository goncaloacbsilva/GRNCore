import { type JSX, createContext, useContext } from 'react'

import type { LexicalEditor } from 'lexical'

export const ToolbarContextValue = createContext<{
    activeEditor: LexicalEditor
    $updateToolbar: () => void
    blockType: string
    setBlockType: (blockType: string) => void
    showModal: (
        title: string,
        showModal: (onClose: () => void) => JSX.Element
    ) => void
}>({
    activeEditor: {} as LexicalEditor,
    $updateToolbar: () => {
        /* empty */
    },
    blockType: 'paragraph',
    setBlockType: () => {
        /* empty */
    },
    showModal: () => {
        /* empty */
    },
})

export function useToolbarContext() {
    return useContext(ToolbarContextValue)
}
