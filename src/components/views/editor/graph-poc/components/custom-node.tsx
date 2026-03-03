import { Handle, Position, type NodeTypes } from '@xyflow/react'

export function CustomNode() {
    return (
        <>
            <Handle type="source" position={Position.Top} id="top" />
            <Handle type="source" position={Position.Left} id="left" />
            <Handle type="source" position={Position.Bottom} id="bottom" />
            <Handle type="source" position={Position.Right} id="right" />
        </>
    )
}

export const nodeTypes: NodeTypes = {
    custom: CustomNode,
}
