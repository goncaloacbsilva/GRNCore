import type { CSSProperties } from 'react'

export const DEFAULT_NODE_FOREGROUND_COLOR = '#000000'
export const DEFAULT_NODE_BACKGROUND_COLOR = '#ffffff'
export const DEFAULT_NODE_BORDER_COLOR = '#E2E8F0'
export const NODE_BACKGROUND_COLOR_STYLE_PROPERTY =
    '--grn-node-background-color'
export const NODE_BORDER_COLOR_STYLE_PROPERTY = '--grn-node-border-color'

export type RegulatoryNodeStyle = CSSProperties &
    Partial<
        Record<
            | typeof NODE_BACKGROUND_COLOR_STYLE_PROPERTY
            | typeof NODE_BORDER_COLOR_STYLE_PROPERTY,
            string
        >
    >

export function getRegulatoryNodeBackgroundColor(
    style: CSSProperties | undefined
) {
    const regulatoryStyle = style as RegulatoryNodeStyle | undefined
    const customBackgroundColor =
        regulatoryStyle?.[NODE_BACKGROUND_COLOR_STYLE_PROPERTY]

    if (typeof customBackgroundColor === 'string') {
        return customBackgroundColor
    }

    if (typeof style?.backgroundColor === 'string') {
        return style.backgroundColor
    }

    return DEFAULT_NODE_BACKGROUND_COLOR
}

export function getRegulatoryNodeBorderColor(style: CSSProperties | undefined) {
    const regulatoryStyle = style as RegulatoryNodeStyle | undefined
    const customBorderColor =
        regulatoryStyle?.[NODE_BORDER_COLOR_STYLE_PROPERTY]

    if (typeof customBorderColor === 'string') {
        return customBorderColor
    }

    if (typeof style?.borderColor === 'string') {
        return style.borderColor
    }

    return DEFAULT_NODE_BORDER_COLOR
}
