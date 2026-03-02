import type { InternalGRNModel, RegulatoryNodeProperties } from '@/lib/schema'
import {
    type Node,
    Background,
    MiniMap,
    Panel,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from '@xyflow/react'
import { Toolbar, ZoomControls } from '../overlay'

import '@xyflow/react/dist/style.css'
import './elements/regulatory-node-style.css'
import {
    BACKGROUND_COLOR,
    BACKGROUND_DOTS_RADIUS,
    DEFAULT_EDGE_OPTIONS,
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
    const [nodes, , onNodesChange] = useNodesState(importNodes(model.nodes))
    const [edges, , onEdgesChange] = useEdgesState(model.edges)

    return (
        <ReactFlow
            proOptions={{
                hideAttribution: true,
            }}
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            panOnScroll={PAN_ON_SCROLL}
            selectionOnDrag={SELECTION_ON_DRAG}
            panOnDrag={PAN_ON_DRAG}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            fitView
            fitViewOptions={FIT_VIEW_OPTIONS}
        >
            <Background
                color={BACKGROUND_COLOR}
                size={BACKGROUND_DOTS_RADIUS}
            />
            <MiniMap nodeColor={MINIMAP_NODE_COLOR} zoomable pannable />
            <Panel position="bottom-left">
                <ZoomControls />
            </Panel>
            <Panel position="top-left">
                <Toolbar />
            </Panel>
        </ReactFlow>
    )
}
