import type { CSSProperties } from 'react'

export const DEFAULT_NODE_FOREGROUND_COLOR = '#000000'
export const DEFAULT_NODE_BACKGROUND_COLOR = '#ffffff'
export const DEFAULT_NODE_BORDER_COLOR = '#E2E8F0'
export const DEFAULT_NODE_SHAPE = 'rounded-rectangle'
export const NODE_BACKGROUND_COLOR_STYLE_PROPERTY =
    '--grn-node-background-color'
export const NODE_BORDER_COLOR_STYLE_PROPERTY = '--grn-node-border-color'
export const NODE_SHAPE_STYLE_PROPERTY = '--grn-node-shape'

export type RegulatoryNodeShape = 'rectangle' | 'rounded-rectangle' | 'ellipse'

export type RegulatoryNodeStyle = CSSProperties &
    Partial<
        Record<
            | typeof NODE_BACKGROUND_COLOR_STYLE_PROPERTY
            | typeof NODE_BORDER_COLOR_STYLE_PROPERTY,
            string
        >
    > & {
        [NODE_SHAPE_STYLE_PROPERTY]?: RegulatoryNodeShape
    }

export function getRegulatoryNodeBackgroundColor(
    style: RegulatoryNodeStyle | undefined
) {
    const customBackgroundColor = style?.[NODE_BACKGROUND_COLOR_STYLE_PROPERTY]

    if (typeof customBackgroundColor === 'string') {
        return customBackgroundColor
    }

    if (typeof style?.backgroundColor === 'string') {
        return style.backgroundColor
    }

    return DEFAULT_NODE_BACKGROUND_COLOR
}

export function getRegulatoryNodeBorderColor(
    style: RegulatoryNodeStyle | undefined
) {
    const customBorderColor = style?.[NODE_BORDER_COLOR_STYLE_PROPERTY]

    if (typeof customBorderColor === 'string') {
        return customBorderColor
    }

    if (typeof style?.borderColor === 'string') {
        return style.borderColor
    }

    return DEFAULT_NODE_BORDER_COLOR
}

export function getRegulatoryNodeShape(
    style: RegulatoryNodeStyle | undefined
): RegulatoryNodeShape {
    const customShape = style?.[NODE_SHAPE_STYLE_PROPERTY]

    if (
        customShape === 'rectangle' ||
        customShape === 'rounded-rectangle' ||
        customShape === 'ellipse'
    ) {
        return customShape
    }

    return DEFAULT_NODE_SHAPE
}
