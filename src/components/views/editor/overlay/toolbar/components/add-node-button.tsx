import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditorStore } from '@/store'
import { CirclePlus } from 'lucide-react'

export function AddNodeButton() {
    const connectModeEnabled = useEditorStore(
        (state) => state.connectModeEnabled
    )
    const setDialogVisible = useEditorStore(
        (state) => state.setAddNodeDialogVisible
    )

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    disabled={connectModeEnabled}
                    onClick={() => setDialogVisible(true)}
                    variant="default"
                    size="default"
                    className="rounded-full text-sm cursor-pointer"
                >
                    <CirclePlus /> Add Node
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <div className="flex items-center gap-2">
                    Add node <Kbd>⌘ + G</Kbd>
                </div>
            </TooltipContent>
        </Tooltip>
    )
}
