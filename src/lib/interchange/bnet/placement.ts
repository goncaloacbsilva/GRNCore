import { findNextNodePosition } from '@/components/views/editor/graph/utils/node-placement'
import { getNodeContentMinWidth } from '@/components/views/editor/graph/utils/node-size'
import type { RegulatoryNodeProperties } from '@/lib/schema'
import type { Node } from '@xyflow/react'

const DEFAULT_NODE_HEIGHT = 35
const NODE_PLACEMENT_OFFSET = {
    x: 300,
    y: 200,
} as const

export function assignNodePositions(
    nodes: Node<RegulatoryNodeProperties>[]
): Node<RegulatoryNodeProperties>[] {
    const positionedNodes: Node<RegulatoryNodeProperties>[] = []

    for (const node of nodes) {
        const width = getNodeContentMinWidth(node.data.name)
        const position = findNextNodePosition({
            basePosition: NODE_PLACEMENT_OFFSET,
            width,
            height: DEFAULT_NODE_HEIGHT,
            nodes: positionedNodes,
            edges: [],
        })

        positionedNodes.push({
            ...node,
            position,
        })
    }

    return positionedNodes
}
