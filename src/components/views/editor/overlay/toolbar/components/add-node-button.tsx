import { Kbd } from '@/components/ui/kbd'
import { Toggle } from '@/components/ui/toggle'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditorStore } from '@/store'
import { CirclePlus } from 'lucide-react'
import { twJoin } from 'tailwind-merge'
import { useShallow } from 'zustand/react/shallow'

export function AddNodeButton() {
    const { addNodeDialogVisible, connectModeEnabled, setDialogVisible } =
        useEditorStore(
            useShallow((state) => ({
                addNodeDialogVisible: state.addNodeDialogVisible,
                connectModeEnabled: state.connectModeEnabled,
                setDialogVisible: state.setAddNodeDialogVisible,
            }))
    )

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Toggle
                    className={twJoin(
                        'rounded-full text-sm cursor-pointer text-muted-foreground bg-white px-4 hover:border-[#3b83f682] hover:text-[#3B82F6] hover:bg-white transition-all',
                        addNodeDialogVisible &&
                            'border-2 border-[#3b83f6d9] text-[#3B82F6] bg-white'
                    )}
                    disabled={connectModeEnabled}
                    onPressedChange={setDialogVisible}
                    pressed={addNodeDialogVisible}
                    variant="outline"
                    size="default"
                    aria-label="Toggle add node dialog"
                >
                    Add Node
                    <CirclePlus />
                </Toggle>
            </TooltipTrigger>
            <TooltipContent>
                <div className="flex items-center gap-2">
                    Add node <Kbd>⌘ + G</Kbd>
                </div>
            </TooltipContent>
        </Tooltip>
    )
}
