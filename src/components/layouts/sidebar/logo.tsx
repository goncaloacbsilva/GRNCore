import { Waypoints } from 'lucide-react'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { DropdownMenu } from '@/components/ui/dropdown-menu'

export function Logo() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <div className=" bg-[#2F80ED] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm">
                            <Waypoints size={24} strokeWidth={1.6} />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <div className="flex flex-row text-left text-lg leading-tight gap-1">
                                <h1 className="font-bold truncate">GRN</h1>
                                <h1 className="truncate">Core</h1>
                            </div>
                            <span className="truncate text-xs text-muted-foreground">
                                v{__APP_VERSION__}
                            </span>
                        </div>
                    </SidebarMenuButton>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
