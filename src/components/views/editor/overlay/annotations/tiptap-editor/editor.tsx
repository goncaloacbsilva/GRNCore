import { CodeHighlightNode, CodeNode } from '@lexical/code'
import {
    AutoFocusExtension,
    DecoratorTextExtension,
    SelectionAlwaysOnDisplayExtension,
} from '@lexical/extension'
import { ClickableLinkExtension, LinkExtension } from '@lexical/link'
import { CheckListExtension, ListExtension } from '@lexical/list'
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'
import { RichTextExtension } from '@lexical/rich-text'
import {
    type EditorState,
    type EditorThemeClasses,
    type SerializedEditorState,
    configExtension,
    defineExtension,
} from 'lexical'
import { useMemo, useState } from 'react'

import { ContentEditable } from '@/components/editor/editor-ui/content-editable'
import { AutoLinkExtension } from '@/components/editor/extensions/auto-link-extension'
import { SpecialTextNode } from '@/components/editor/nodes/special-text-node'
import { CodeActionMenuPlugin } from '@/components/editor/plugins/code-action-menu-plugin'
import { CodeHighlightPlugin } from '@/components/editor/plugins/code-highlight-plugin'
import { FloatingLinkEditorPlugin } from '@/components/editor/plugins/floating-link-editor-plugin'
import { FloatingTextFormatToolbarPlugin } from '@/components/editor/plugins/floating-text-format-plugin'
import { TabFocusPlugin } from '@/components/editor/plugins/tab-focus-plugin'
import { BlockFormatDropDown } from '@/components/editor/plugins/toolbar/block-format-toolbar-plugin'
import { FormatBulletedList } from '@/components/editor/plugins/toolbar/block-format/format-bulleted-list'
import { FormatCheckList } from '@/components/editor/plugins/toolbar/block-format/format-check-list'
import { FormatCodeBlock } from '@/components/editor/plugins/toolbar/block-format/format-code-block'
import { FormatNumberedList } from '@/components/editor/plugins/toolbar/block-format/format-numbered-list'
import { FormatParagraph } from '@/components/editor/plugins/toolbar/block-format/format-paragraph'
import { FormatQuote } from '@/components/editor/plugins/toolbar/block-format/format-quote'
import { CodeLanguageToolbarPlugin } from '@/components/editor/plugins/toolbar/code-language-toolbar-plugin'
import { FontFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/font-format-toolbar-plugin'
import { SubSuperToolbarPlugin } from '@/components/editor/plugins/toolbar/subsuper-toolbar-plugin'
import { ToolbarPlugin } from '@/components/editor/plugins/toolbar/toolbar-plugin'
import { editorTheme } from '@/components/editor/themes/editor-theme'
import { validateUrl } from '@/components/editor/utils/url'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import SpecialTextPlugin from '@/components/editor/plugins/special-text-plugin'
import { EditModeTogglePlugin } from '@/components/editor/plugins/actions/edit-mode-toggle-plugin'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDownIcon } from 'lucide-react'

const placeholder =
    'Insert annotations (e.g., comments, highlights, links, explanations)'

const annotationEditorTheme = {
    ...editorTheme,
    paragraph: 'text-sm leading-5 [&:not(:first-child)]:mt-1',
    quote: 'mt-2 border-l-2 pl-4 italic',
    list: {
        ...editorTheme.list,
        ol: 'm-0 p-0 list-decimal [&>li]:mt-1',
        ul: 'm-0 p-0 list-outside [&>li]:mt-1',
    },
    layoutContainer: 'grid gap-1 my-1 mx-0',
} satisfies EditorThemeClasses

function AnnotationToolbarControls({
    blockType,
    isOpen,
}: {
    blockType: string
    isOpen: boolean
}) {
    const isEditable = useLexicalEditable()

    if (!isEditable) {
        return (
            <div className="group vertical-align-middle sticky top-0 z-10 flex h-10 shrink-0 items-center justify-between gap-2 overflow-auto border-b p-1 w-full">
                <CollapsibleTrigger className="group flex items-center rounded-sm px-2 py-1 text-sm font-medium hover:bg-accent data-[state=open]:bg-accent">
                    <ChevronDownIcon
                        size={18}
                        className="ml-auto group-data-[state=open]:rotate-180"
                    />
                    <h3 className="font-semibold pl-2 ">Model Annotations</h3>
                </CollapsibleTrigger>
                {isOpen ? (
                    <div className="flex items-center gap-2">
                        <EditModeTogglePlugin />
                    </div>
                ) : null}
            </div>
        )
    }

    return (
        <div className="vertical-align-middle sticky top-0 z-10 flex h-10 shrink-0 items-center gap-2 overflow-auto border-b p-1 justify-between">
            <div className="flex items-center gap-2">
                <BlockFormatDropDown>
                    <FormatParagraph />
                    <FormatNumberedList />
                    <FormatBulletedList />
                    <FormatCheckList />
                    <FormatCodeBlock />
                    <FormatQuote />
                </BlockFormatDropDown>
                {blockType === 'code' ? (
                    <CodeLanguageToolbarPlugin />
                ) : (
                    <>
                        <FontFormatToolbarPlugin />
                        <Separator orientation="vertical" className="!h-7" />
                        <SubSuperToolbarPlugin />
                    </>
                )}
            </div>

            <EditModeTogglePlugin />
        </div>
    )
}

export function Editor({
    editorState,
    editorSerializedState,
    onChange,
    onSerializedChange,
}: {
    editorState?: EditorState
    editorSerializedState?: SerializedEditorState
    onChange?: (editorState: EditorState) => void
    onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
}) {
    const [floatingAnchorElem, setFloatingAnchorElem] =
        useState<HTMLDivElement | null>(null)
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState(true)

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem)
        }
    }

    const AppExtension = useMemo(
        () =>
            defineExtension({
                dependencies: [
                    RichTextExtension,
                    AutoFocusExtension,
                    SelectionAlwaysOnDisplayExtension,
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
                $initialEditorState(editor) {
                    if (editorSerializedState) {
                        editor.parseEditorState(editorSerializedState)
                    } else if (editorState) {
                        editor.setEditorState(editorState)
                    }
                },
                theme: annotationEditorTheme,
            }),
        [editorState, editorSerializedState]
    )

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="bg-background flex h-10 w-120 min-h-0 flex-col overflow-hidden rounded-lg border shadow transition-[height] duration-200 ease-out data-[state=open]:h-full"
        >
            <LexicalExtensionComposer
                extension={AppExtension}
                contentEditable={null}
            >
                <TooltipProvider>
                    <div className="relative flex min-h-0 flex-1 flex-col">
                        <ToolbarPlugin>
                            {({ blockType }) => (
                                <AnnotationToolbarControls
                                    blockType={blockType}
                                    isOpen={isOpen}
                                />
                            )}
                        </ToolbarPlugin>
                            <CollapsibleContent
                                forceMount
                                className="min-h-0 overflow-hidden data-[state=closed]:h-0 data-[state=closed]:grow-0 data-[state=closed]:shrink-0 data-[state=open]:flex-1"
                            >
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
                                <CodeActionMenuPlugin
                                    anchorElem={floatingAnchorElem}
                                />
                            </div>
                        </CollapsibleContent>
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
        </Collapsible>
    )
}
