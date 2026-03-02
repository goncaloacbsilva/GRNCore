import { memo } from 'react'
import {
    Handle,
    Position,
    NodeResizer,
    type NodeProps,
    type Node,
    useConnection,
} from '@xyflow/react'
import type { RegulatoryNodeProperties } from '@/lib/schema'

const RegulatoryNode = ({
    id,
    data,
    selected,
}: NodeProps<Node<RegulatoryNodeProperties>>) => {
    const connection = useConnection()

    const isTarget = connection.inProgress && connection.fromNode.id !== id

    const connectModeActive = false

    return (
        <div className=" h-full px-4 py-2 flex flex-col items-center justify-center bg-white border-2 border-[#E2E8F0] rounded-sm text-sm">
            <NodeResizer
                color="#ff0071"
                isVisible={selected}
                minWidth={100}
                minHeight={30}
            />
            {!connection.inProgress && (
                <Handle
                    isConnectable={connectModeActive}
                    className="customHandle"
                    position={Position.Right}
                    type="source"
                />
            )}
            {/* We want to disable the target handle, if the connection was started from this node */}
            {(!connection.inProgress || isTarget) && (
                <Handle
                    className="customHandle"
                    position={Position.Left}
                    type="target"
                    isConnectableStart={false}
                />
            )}
            <div>{data.name}</div>
        </div>
    )
}

export default memo(RegulatoryNode)
