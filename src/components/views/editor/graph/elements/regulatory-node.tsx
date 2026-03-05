import { memo, useEffect, useMemo } from 'react'
import {
    Handle,
    Position,
    NodeResizer,
    type NodeProps,
    type Node,
    useConnection,
} from '@xyflow/react'
import type { RegulatoryNodeProperties } from '@/lib/schema'
import { DEFAULT_NODE_HEIGHT } from '../config'
import { getNodeContentMinWidth } from '../utils'
import { useEditorStore } from '@/store'
import { twJoin } from 'tailwind-merge'
import { NodeToolbar } from './node-toolbar'
import { useShallow } from 'zustand/react/shallow'

const RegulatoryNode = ({
    id,
    data,
    selected,
}: NodeProps<Node<RegulatoryNodeProperties>>) => {
    const connection = useConnection()
    const contentMinWidth = getNodeContentMinWidth(data.name)
    const {
        connectModeActive,
        pushSelectedNodeId,
        selectedNodesIds,
        popSelectedNodeId,
    } = useEditorStore(
        useShallow((state) => ({
            connectModeActive: state.connectModeEnabled,
            pushSelectedNodeId: state.pushSelectedNodeId,
            popSelectedNodeId: state.popSelectedNodeId,
            selectedNodesIds: state.selectedNodesIds,
        }))
    )

    const connectionFromThisNode =
        connection.inProgress && connection.fromNode.id === id
    const connectionToThisNode =
        connection.inProgress && connection.toNode?.id === id
    const selectedNodeIdsArray = useMemo(
        () => Array.from(selectedNodesIds),
        [selectedNodesIds]
    )
    const isToolbarHost = selectedNodeIdsArray[0] === id

    // Track selected node
    useEffect(() => {
        if (selected) {
            pushSelectedNodeId(id)
        } else {
            popSelectedNodeId(id)
        }
    }, [selected, id, pushSelectedNodeId, popSelectedNodeId])

    return (
        <>
            <NodeToolbar
                id={id}
                nodeIds={selectedNodeIdsArray}
                isVisible={
                    selected &&
                    !connectModeActive &&
                    selectedNodeIdsArray.length > 0 &&
                    isToolbarHost
                }
            />
            <div
                className={twJoin(
                    'h-full px-2 py-2 flex flex-col items-center justify-center bg-white border-2 rounded-sm text-sm',
                    connectModeActive
                        ? 'group border-[#e2e8f098] hover:border-[#3b83f6d9] transition-all'
                        : 'border-[#E2E8F0]',
                    (connectionFromThisNode || connectionToThisNode) &&
                        'border-[#3b83f6d9]!'
                )}
            >
                <NodeResizer
                    color="#2f81ed"
                    handleStyle={{
                        borderRadius: 'calc(infinity * 1px)',
                        width: 8,
                        height: 8,
                    }}
                    isVisible={selected && !connectModeActive}
                    minWidth={contentMinWidth}
                    minHeight={DEFAULT_NODE_HEIGHT}
                />
                <Handle
                    isConnectable={connectModeActive}
                    className="customHandle"
                    position={Position.Right}
                    type="source"
                />
                <Handle
                    className="customHandle"
                    position={Position.Left}
                    type="target"
                    isConnectableStart={false}
                />
                <div
                    className={twJoin(
                        'whitespace-nowrap',
                        connectModeActive &&
                            !(connectionFromThisNode || connectionToThisNode) &&
                            'text-[#0a0a0a51] group-hover:text-[#0a0a0a]'
                    )}
                >
                    {data.name}
                </div>
            </div>
        </>
    )
}

export default memo(RegulatoryNode)
