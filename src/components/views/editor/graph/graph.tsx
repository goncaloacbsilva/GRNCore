import type { EditableRegulatoryEdge, InternalGRNModel } from '@/lib/schema'
import { isRegulatoryRuleExpressionValid } from '@/lib/regulatory-rules'
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
import { useEffect, useRef } from 'react'
import { useChangesTracking, useEditorStore } from '@/store'

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
    const dragging = useEditorStore((state) => state.isDragging)
    const setModelAnnotations = useEditorStore(
        (state) => state.setModelAnnotations
    )
    const setSnapshotPaused = useEditorStore((state) => state.setSnapshotPaused)
    const isApplyingHistory = useEditorStore((state) => state.isApplyingHistory)
    const isSnapshotPaused = useEditorStore((state) => state.isSnapshotPaused)
    const hasInitializedHistoryRef = useRef(false)

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
        resetHistory(normalizedNodes, model.edges)

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

    useEffect(() => {
        const incomingNodesByTargetId = new Map<
            (typeof nodes)[number]['id'],
            typeof nodes
        >()
        const incomingEdgesByTargetId = new Map<
            (typeof nodes)[number]['id'],
            typeof edges
        >()

        edges.forEach((edge) => {
            const sourceNode = nodes.find((node) => node.id === edge.source)

            if (!sourceNode) {
                return
            }

            const incomingNodes = incomingNodesByTargetId.get(edge.target) ?? []
            incomingNodes.push(sourceNode)
            incomingNodesByTargetId.set(edge.target, incomingNodes)

            const incomingEdges = incomingEdgesByTargetId.get(edge.target) ?? []
            incomingEdges.push(edge)
            incomingEdgesByTargetId.set(edge.target, incomingEdges)
        })

        let hasChanges = false
        const nextNodes = nodes.map((node) => {
            if (node.data.rules.length === 0) {
                return node
            }

            const incomingNodes = incomingNodesByTargetId.get(node.id) ?? []
            const incomingEdges = incomingEdgesByTargetId.get(node.id) ?? []
            const nextRules = node.data.rules.map((rule) => {
                const isValid = isRegulatoryRuleExpressionValid(
                    rule.expression,
                    incomingNodes,
                    incomingEdges
                )

                return rule.isValid === isValid ? rule : { ...rule, isValid }
            })

            const rulesChanged = nextRules.some(
                (rule, index) => rule !== node.data.rules[index]
            )

            if (!rulesChanged) {
                return node
            }

            hasChanges = true
            return {
                ...node,
                data: {
                    ...node.data,
                    rules: nextRules,
                },
            }
        })

        if (!hasChanges) {
            return
        }

        setNodes(nextNodes)
    }, [edges, nodes, setNodes])

    useEffect(() => {
        let hasChanges = false
        const nextEdges = edges.map((edge) => {
            const sourceActivityLevels = nodes.find(
                (node) => node.id === edge.source
            )?.data.activityLevels
            const nextLevels =
                edge.data?.levels.map((level) => {
                    const hasConflict =
                        edge.data?.levels.some(
                            (currentLevel) =>
                                currentLevel.id !== level.id &&
                                currentLevel.target === level.target
                        ) ?? false
                    const isWithinSourceRange =
                        sourceActivityLevels === undefined ||
                        level.target <= sourceActivityLevels
                    const isValid = !hasConflict && isWithinSourceRange

                    return level.isValid === isValid
                        ? level
                        : { ...level, isValid }
                }) ?? []

            const levelsChanged =
                edge.data?.levels.some(
                    (level, index) => level !== nextLevels[index]
                ) ?? false

            if (!levelsChanged) {
                return edge
            }

            hasChanges = true
            return {
                ...edge,
                data: {
                    ...edge.data,
                    levels: nextLevels,
                },
            }
        })

        if (!hasChanges) {
            return
        }

        setEdges(nextEdges)
    }, [edges, nodes, setEdges])

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
    )
}
