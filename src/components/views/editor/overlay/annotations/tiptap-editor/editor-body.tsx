import { type Dispatch, type SetStateAction } from 'react'

import { ContentEditable } from '@/components/editor/editor-ui/content-editable'
import { CodeActionMenuPlugin } from '@/components/editor/plugins/code-action-menu-plugin'
import { CodeHighlightPlugin } from '@/components/editor/plugins/code-highlight-plugin'
import { FloatingLinkEditorPlugin } from '@/components/editor/plugins/floating-link-editor-plugin'
import { FloatingTextFormatToolbarPlugin } from '@/components/editor/plugins/floating-text-format-plugin'
import SpecialTextPlugin from '@/components/editor/plugins/special-text-plugin'
import { TabFocusPlugin } from '@/components/editor/plugins/tab-focus-plugin'
import { placeholder } from './editor-theme'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'

export function EditorBody({
    floatingAnchorElem,
    setFloatingAnchorElem,
    isLinkEditMode,
    setIsLinkEditMode,
}: {
    floatingAnchorElem: HTMLDivElement | null
    setFloatingAnchorElem: Dispatch<SetStateAction<HTMLDivElement | null>>
    isLinkEditMode: boolean
    setIsLinkEditMode: Dispatch<SetStateAction<boolean>>
}) {
    const onRef = (element: HTMLDivElement) => {
        if (element !== null) {
            setFloatingAnchorElem(element)
        }
    }

    return (
        <div className="relative flex h-full min-h-0 flex-1 flex-col">
            <div className="h-full min-h-0">
                <div className="h-full min-h-0" ref={onRef}>
                    <ContentEditable
                        placeholder={placeholder}
                        className="h-full !min-h-0 overflow-y-auto pl-4 text-sm leading-5"
                        placeholderClassName="text-sm leading-5"
                    />
                </div>
            </div>
            <SpecialTextPlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <CodeHighlightPlugin />
            <FloatingTextFormatToolbarPlugin
                anchorElem={floatingAnchorElem}
                setIsLinkEditMode={setIsLinkEditMode}
            />
            <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
            />
            <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
        </div>
    )
}
