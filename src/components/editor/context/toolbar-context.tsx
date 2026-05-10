import { type JSX } from 'react'

import type { LexicalEditor } from 'lexical'

import { ToolbarContextValue } from './toolbar-context-value'

export function ToolbarContext({
    activeEditor,
    $updateToolbar,
    blockType,
    setBlockType,
    showModal,
    children,
}: {
    activeEditor: LexicalEditor
    $updateToolbar: () => void
    blockType: string
    setBlockType: (blockType: string) => void
    showModal: (
        title: string,
        showModal: (onClose: () => void) => JSX.Element
    ) => void
    children: React.ReactNode
}) {
    return (
        <ToolbarContextValue.Provider
            value={{
                activeEditor,
                $updateToolbar,
                blockType,
                setBlockType,
                showModal,
            }}
        >
            {children}
        </ToolbarContextValue.Provider>
    )
}
