import type { EditableRegulatoryEdge, InternalGRNModel } from '@/lib/schema'
import {
    type Edge,
    Background,
    MiniMap,
    Panel,
    ReactFlow,
    SelectionMode,
    useEdgesState,
    useNodesState,
} from '@xyflow/react'
import { Toolbar, ZoomControls } from '../overlay'

import '@xyflow/react/dist/style.css'
import './elements/regulatory-node-style.css'
import {
    BACKGROUND_COLOR,
    BACKGROUND_DOTS_RADIUS,
    CONNECTION_LINE_COMPONENT,
    DEFAULT_EDGE_TYPE,
    EDGE_TYPES,
    FIT_VIEW_OPTIONS,
    MINIMAP_NODE_COLOR,
    NODE_TYPES,
    PAN_ON_DRAG,
    PAN_ON_SCROLL,
    SELECTION_ON_DRAG,
} from './config'
import {
    normalizeRegulatoryNodes,
    useGraphDragHandlers,
    useGraphInteractions,
} from './utils'
import { useHotkeysSetup } from '@/hooks'
import { useEffect } from 'react'
import { useChangesTracking, useEditorStore } from '@/store'

interface GraphProps {
    model: InternalGRNModel
}

export function Graph({ model }: GraphProps) {
    const [nodes, setNodes] = useNodesState(
        normalizeRegulatoryNodes(model.nodes)
    )
    const [edges, setEdges, onEdgesChange] = useEdgesState<
        Edge<EditableRegulatoryEdge>
    >(model.edges)

    const takeSnapshot = useChangesTracking((state) => state.takeSnapshot)
    const dragging = useEditorStore((state) => state.isDragging)
    const isApplyingHistory = useEditorStore((state) => state.isApplyingHistory)
    const isSnapshotPaused = useEditorStore((state) => state.isSnapshotPaused)

    useEffect(() => {
        if (isApplyingHistory || isSnapshotPaused) {
            return
        }

        if (!dragging) {
            takeSnapshot(nodes, edges)
        }
    }, [
        nodes,
        edges,
        dragging,
        isApplyingHistory,
        isSnapshotPaused,
        takeSnapshot,
    ])

    const {
        onNodesChange,
        onNodeDragStart,
        onNodeDrag,
        onNodeDragStop,
        onConnectStart,
        onConnect,
        onConnectEnd,
    } = useGraphInteractions({
        setNodes,
        setEdges,
    })

    const {
        handleNodeDragStart,
        handleNodeDrag,
        handleNodeDragStop,
        handleSelectionDragStart,
        handleSelectionDrag,
        handleSelectionDragStop,
    } = useGraphDragHandlers({
        onNodeDragStart,
        onNodeDrag,
        onNodeDragStop,
    })

    useHotkeysSetup()

    return (
        <ReactFlow
            proOptions={{
                hideAttribution: true,
            }}
            nodes={nodes}
            onNodesChange={onNodesChange}
            onNodeDragStart={handleNodeDragStart}
            onNodeDrag={handleNodeDrag}
            onNodeDragStop={handleNodeDragStop}
            onSelectionDragStart={handleSelectionDragStart}
            onSelectionDrag={handleSelectionDrag}
            onSelectionDragStop={handleSelectionDragStop}
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
            connectOnClick={false}
            onConnectStart={onConnectStart}
            onConnect={onConnect}
            onConnectEnd={onConnectEnd}
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
