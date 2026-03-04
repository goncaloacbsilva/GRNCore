import type { InternalGRNModel, RegulatoryNodeProperties } from '@/lib/schema'
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
    addEdge,
    type Connection,
} from '@xyflow/react'
import { useCallback, useRef } from 'react'
import { Toolbar, ZoomControls } from '../overlay'

import '@xyflow/react/dist/style.css'
import './elements/regulatory-node-style.css'
import {
    BACKGROUND_COLOR,
    BACKGROUND_DOTS_RADIUS,
    CONNECTION_LINE_COMPONENT,
    DEFAULT_EDGE_TYPE,
    DEFAULT_NODE_HEIGHT,
    DEFAULT_NODE_TYPE,
    EDGE_TYPES,
    FIT_VIEW_OPTIONS,
    MINIMAP_NODE_COLOR,
    NODE_TYPES,
    PAN_ON_DRAG,
    PAN_ON_SCROLL,
    SELECTION_ON_DRAG,
} from './config'
import {
    getNodeDragDelta,
    getNodeContentMinWidth,
    mapDraggedNodePositions,
    shiftDraggedEdgePoints,
} from './utils'

interface GraphProps {
    model: InternalGRNModel
}

function importNodes(
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
            dragPreviousPositionsRef.current =
                mapDraggedNodePositions(draggedNodes)
        },
        []
    )

    const onNodeDrag = useCallback(
        (
            _event: unknown,
            _node: Node<RegulatoryNodeProperties>,
            draggedNodes: Node<RegulatoryNodeProperties>[]
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

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

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
            connectionLineComponent={CONNECTION_LINE_COMPONENT}
            onConnect={onConnect}
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
