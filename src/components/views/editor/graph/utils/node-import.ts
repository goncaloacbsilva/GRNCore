import type { Node } from '@xyflow/react'
import type { RegulatoryNodeProperties } from '@/lib/schema'
import {
    DEFAULT_NODE_HEIGHT,
    DEFAULT_NODE_TYPE,
} from '../config'
import { getNodeContentMinWidth } from './node-size'

export function normalizeRegulatoryNodes(
    nodes: Node<RegulatoryNodeProperties>[]
): Node<RegulatoryNodeProperties>[] {
    return nodes.map((node) => ({
        ...node,
        type: DEFAULT_NODE_TYPE,
        style: {
            width:
                node.style?.width ??
                getNodeContentMinWidth(String(node.data?.name ?? '')),
            height: node.style?.height ?? DEFAULT_NODE_HEIGHT,
            ...node.style,
        },
    }))
}
