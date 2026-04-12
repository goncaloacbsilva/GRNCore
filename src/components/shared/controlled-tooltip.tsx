import type { PropsWithChildren } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export interface ControlledTooltipWrapperProps {
    visible?: boolean
    tooltip?: React.ReactElement
}

export function ControlledWrapperTooltip({
    visible,
    children,
    tooltip,
}: PropsWithChildren<ControlledTooltipWrapperProps>) {
    return (
        <>
            {visible ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="flex h-[inherit]">{children}</span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-fit">
                        {tooltip}
                    </TooltipContent>
                </Tooltip>
            ) : (
                children
            )}
        </>
    )
}
