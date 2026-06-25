import { memo } from 'react'
import {
    Handle,
    Position,
    NodeResizer,
    type NodeProps,
    type Node,
    useConnection,
    useInternalNode,
    useStore,
} from '@xyflow/react'
import type { RegulatoryNodeProperties } from '@/lib/schema'
import { DEFAULT_NODE_HEIGHT } from '../config'
import { getNodeContentMinWidth } from '../utils'
import { useEditorStore } from '@/store'
import { twJoin } from 'tailwind-merge'
import { NodeToolbar } from './node-toolbar'
import { shallow } from 'zustand/shallow'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    DEFAULT_NODE_BACKGROUND_COLOR,
    DEFAULT_NODE_BORDER_COLOR,
    DEFAULT_NODE_FOREGROUND_COLOR,
    getRegulatoryNodeBackgroundColor,
    getRegulatoryNodeBorderColor,
    getRegulatoryNodeShape,
} from '../node-style'

const RegulatoryNode = ({
    id,
    data,
    selected,
}: NodeProps<Node<RegulatoryNodeProperties>>) => {
    const connection = useConnection()
    const internalNode = useInternalNode<Node<RegulatoryNodeProperties>>(id)
    const contentMinWidth = getNodeContentMinWidth(data.name)
    const connectModeActive = useEditorStore(
        (state) => state.connectModeEnabled
    )
    const selectedNodeIdsArray = useStore(
        (state) =>
            state.nodes.filter((node) => node.selected).map((node) => node.id),
        shallow
    )

    const connectionFromThisNode =
        connection.inProgress && connection.fromNode.id === id
    const connectionToThisNode =
        connection.inProgress && connection.toNode?.id === id
    const isToolbarHost = selectedNodeIdsArray[0] === id
    const hasInvalidRules = data.rules.some((rule) => !rule.isValid)
    const hasInvalidName = data.isValid === false
    const hasValidationError = hasInvalidName || hasInvalidRules
    const backgroundColor = getRegulatoryNodeBackgroundColor(
        internalNode?.internals.userNode.style
    )
    const borderColor = getRegulatoryNodeBorderColor(
        internalNode?.internals.userNode.style
    )
    const visibleBackgroundColor = connectModeActive
        ? DEFAULT_NODE_BACKGROUND_COLOR
        : backgroundColor
    const visibleBorderColor =
        connectionFromThisNode || connectionToThisNode
            ? '#3b83f6d9'
            : connectModeActive
              ? '#e2e8f098'
              : borderColor
    const nodeShape = getRegulatoryNodeShape(
        internalNode?.internals.userNode.style
    )

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
                style={{
                    backgroundColor: visibleBackgroundColor,
                    borderColor: connectModeActive
                        ? undefined
                        : visibleBorderColor,
                    color: connectModeActive
                        ? DEFAULT_NODE_FOREGROUND_COLOR
                        : undefined,
                }}
                className={twJoin(
                    'relative h-full px-2 py-2 flex flex-col items-center justify-center border-2 text-sm',
                    nodeShape === 'rounded-rectangle' && 'rounded-sm',
                    nodeShape === 'rectangle' && 'rounded-none',
                    nodeShape === 'ellipse' && 'rounded-[999px]',
                    connectModeActive &&
                        'group connect-mode-node transition-all',
                    connectModeActive &&
                        (connectionFromThisNode || connectionToThisNode) &&
                        'connect-mode-node--active-target',
                    !connectModeActive &&
                        borderColor === DEFAULT_NODE_BORDER_COLOR &&
                        'border-[#E2E8F0]',
                    data.isInputNode && 'border-dashed'
                )}
            >
                {hasValidationError && (
                    <Tooltip>
                        <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white shadow-sm">
                            <TooltipTrigger>!</TooltipTrigger>
                        </div>
                        <TooltipContent>
                            {hasInvalidName && hasInvalidRules
                                ? 'This node has an invalid name and invalid rules'
                                : hasInvalidName
                                  ? 'This node has an invalid name'
                                  : 'This node has invalid rules'}
                        </TooltipContent>
                    </Tooltip>
                )}
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
                    isConnectable={!data.isInputNode}
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
