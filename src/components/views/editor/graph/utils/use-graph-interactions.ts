import { useCallback, useRef } from 'react'
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Connection,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    type OnConnectStartParams,
} from '@xyflow/react'
import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { nanoid } from 'nanoid'
import {
    buildEdgeAdjacencyMap,
    buildEdgeIndexById,
    getNodeDragDelta,
    mapDraggedNodePositions,
    shiftDraggedEdgePoints,
} from './node-drag'
import { useEditorStore } from '@/store'

type RegulatoryNode = Node<RegulatoryNodeProperties>
type RegulatoryEdge = Edge<EditableRegulatoryEdge>

type SetNodes = (
    payload: RegulatoryNode[] | ((nodes: RegulatoryNode[]) => RegulatoryNode[])
) => void
type SetEdges = (
    payload: RegulatoryEdge[] | ((edges: RegulatoryEdge[]) => RegulatoryEdge[])
) => void

function getEventClientPoint(
    event: MouseEvent | TouchEvent
): { x: number; y: number } | null {
    if ('changedTouches' in event) {
        const touch = event.changedTouches[0]
        if (!touch) {
            return null
        }

        return { x: touch.clientX, y: touch.clientY }
    }

    return { x: event.clientX, y: event.clientY }
}

export function useGraphInteractions({
    setNodes,
    setEdges,
    initialEdges,
    onSelectionOnlyChange,
}: {
    setNodes: SetNodes
    setEdges: SetEdges
    initialEdges: RegulatoryEdge[]
    onSelectionOnlyChange: () => void
}) {
    const dragPreviousPositionsRef = useRef<
        Map<string, { x: number; y: number }>
    >(new Map())
    const edgeAdjacencyRef = useRef(buildEdgeAdjacencyMap(initialEdges))
    const edgeIndexByIdRef = useRef(buildEdgeIndexById(initialEdges))
    const connectionStartNodeIdRef = useRef<string | null>(null)
    const connectionCreatedRef = useRef(false)
    const connectionInteraction = useEditorStore(
        (state) => state.connectModeInteraction
    )
    const popSelectedNodeId = useEditorStore((state) => state.popSelectedNodeId)
    const bumpSemanticRevision = useEditorStore(
        (state) => state.bumpSemanticRevision
    )

    const onNodesChange = useCallback(
        (changes: NodeChange<RegulatoryNode>[]) => {
            if (
                changes.length > 0 &&
                changes.every((change) => change.type === 'select')
            ) {
                onSelectionOnlyChange()
            }

            if (
                changes.some(
                    (change) =>
                        change.type !== 'select' &&
                        change.type !== 'position' &&
                        change.type !== 'dimensions'
                )
            ) {
                bumpSemanticRevision()
            }

            // Make sure we exclude the node from the selected node list
            changes.forEach((change) => {
                if (change.type == 'remove') {
                    popSelectedNodeId(change.id)
                }
            })

            setNodes((prevNodes) => applyNodeChanges(changes, prevNodes))
        },
        [
            bumpSemanticRevision,
            onSelectionOnlyChange,
            setNodes,
            popSelectedNodeId,
        ]
    )

    const onEdgesChange = useCallback(
        (changes: EdgeChange<RegulatoryEdge>[]) => {
            if (
                changes.length > 0 &&
                changes.every((change) => change.type === 'select')
            ) {
                onSelectionOnlyChange()
            }

            const hasStructuralChanges = changes.some(
                (change) => change.type !== 'select'
            )
            if (hasStructuralChanges) bumpSemanticRevision()

            setEdges((prevEdges) => {
                const nextEdges = applyEdgeChanges(changes, prevEdges)
                if (hasStructuralChanges) {
                    edgeAdjacencyRef.current = buildEdgeAdjacencyMap(nextEdges)
                    edgeIndexByIdRef.current = buildEdgeIndexById(nextEdges)
                }
                return nextEdges
            })
        },
        [bumpSemanticRevision, onSelectionOnlyChange, setEdges]
    )

    const onNodeDragStart = useCallback(
        (
            _event: unknown,
            _node: RegulatoryNode,
            draggedNodes: RegulatoryNode[]
        ) => {
            dragPreviousPositionsRef.current =
                mapDraggedNodePositions(draggedNodes)
        },
        []
    )

    const onNodeDrag = useCallback(
        (
            _event: unknown,
            _node: RegulatoryNode,
            draggedNodes: RegulatoryNode[]
        ) => {
            const dragDelta = getNodeDragDelta({
                draggedNodes,
                previousPositions: dragPreviousPositionsRef.current,
            })
            if (!dragDelta) {
                return
            }

            const draggedIds = new Set(draggedNodes.map((n) => n.id))

            setEdges((currentEdges) =>
                shiftDraggedEdgePoints({
                    edges: currentEdges,
                    draggedNodeIds: draggedIds,
                    delta: dragDelta,
                    adjacency: edgeAdjacencyRef.current,
                    edgeIndexById: edgeIndexByIdRef.current,
                })
            )

            dragPreviousPositionsRef.current =
                mapDraggedNodePositions(draggedNodes)
        },
        [setEdges]
    )

    const onNodeDragStop = useCallback(() => {
        dragPreviousPositionsRef.current = new Map()
    }, [])

    const onConnectStart = useCallback(
        (_event: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
            connectionStartNodeIdRef.current = params.nodeId
            connectionCreatedRef.current = false
        },
        []
    )

    const onConnect = useCallback(
        (params: Connection) => {
            connectionCreatedRef.current = true
            setEdges((eds) => {
                const nextEdges = addEdge(
                    {
                        ...params,
                        data: {
                            levels: [
                                {
                                    id: nanoid(),
                                    type: connectionInteraction,
                                    target: 1,
                                    isValid: true,
                                },
                            ],
                        },
                    },
                    eds
                )
                edgeAdjacencyRef.current = buildEdgeAdjacencyMap(nextEdges)
                edgeIndexByIdRef.current = buildEdgeIndexById(nextEdges)
                return nextEdges
            })
            bumpSemanticRevision()
        },
        [bumpSemanticRevision, setEdges, connectionInteraction]
    )

    const onConnectEnd = useCallback(
        (event: MouseEvent | TouchEvent) => {
            const startNodeId = connectionStartNodeIdRef.current
            if (!startNodeId || connectionCreatedRef.current) {
                connectionStartNodeIdRef.current = null
                connectionCreatedRef.current = false
                return
            }

            const clientPoint = getEventClientPoint(event)
            const dropTargetNode = clientPoint
                ? (document
                      .elementFromPoint(clientPoint.x, clientPoint.y)
                      ?.closest('.react-flow__node')
                      ?.getAttribute('data-id') ?? null)
                : null

            if (dropTargetNode === startNodeId) {
                setEdges((eds) => {
                    const nextEdges = addEdge(
                        {
                            source: startNodeId,
                            target: startNodeId,
                            sourceHandle: null,
                            targetHandle: null,
                        },
                        eds
                    )
                    edgeAdjacencyRef.current = buildEdgeAdjacencyMap(nextEdges)
                    edgeIndexByIdRef.current = buildEdgeIndexById(nextEdges)
                    return nextEdges
                })
                bumpSemanticRevision()
            }

            connectionStartNodeIdRef.current = null
            connectionCreatedRef.current = false
        },
        [bumpSemanticRevision, setEdges]
    )

    return {
        onNodesChange,
        onNodeDragStart,
        onNodeDrag,
        onNodeDragStop,
        onConnectStart,
        onConnect,
        onConnectEnd,
        onEdgesChange,
    }
}
