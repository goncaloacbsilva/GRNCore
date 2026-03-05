import type { ReactFlowInstance, Node, Edge } from '@xyflow/react'
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
import { DEFAULT_NODE_HEIGHT } from '@/components/views/editor/graph/config'

const COPY_OFFSET = 10

export function getSelected({
    getNodes,
    getEdges,
}: ReactFlowInstance): InternalGRNModel {
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
            nodeIds.has(edge.source) &&
            nodeIds.has(edge.target)
    ) as Edge<EditableRegulatoryEdge>[]

    return {
        nodes,
        edges,
    }
}

export function pasteModel(
    model: InternalGRNModel,
    { addNodes, addEdges }: ReactFlowInstance
) {
    const newNodes: Record<
        string,
        Node<RegulatoryNodeProperties>
    > = Object.fromEntries(
        model.nodes.map((node) => [node.id, createNodeCopy(node)])
    )

    const newEdges = model.edges.map((edge) => createEdgeCopy(edge, newNodes))

    addNodes(Object.values(newNodes))
    if (newEdges.length > 0) {
        addEdges(newEdges)
    }
}

const createNodeCopy = (
    node: Node<RegulatoryNodeProperties>
): Node<RegulatoryNodeProperties> => ({
    id: v4(),
    position: {
        x: node.position.x - COPY_OFFSET,
        y: node.position.y - COPY_OFFSET,
    },
    width: getNodeContentMinWidth(node.data.name),
    height: DEFAULT_NODE_HEIGHT,
    type: node.type,
    data: node.data,
    selected: true,
})

const createEdgeCopy = (
    edge: Edge<EditableRegulatoryEdge>,
    newNodes: Record<string, Node<RegulatoryNodeProperties>>
): Edge<EditableRegulatoryEdge> => ({
    ...edge,
    id: v4(),
    source: newNodes[edge.source]?.id ?? edge.source,
    target: newNodes[edge.target]?.id ?? edge.target,
    selected: true,
    data: {
        type: edge.data?.type ?? 'activation',
        target: edge.data?.target ?? 1,
        ...edge.data,
        points: edge.data?.points?.map((point) => ({
            ...point,
            id: createId(),
            x: point.x - COPY_OFFSET,
            y: point.y - COPY_OFFSET,
        })),
    },
})
