import { DEFAULT_NODE_HEIGHT } from '@/components/views/editor/graph/config'
import {
    createId,
    getNodeContentMinWidth,
} from '@/components/views/editor/graph/utils'
import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { useReactFlow, useStore, type Edge, type Node } from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import { v4 } from 'uuid'

const COPY_OFFSET = 10

export function useNodesActions(nodeIds: string[]) {
    const { getNode, deleteElements, addNodes, addEdges, getEdges } =
        useReactFlow()
    const { triggerNodeChanges, triggerEdgeChanges } = useStore(
        useShallow((state) => ({
            triggerNodeChanges: state.triggerNodeChanges,
            triggerEdgeChanges: state.triggerEdgeChanges,
        }))
    )

    return {
        deleteNode: () =>
            void deleteElements({
                nodes: nodeIds.map((id: string) => ({ id })),
            }),
        duplicateNode: () => {
            const selectedEdges = getEdges().filter(
                (edge) => edge.selected
            ) as Edge<EditableRegulatoryEdge>[]

            triggerNodeChanges(
                nodeIds.map((id) => ({
                    id,
                    type: 'select',
                    selected: false,
                }))
            )

            triggerEdgeChanges(
                selectedEdges.map((edge) => ({
                    id: edge.id,
                    type: 'select',
                    selected: false,
                }))
            )

            const existingNodes = nodeIds
                .map((id) => getNode(id) as Node<RegulatoryNodeProperties>)
                .filter((node): node is Node<RegulatoryNodeProperties> =>
                    Boolean(node)
                )

            // Stop if it's not able to get some node
            if (existingNodes.length !== nodeIds.length) return

            // Create node copies index
            const newNodes: Record<
                string,
                Node<RegulatoryNodeProperties>
            > = Object.fromEntries(
                existingNodes.map((node) => [
                    node.id,
                    {
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
                    },
                ])
            )

            const duplicatedNodes = Object.values(newNodes)

            // Create edge copies
            const newEdges: Edge<EditableRegulatoryEdge>[] = selectedEdges
                .filter(
                    (edge) =>
                        nodeIds.includes(edge.source) &&
                        nodeIds.includes(edge.target)
                )
                .map((edge) => ({
                    ...edge,
                    id: v4(),
                    source: newNodes[edge.source]?.id ?? edge.source,
                    target: newNodes[edge.target]?.id ?? edge.target,
                    selected: true,
                    data: {
                        ...edge.data,
                        points: edge.data?.points?.map((point) => ({
                            ...point,
                            id: createId(),
                            x: point.x - COPY_OFFSET,
                            y: point.y - COPY_OFFSET,
                        })),
                    },
                }))

            addNodes(duplicatedNodes)
            if (newEdges.length > 0) {
                addEdges(newEdges)
            }
        },
    }
}
