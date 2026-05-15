import type { ReactFlowInstance, Node, Edge, XYPosition } from '@xyflow/react'
import type {
    EditableRegulatoryEdge,
    InternalGRNModel,
    RegulatoryNodeProperties,
} from '../schema'
import { v4 } from 'uuid'
import {
    createId,
    getNodeContentMinWidth,
} from '@/components/views/editor/graph/utils'
import {
    DEFAULT_NODE_HEIGHT,
    NODE_PLACEMENT_OFFSET,
} from '@/components/views/editor/graph/config'

export function getSelected(
    { getNodes, getEdges }: ReactFlowInstance,
    isDeleteAction = false
): InternalGRNModel {
    const nodeIds = new Set<string>()

    const nodes = getNodes().filter((node) => {
        if (node.selected) {
            nodeIds.add(node.id)
        }

        return node.selected
    }) as Node<RegulatoryNodeProperties>[]

    // Only get edges that connect selected nodes
    const edges = getEdges().filter(
        (edge) =>
            edge.selected &&
            // If no nodes are selected and it's a delete action, allow selecting edges as well
            ((isDeleteAction && nodes.length === 0) ||
                (nodeIds.has(edge.source) && nodeIds.has(edge.target)))
    ) as Edge<EditableRegulatoryEdge>[]

    return {
        title: 'Selection',
        nodes,
        edges,
    }
}

export function pasteModel(
    model: InternalGRNModel,
    { addNodes, addEdges }: ReactFlowInstance,
    basePosition: XYPosition = { x: -10, y: -10 }
) {
    const newNodes: Record<
        string,
        Node<RegulatoryNodeProperties>
    > = Object.fromEntries(
        model.nodes.map((node) => [node.id, createNodeCopy(node, basePosition)])
    )

    const newEdges = model.edges.map((edge) =>
        createEdgeCopy(edge, newNodes, basePosition)
    )

    addNodes(Object.values(newNodes))
    if (newEdges.length > 0) {
        addEdges(newEdges)
    }
}

export const getBasePosition = (
    screenToFlowPosition: (
        clientPosition: XYPosition,
        options?: {
            snapToGrid: boolean
        }
    ) => XYPosition,
    domNode?: HTMLDivElement | null
): XYPosition => ({
    // Place new nodes at a consistent position in the viewport, respecting pan/zoom.
    ...(domNode
        ? screenToFlowPosition({
              x: domNode.getBoundingClientRect().left + NODE_PLACEMENT_OFFSET.x,
              y: domNode.getBoundingClientRect().top + NODE_PLACEMENT_OFFSET.y,
          })
        : screenToFlowPosition({ x: 10, y: 50 })),
})

const createNodeCopy = (
    node: Node<RegulatoryNodeProperties>,
    offset: XYPosition
): Node<RegulatoryNodeProperties> => ({
    id: v4(),
    position: {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y,
    },
    width: getNodeContentMinWidth(node.data.name),
    height: DEFAULT_NODE_HEIGHT,
    type: node.type,
    data: node.data,
    selected: true,
})

const createEdgeCopy = (
    edge: Edge<EditableRegulatoryEdge>,
    newNodes: Record<string, Node<RegulatoryNodeProperties>>,
    offset: XYPosition
): Edge<EditableRegulatoryEdge> => ({
    ...edge,
    id: v4(),
    source: newNodes[edge.source]?.id ?? edge.source,
    target: newNodes[edge.target]?.id ?? edge.target,
    selected: true,
    data: {
        ...edge.data,
        levels:
            edge.data?.levels.map((level) => ({
                ...level,
                id: createId(),
            })) ?? [],
        points: edge.data?.points?.map((point) => ({
            ...point,
            id: createId(),
            x: point.x + offset.x,
            y: point.y + offset.y,
        })),
    },
})
