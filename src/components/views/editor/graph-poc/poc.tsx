import {
    addEdge,
    Background,
    ConnectionMode,
    Controls,
    Panel,
    ReactFlow,
    useEdgesState,
    useNodesState,
    type Connection,
} from '@xyflow/react'
import type { InternalGRNModel } from '@/lib/schema'
import { BACKGROUND_COLOR, BACKGROUND_DOTS_RADIUS } from '../graph/config'
import { EditableConnectionLine } from './components/connection-line'
import { edgeTypes } from './components/editable-edge'
import { nodeTypes } from './components/custom-node'
import { connectionLineStore } from './connection-line-store'
import { initialEdges, initialNodes } from './initial-elements'
import { DEFAULT_ALGORITHM, EDGE_ALGORITHM, EDGE_COLORS } from './types'
import { createId } from './utils/id'

import '@xyflow/react/dist/style.css'
import './style.css'

interface GraphProps {
    model: InternalGRNModel
}

const FIT_VIEW_OPTIONS = {
    padding: 0.4,
}

export function POC({ model: _model }: GraphProps) {
    const [nodes, , onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = (connection: Connection) => {
        const { source, target } = connection

        if (!source || !target) {
            return
        }

        const { connectionLinePath } = connectionLineStore.getState()

        setEdges((currentEdges) =>
            addEdge(
                {
                    ...connection,
                    id: `${Date.now()}-${source}-${target}`,
                    type: 'editable-edge',
                    selected: true,
                    data: {
                        algorithm: DEFAULT_ALGORITHM,
                        points: connectionLinePath.map((point) => ({
                            ...point,
                            id: createId('spline'),
                            active: true,
                        })),
                    },
                },
                currentEdges
            )
        )
    }

    return (
        <ReactFlow
            className="graph-poc"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            connectionLineComponent={EditableConnectionLine}
            fitView
            fitViewOptions={FIT_VIEW_OPTIONS}
        >
            <Background color={BACKGROUND_COLOR} size={BACKGROUND_DOTS_RADIUS} />
            <Controls />
            <Panel position="top-left">
                {Object.values(EDGE_ALGORITHM).map((algorithm) => (
                    <div
                        key={algorithm}
                        style={{
                            color: EDGE_COLORS[algorithm],
                            fontWeight: 700,
                        }}
                    >
                        {algorithm}
                    </div>
                ))}
            </Panel>
        </ReactFlow>
    )
}
