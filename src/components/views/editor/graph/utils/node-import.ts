import type { Node } from '@xyflow/react'
import type { RegulatoryNodeProperties } from '@/lib/schema'
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_TYPE } from '../config'
import { getNodeContentMinWidth } from './node-size'
import {
    getRegulatoryNodeBackgroundColor,
    getRegulatoryNodeBorderColor,
    NODE_BACKGROUND_COLOR_STYLE_PROPERTY,
    NODE_BORDER_COLOR_STYLE_PROPERTY,
    type RegulatoryNodeStyle,
} from '../node-style'

export function normalizeRegulatoryNodes(
    nodes: Node<RegulatoryNodeProperties>[]
): Node<RegulatoryNodeProperties>[] {
    return nodes.map((node) => {
        const style = { ...node.style }
        delete style.backgroundColor
        delete style.borderColor

        return {
            ...node,
            type: DEFAULT_NODE_TYPE,
            style: {
                width:
                    node.style?.width ??
                    getNodeContentMinWidth(String(node.data?.name ?? '')),
                height: node.style?.height ?? DEFAULT_NODE_HEIGHT,
                ...style,
                [NODE_BACKGROUND_COLOR_STYLE_PROPERTY]:
                    getRegulatoryNodeBackgroundColor(node.style),
                [NODE_BORDER_COLOR_STYLE_PROPERTY]:
                    getRegulatoryNodeBorderColor(node.style),
            } satisfies RegulatoryNodeStyle,
        }
    })
}
