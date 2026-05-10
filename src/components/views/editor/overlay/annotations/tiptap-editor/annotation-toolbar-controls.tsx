import { useLexicalEditable } from '@lexical/react/useLexicalEditable'

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
import { Separator } from '@/components/ui/separator'

export function AnnotationToolbarControls({
    blockType,
}: {
    blockType: string
}) {
    const isEditable = useLexicalEditable()

    if (!isEditable) {
        return null
    }

    return (
        <div className="vertical-align-middle sticky top-0 z-10 flex h-10 shrink-0 items-center justify-between gap-2 overflow-auto border-b p-1">
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
        </div>
    )
}
