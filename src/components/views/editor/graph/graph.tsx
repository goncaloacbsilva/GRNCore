import type {
    EditableRegulatoryEdge,
    InternalGRNModel,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import {
    applyNodeChanges,
    type NodeChange,
    type Node,
    Background,
    MiniMap,
    Panel,
    ReactFlow,
    SelectionMode,
    useEdgesState,
    useNodesState,
} from '@xyflow/react'
import { useCallback, useRef } from 'react'
import { Toolbar, ZoomControls } from '../overlay'
import type { ControlPoint } from '@/lib/types'

import '@xyflow/react/dist/style.css'
import './elements/regulatory-node-style.css'
import {
    BACKGROUND_COLOR,
    BACKGROUND_DOTS_RADIUS,
    DEFAULT_EDGE_TYPE,
    DEFAULT_NODE_TYPE,
    EDGE_TYPES,
    FIT_VIEW_OPTIONS,
    MINIMAP_NODE_COLOR,
    NODE_TYPES,
    PAN_ON_DRAG,
    PAN_ON_SCROLL,
    SELECTION_ON_DRAG,
} from './config'

interface GraphProps {
    model: InternalGRNModel
}

function importNodes(
    nodes: Node<RegulatoryNodeProperties>[]
): Node<RegulatoryNodeProperties>[] {
    return nodes.map((node) => ({
        ...node,
        type: DEFAULT_NODE_TYPE,
    }))
}

export function Graph({ model }: GraphProps) {
    const [nodes, setNodes] = useNodesState(importNodes(model.nodes))
    const [edges, setEdges, onEdgesChange] = useEdgesState(model.edges)
    const dragPreviousPositionsRef = useRef<
        Map<string, { x: number; y: number }>
    >(new Map())

    const onNodesChange = useCallback(
        (changes: NodeChange<Node<RegulatoryNodeProperties>>[]) => {
            setNodes((prevNodes) => applyNodeChanges(changes, prevNodes))
        },
        [setNodes]
    )

    const onNodeDragStart = useCallback(
        (
            _event: unknown,
            _node: Node<RegulatoryNodeProperties>,
            draggedNodes: Node<RegulatoryNodeProperties>[]
        ) => {
            const selectedDraggedNodes = draggedNodes.filter((n) => n.selected)
            dragPreviousPositionsRef.current = new Map(
                selectedDraggedNodes.map((n) => [n.id, { ...n.position }])
            )
        },
        []
    )

    const onNodeDrag = useCallback(
        (
            _event: unknown,
            _node: Node<RegulatoryNodeProperties>,
            draggedNodes: Node<RegulatoryNodeProperties>[]
        ) => {
            const selectedDraggedNodes = draggedNodes.filter((n) => n.selected)
            if (selectedDraggedNodes.length === 0) {
                return
            }

            const anchorNode = selectedDraggedNodes.find((n) =>
                dragPreviousPositionsRef.current.has(n.id)
            )
            if (!anchorNode) {
                return
            }

            const previous = dragPreviousPositionsRef.current.get(anchorNode.id)
            if (!previous) {
                return
            }

            const dx = anchorNode.position.x - previous.x
            const dy = anchorNode.position.y - previous.y

            if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) {
                return
            }

            const selectedIds = new Set(selectedDraggedNodes.map((n) => n.id))

            setEdges((currentEdges) =>
                currentEdges.map((edge) => {
                    if (
                        !selectedIds.has(String(edge.source)) ||
                        !selectedIds.has(String(edge.target))
                    ) {
                        return edge
                    }

                    const points = edge.data?.points as
                        | ControlPoint[]
                        | undefined
                    if (!points || points.length === 0) {
                        return edge
                    }

                    return {
                        ...edge,
                        data: {
                            ...(edge.data ?? {}),
                            points: points.map((point) => ({
                                ...point,
                                x: point.x + dx,
                                y: point.y + dy,
                            })),
                        } as EditableRegulatoryEdge,
                    }
                })
            )

            dragPreviousPositionsRef.current = new Map(
                selectedDraggedNodes.map((n) => [n.id, { ...n.position }])
            )
        },
        [setEdges]
    )

    const onNodeDragStop = useCallback(() => {
        dragPreviousPositionsRef.current = new Map()
    }, [])

    return (
        <ReactFlow
            proOptions={{
                hideAttribution: true,
            }}
            nodes={nodes}
            onNodesChange={onNodesChange}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            edges={edges}
            onEdgesChange={onEdgesChange}
            panOnScroll={PAN_ON_SCROLL}
            selectionOnDrag={SELECTION_ON_DRAG}
            selectionMode={SelectionMode.Partial}
            elevateEdgesOnSelect
            panOnDrag={PAN_ON_DRAG}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            defaultEdgeOptions={{
                type: DEFAULT_EDGE_TYPE,
                selectable: true,
                focusable: true,
            }}
            fitView
            fitViewOptions={FIT_VIEW_OPTIONS}
        >
            <Background
                color={BACKGROUND_COLOR}
                size={BACKGROUND_DOTS_RADIUS}
            />
            <MiniMap
                style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'clip',
                }}
                nodeColor={MINIMAP_NODE_COLOR}
                zoomable
                pannable
            />
            <Panel position="bottom-left">
                <ZoomControls />
            </Panel>
            <Panel position="top-left">
                <Toolbar />
            </Panel>
        </ReactFlow>
    )
}
