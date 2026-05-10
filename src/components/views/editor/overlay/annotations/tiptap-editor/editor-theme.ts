import { type EditorThemeClasses } from 'lexical'

import { editorTheme } from '@/components/editor/themes/editor-theme'

export const placeholder =
    'Insert annotations (e.g., comments, highlights, links, explanations)'

export const annotationEditorTheme = {
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
