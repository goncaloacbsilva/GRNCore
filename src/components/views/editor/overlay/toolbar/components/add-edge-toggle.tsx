import { Kbd } from '@/components/ui/kbd'
import { Toggle } from '@/components/ui/toggle'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEditorStore } from '@/store'
import { formatForDisplay } from '@tanstack/react-hotkeys'
import { MousePointerClick } from 'lucide-react'
import { twJoin } from 'tailwind-merge'
import { useShallow } from 'zustand/react/shallow'

export function AddEdgeToggle() {
    const { connectModeEnabled, setConnectMode } = useEditorStore(
        useShallow((state) => ({
            connectModeEnabled: state.connectModeEnabled,
            setConnectMode: state.setConnectMode,
        }))
    )

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Toggle
                    className={twJoin(
                        'rounded-full text-sm cursor-pointer text-muted-foreground bg-white px-4 hover:border-[#3b83f682] hover:text-[#3B82F6] hover:bg-white transition-all',
                        connectModeEnabled &&
                            'border-2 border-[#3b83f6d9] text-[#3B82F6] bg-white'
                    )}
                    aria-label="Toggle bookmark"
                    size="default"
                    variant="outline"
                    onPressedChange={setConnectMode}
                    pressed={connectModeEnabled}
                >
                    Add Edge
                    <MousePointerClick />
                </Toggle>
            </TooltipTrigger>
            <TooltipContent>
                <div className="flex items-center gap-2">
                    Toggle connect mode <Kbd>{formatForDisplay('Mod+E')}</Kbd>
                </div>
            </TooltipContent>
        </Tooltip>
    )
}
