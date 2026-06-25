import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import { Kbd } from '@/components/ui/kbd'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useElementsActions } from '@/hooks'
import { formatForDisplay } from '@tanstack/react-hotkeys'
import { NodeToolbar as ReactFlowNodeToolbar, Position } from '@xyflow/react'
import { ClipboardCopy, CopyIcon, TrashIcon } from 'lucide-react'
import type { PropsWithChildren } from 'react'

interface NodeToolbarProps {
    id: string
    nodeIds: string[]
    isVisible: boolean
}

interface NodeToolbarButtonProps {
    onClick: () => void
    description: string
    shortcut?: string
}

function NodeToolbarButton({
    children,
    onClick,
    description,
    shortcut,
}: PropsWithChildren<NodeToolbarButtonProps>) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={onClick}
                    className="bg-white"
                    variant="secondary"
                    size="icon"
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent className="pr-1.5">
                <div className="flex items-center gap-2">
                    {description} {shortcut && <Kbd>{shortcut}</Kbd>}
                </div>
            </TooltipContent>
        </Tooltip>
    )
}

export function NodeToolbar({ id, nodeIds, isVisible }: NodeToolbarProps) {
    const { deleteAction, duplicateAction, copyAction } = useElementsActions()
    const toolbarTarget = nodeIds && nodeIds.length > 0 ? nodeIds : id

    return (
        <ReactFlowNodeToolbar
            nodeId={toolbarTarget}
            isVisible={isVisible}
            position={Position.Top}
            align="center"
        >
            <ButtonGroup className="border rounded-full overflow-clip">
                <NodeToolbarButton
                    onClick={deleteAction}
                    description="Delete"
                    shortcut={formatForDisplay('Backspace')}
                >
                    <TrashIcon />
                </NodeToolbarButton>
                <ButtonGroupSeparator />
                <NodeToolbarButton
                    onClick={copyAction}
                    description="Copy"
                    shortcut={formatForDisplay('Mod+C')}
                >
                    <ClipboardCopy />
                </NodeToolbarButton>
                <ButtonGroupSeparator />
                <NodeToolbarButton
                    onClick={duplicateAction}
                    description="Duplicate"
                    shortcut={formatForDisplay('Mod+D')}
                >
                    <CopyIcon />
                </NodeToolbarButton>
            </ButtonGroup>
        </ReactFlowNodeToolbar>
    )
}
