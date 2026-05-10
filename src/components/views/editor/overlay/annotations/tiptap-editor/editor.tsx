import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoFocusExtension, DecoratorTextExtension } from '@lexical/extension'
import { ClickableLinkExtension, LinkExtension } from '@lexical/link'
import { CheckListExtension, ListExtension } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer'
import {
    createEmptyHistoryState,
    HistoryPlugin,
    type HistoryState,
} from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextExtension } from '@lexical/rich-text'
import {
    type EditorState,
    type SerializedEditorState,
    configExtension,
    defineExtension,
} from 'lexical'
import { useEffect, useMemo, useState } from 'react'

import { AutoLinkExtension } from '@/components/editor/extensions/auto-link-extension'
import { SpecialTextNode } from '@/components/editor/nodes/special-text-node'
import { ToolbarPlugin } from '@/components/editor/plugins/toolbar/toolbar-plugin'
import { validateUrl } from '@/components/editor/utils/url'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AnnotationToolbarControls } from './annotation-toolbar-controls'
import { EditorBody } from './editor-body'
import { annotationEditorTheme } from './editor-theme'
import { EditableModePlugin } from './initial-view-mode-plugin'

interface EditorProps {
    isEditing: boolean
    editorState?: EditorState
    editorSerializedState?: SerializedEditorState
    onChange?: (editorState: EditorState) => void
    onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
}

function AnnotationHistoryPlugin({ isEditing }: { isEditing: boolean }) {
    const [editor] = useLexicalComposerContext()
    const historyStateRef = useMemo<HistoryState>(() => {
        return createEmptyHistoryState()
    }, [])

    useEffect(() => {
        if (!isEditing) {
            return
        }

        historyStateRef.current = {
            editor,
            editorState: editor.getEditorState(),
        }
        historyStateRef.undoStack = []
        historyStateRef.redoStack = []
    }, [editor, historyStateRef, isEditing])

    return <HistoryPlugin externalHistoryState={historyStateRef} />
}

export function Editor({
    isEditing,
    editorState,
    editorSerializedState,
    onChange,
    onSerializedChange,
}: EditorProps) {
    const [floatingAnchorElem, setFloatingAnchorElem] =
        useState<HTMLDivElement | null>(null)
    const [isLinkEditMode, setIsLinkEditMode] = useState(false)

    const AppExtension = useMemo(
        () =>
            defineExtension({
                dependencies: [
                    RichTextExtension,
                    AutoFocusExtension,
                    configExtension(LinkExtension, {
                        validateUrl,
                        attributes: {
                            rel: 'noopener noreferrer',
                            target: '_blank',
                        },
                    }),
                    AutoLinkExtension,
                    ClickableLinkExtension,
                    DecoratorTextExtension,
                    configExtension(ListExtension, {
                        shouldPreserveNumbering: false,
                    }),
                    CheckListExtension,
                ],
                name: '@shadcn-editor',
                namespace: 'Playground',
                nodes: [SpecialTextNode, CodeNode, CodeHighlightNode],
                $initialEditorState: editorSerializedState
                    ? JSON.stringify(editorSerializedState)
                    : editorState,
                theme: annotationEditorTheme,
            }),
        [editorState, editorSerializedState]
    )

    return (
        <LexicalExtensionComposer
            extension={AppExtension}
            contentEditable={null}
        >
            <TooltipProvider>
                <EditableModePlugin isEditing={isEditing} />
                <AnnotationHistoryPlugin isEditing={isEditing} />
                <div className="relative flex h-full min-h-0 flex-col">
                    <ToolbarPlugin>
                        {({ blockType }) => (
                            <AnnotationToolbarControls blockType={blockType} />
                        )}
                    </ToolbarPlugin>
                    <div className="min-h-0 flex-1 overflow-hidden">
                        <EditorBody
                            floatingAnchorElem={floatingAnchorElem}
                            setFloatingAnchorElem={setFloatingAnchorElem}
                            isLinkEditMode={isLinkEditMode}
                            setIsLinkEditMode={setIsLinkEditMode}
                        />
                    </div>
                </div>

                <OnChangePlugin
                    ignoreSelectionChange={true}
                    onChange={(editorState) => {
                        onChange?.(editorState)
                        onSerializedChange?.(editorState.toJSON())
                    }}
                />
            </TooltipProvider>
        </LexicalExtensionComposer>
    )
}
