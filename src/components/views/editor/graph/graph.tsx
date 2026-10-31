import type { EditableRegulatoryEdge, InternalGRNModel } from '@/lib/schema'
import {
    type Edge,
    Background,
    Panel,
    ReactFlow,
    SelectionMode,
    useEdgesState,
    useNodesState,
} from '@xyflow/react'
import { Annotations, Toolbar, ZoomControls } from '../overlay'

import '@xyflow/react/dist/style.css'
import './graph.css'
import './elements/regulatory-node-style.css'
import {
    BACKGROUND_COLOR,
    BACKGROUND_DOTS_RADIUS,
    CONNECTION_LINE_COMPONENT,
    DEFAULT_EDGE_TYPE,
    EDGE_TYPES,
    FIT_VIEW_OPTIONS,
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
import { useCallback, useEffect, useRef, useState } from 'react'
import { useChangesTracking, useEditorStore } from '@/store'
import { EdgeRenderMetadataProvider } from './edge-render-metadata-provider'
import { NodeToolbar } from './elements/node-toolbar'
import {
    validateGraphIncrementally,
    type ValidationSnapshot,
} from './validation'

interface GraphProps {
    model: InternalGRNModel
}

export function Graph({ model }: GraphProps) {
    const platformClass =
        typeof navigator !== 'undefined' &&
        /Mac|iPhone|iPad|iPod/.test(navigator.platform)
            ? 'editor-graph--mac'
            : 'editor-graph--windows'

    const [nodes, setNodes] = useNodesState(
        normalizeRegulatoryNodes(model.nodes)
    )
    const [edges, setEdges] = useEdgesState<Edge<EditableRegulatoryEdge>>(
        model.edges
    )
    const takeSnapshot = useChangesTracking((state) => state.takeSnapshot)
    const resetHistory = useChangesTracking((state) => state.resetHistory)
    const connectModeActive = useEditorStore(
        (state) => state.connectModeEnabled
    )
    const setModelAnnotations = useEditorStore(
        (state) => state.setModelAnnotations
    )
    const setSnapshotPaused = useEditorStore((state) => state.setSnapshotPaused)
    const isApplyingHistory = useEditorStore((state) => state.isApplyingHistory)
    const isSnapshotPaused = useEditorStore((state) => state.isSnapshotPaused)
    const semanticRevision = useEditorStore((state) => state.semanticRevision)
    const hasInitializedHistoryRef = useRef(false)
    const shouldSkipSelectionWorkRef = useRef(false)
    const validationSnapshotRef = useRef<ValidationSnapshot | null>(null)
    const nodesRef = useRef(nodes)
    const edgesRef = useRef(edges)
    const dragInProgressRef = useRef(false)
    const dragSnapshotPendingRef = useRef(false)
    const dragSnapshotTimerRef = useRef<number | null>(null)
    useEffect(() => {
        nodesRef.current = nodes
        edgesRef.current = edges
    }, [edges, nodes])
    const markSelectionOnlyChange = useCallback(() => {
        shouldSkipSelectionWorkRef.current = true
    }, [])

    useEffect(() => {
        if (hasInitializedHistoryRef.current) {
            return
        }

        hasInitializedHistoryRef.current = true
        const normalizedNodes = normalizeRegulatoryNodes(model.nodes)
        setSnapshotPaused(true)
        setNodes(normalizedNodes)
        setEdges(model.edges)
        setModelAnnotations(model.annotations)
        resetHistory(normalizedNodes, model.edges, { persist: false })

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setSnapshotPaused(false)
            })
        })
    }, [
        model.annotations,
        model.edges,
        model.nodes,
        resetHistory,
        setEdges,
        setModelAnnotations,
        setNodes,
        setSnapshotPaused,
    ])

    useEffect(() => {
        if (
            isApplyingHistory ||
            isSnapshotPaused ||
            dragInProgressRef.current ||
            dragSnapshotPendingRef.current
        ) {
            return
        }

        if (shouldSkipSelectionWorkRef.current) {
            return
        }

        takeSnapshot(nodes, edges)
    }, [nodes, edges, isApplyingHistory, isSnapshotPaused, takeSnapshot])

    useEffect(() => {
        const result = validateGraphIncrementally(
            nodesRef.current,
            edgesRef.current,
            validationSnapshotRef.current
        )
        validationSnapshotRef.current = result.snapshot

        if (result.nodesChanged) setNodes(result.nodes)
        if (result.edgesChanged) setEdges(result.edges)
    }, [semanticRevision, setEdges, setNodes])

    useEffect(() => {
        shouldSkipSelectionWorkRef.current = false
    }, [edges, nodes])

    const {
        onNodesChange,
        onNodeDragStart,
        onNodeDrag,
        onNodeDragStop,
        onConnectStart,
        onConnect,
        onConnectEnd,
        onEdgesChange,
    } = useGraphInteractions({
        setNodes,
        setEdges,
        initialEdges: model.edges,
        onSelectionOnlyChange: markSelectionOnlyChange,
    })

    const handleDragStateChange = useCallback(
        (isDragging: boolean) => {
            dragInProgressRef.current = isDragging
            if (isDragging || dragSnapshotPendingRef.current) {
                return
            }

            dragSnapshotPendingRef.current = true
            const commitSnapshot = () => {
                dragSnapshotTimerRef.current = null
                if (dragInProgressRef.current) {
                    dragSnapshotTimerRef.current = window.setTimeout(
                        commitSnapshot,
                        0
                    )
                    return
                }

                dragSnapshotPendingRef.current = false
                const editorState = useEditorStore.getState()
                if (
                    !editorState.isApplyingHistory &&
                    !editorState.isSnapshotPaused
                ) {
                    takeSnapshot(nodesRef.current, edgesRef.current)
                }
            }

            dragSnapshotTimerRef.current = window.setTimeout(commitSnapshot, 0)
        },
        [takeSnapshot]
    )

    useEffect(
        () => () => {
            if (dragSnapshotTimerRef.current !== null) {
                window.clearTimeout(dragSnapshotTimerRef.current)
            }
        },
        []
    )

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
        onDragStateChange: handleDragStateChange,
    })

    useHotkeysSetup()

    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([])
    const handleSelectionChange = useCallback(
        ({ nodes: selectedNodes }: { nodes: { id: string }[] }) => {
            setSelectedNodeIds(selectedNodes.map((node) => node.id))
        },
        []
    )

    return (
        <EdgeRenderMetadataProvider edges={edges}>
            <ReactFlow
                className={`editor-graph ${platformClass}`}
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
                onSelectionChange={handleSelectionChange}
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
                // Keep viewport filtering inside React Flow so pan/zoom does
                // not rebuild the controlled graph arrays on every frame.
                onlyRenderVisibleElements
            >
                <NodeToolbar
                    id={selectedNodeIds[0] ?? ''}
                    nodeIds={selectedNodeIds}
                    isVisible={!connectModeActive && selectedNodeIds.length > 0}
                />
                <Background
                    color={BACKGROUND_COLOR}
                    size={BACKGROUND_DOTS_RADIUS}
                />
                {/* <MiniMap
                    style={{
                        borderRadius: 'var(--radius-md)',
                        overflow: 'clip',
                    }}
                    nodeColor={MINIMAP_NODE_COLOR}
                    zoomable
                    pannable
                /> */}
                <Panel position="bottom-left">
                    <div className="pointer-events-none absolute bottom-0 left-2 flex w-[calc(100vw-2.5rem)] items-end justify-center">
                        <div className="pointer-events-auto absolute bottom-0 left-0">
                            <ZoomControls />
                        </div>
                        <Annotations />
                    </div>
                </Panel>
                <Panel position="top-left">
                    <Toolbar />
                </Panel>
            </ReactFlow>
        </EdgeRenderMetadataProvider>
    )
}
