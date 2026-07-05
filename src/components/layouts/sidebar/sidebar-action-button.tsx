import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    type SidebarContextProps,
} from '@/components/ui/sidebar'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import type { LucideIcon } from 'lucide-react'

interface SidebarActionButtonProps {
    context: SidebarContextProps
    icon: LucideIcon
    label: string
    className?: string
    onClick: () => void
}

export function SidebarActionButton({
    context,
    icon: Icon,
    label,
    className,
    onClick,
}: SidebarActionButtonProps) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SidebarMenuButton
                            className={className}
                            onClick={onClick}
                        >
                            <Icon size={18} />
                            <div className="grid flex-1 truncate text-left text-sm leading-tight">
                                {label}
                            </div>
                        </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent
                        className={
                            context.state === 'expanded' ? 'hidden' : 'block'
                        }
                        side="right"
                    >
                        <p>{label}</p>
                    </TooltipContent>
                </Tooltip>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
