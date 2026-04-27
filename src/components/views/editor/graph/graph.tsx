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
import { Toolbar, ZoomControls } from '../overlay'

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
import { useEffect } from 'react'
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

    useEffect(() => {
        setNodes((currentNodes) => {
            const incomingNodeNamesByTargetId = new Map<string, string[]>()

            edges.forEach((edge) => {
                const sourceNodeName = currentNodes.find(
                    (node) => node.id === edge.source
                )?.data.name

                if (!sourceNodeName) {
                    return
                }

                const incomingNodeNames =
                    incomingNodeNamesByTargetId.get(edge.target) ?? []
                incomingNodeNames.push(sourceNodeName)
                incomingNodeNamesByTargetId.set(edge.target, incomingNodeNames)
            })

            let hasChanges = false
            const nextNodes = currentNodes.map((node) => {
                if (node.data.rules.length === 0) {
                    return node
                }

                const incomingNodeNames =
                    incomingNodeNamesByTargetId.get(node.id) ?? []
                const nextRules = node.data.rules.map((rule) => {
                    const isValid = isRegulatoryRuleExpressionValid(
                        rule.expression,
                        incomingNodeNames
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

            return hasChanges ? nextNodes : currentNodes
        })
    }, [edges, setNodes])

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
                <ZoomControls />
            </Panel>
            <Panel position="top-left">
                <Toolbar />
            </Panel>
        </ReactFlow>
    )
}
