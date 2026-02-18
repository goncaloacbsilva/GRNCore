import { PlusIcon } from 'lucide-react'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    type SidebarContextProps,
} from '@/components/ui/sidebar'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export interface CreateModelButtonProps {
    context: SidebarContextProps
}

export function CreateModelButton({ context }: CreateModelButtonProps) {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SidebarMenuButton className="bg-primary text-[#F8FAFC] hover:bg-primary/80 transition-all hover:text-[#F8FAFC] cursor-pointer">
                                <PlusIcon size={18} />
                                <div className="grid flex-1 text-left text-sm leading-tight truncate">
                                    Create Model
                                </div>
                            </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent
                            className={
                                context.state === 'expanded'
                                    ? 'hidden'
                                    : 'block'
                            }
                            side="right"
                        >
                            <p>Create Model</p>
                        </TooltipContent>
                    </Tooltip>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
