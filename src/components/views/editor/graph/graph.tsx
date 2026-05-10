import type { EditableRegulatoryEdge, InternalGRNModel } from '@/lib/schema'
import { isRegulatoryRuleExpressionValid } from '@/lib/regulatory-rules'
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
import { type CSSProperties, useEffect } from 'react'
import { useChangesTracking, useEditorStore } from '@/store'
import { twJoin } from 'tailwind-merge'

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
    const [edges, setEdges, onEdgesChange] = useEdgesState<
        Edge<EditableRegulatoryEdge>
    >(model.edges)

    const takeSnapshot = useChangesTracking((state) => state.takeSnapshot)
    const dragging = useEditorStore((state) => state.isDragging)
    const modelAnnotations = useEditorStore((state) => state.modelAnnotations)
    const setModelAnnotations = useEditorStore(
        (state) => state.setModelAnnotations
    )
    const isApplyingHistory = useEditorStore((state) => state.isApplyingHistory)
    const isSnapshotPaused = useEditorStore((state) => state.isSnapshotPaused)
    const isConnectModeEnabled = useEditorStore(
        (state) => state.connectModeEnabled
    )
    const isMenuSheetOpen =
        nodes.some((node) => node.selected) ||
        edges.some((edge) => edge.selected)
    const bottomOverlayStyle = {
        '--editor-menu-sheet-width': isMenuSheetOpen ? '20rem' : '0px',
    } as CSSProperties

    useEffect(() => {
        setModelAnnotations(model.annotations ?? null)
    }, [model.annotations, setModelAnnotations])

    useEffect(() => {
        if (isApplyingHistory || isSnapshotPaused) {
            return
        }

        if (!dragging) {
            takeSnapshot(nodes, edges, modelAnnotations)
        }
    }, [
        nodes,
        edges,
        modelAnnotations,
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

        edges.forEach((edge) => {
            const sourceNode = nodes.find((node) => node.id === edge.source)

            if (!sourceNode) {
                return
            }

            const incomingNodes = incomingNodesByTargetId.get(edge.target) ?? []
            incomingNodes.push(sourceNode)
            incomingNodesByTargetId.set(edge.target, incomingNodes)
        })

        let hasChanges = false
        const nextNodes = nodes.map((node) => {
            if (node.data.rules.length === 0) {
                return node
            }

            const incomingNodes = incomingNodesByTargetId.get(node.id) ?? []
            const nextRules = node.data.rules.map((rule) => {
                const isValid = isRegulatoryRuleExpressionValid(
                    rule.expression,
                    incomingNodes
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
                <div
                    className="pointer-events-none absolute bottom-5 left-5 flex w-[calc(100vw-2.5rem-var(--editor-menu-sheet-width))] items-end justify-center transition-[width] duration-300"
                    style={bottomOverlayStyle}
                >
                    <div className="pointer-events-auto absolute bottom-0 left-0">
                        <ZoomControls />
                    </div>
                    <div
                        className={twJoin(
                            'pointer-events-none',
                            isConnectModeEnabled && 'hidden'
                        )}
                    >
                        <Annotations />
                    </div>
                </div>
            </Panel>
            <Panel position="top-left">
                <Toolbar />
            </Panel>
        </ReactFlow>
    )
}
