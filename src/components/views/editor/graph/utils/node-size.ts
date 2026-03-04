const MIN_NODE_CONTENT_WIDTH = 50
const NODE_CHAR_WIDTH_ESTIMATE = 8
// Includes inner x-padding plus extra space for borders/rounding and font variance.
const NODE_HORIZONTAL_PADDING = 28

export function getNodeContentMinWidth(name: string): number {
    return Math.max(
        MIN_NODE_CONTENT_WIDTH,
        name.length * NODE_CHAR_WIDTH_ESTIMATE + NODE_HORIZONTAL_PADDING
    )
}
