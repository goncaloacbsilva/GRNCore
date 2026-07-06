import { HardDrive, ChevronRight, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { listLocalModels } from '@/lib/persistence'
import type { ModelMetadata } from '@/lib/schema'
import { usePersistenceStatus } from '@/store'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Link, useLocation } from '@tanstack/react-router'

export function NavMain() {
    const { pathname } = useLocation()
    const localModelsVersion = usePersistenceStatus(
        (state) => state.localModelsVersion
    )
    const [recentModels, setRecentModels] = useState<ModelMetadata[]>([])
    const [isLocalModelsOpen, setIsLocalModelsOpen] = useState(
        pathname === '/models/local' || pathname.startsWith('/edit/')
    )

    const isLocalModelsActive =
        pathname === '/models/local' || pathname.startsWith('/edit/')
    const isCommunityModelsActive = pathname === '/models/community'

    useEffect(() => {
        let isCancelled = false

        void listLocalModels().then((items) => {
            if (isCancelled) {
                return
            }

            setRecentModels(items.slice(0, 5))
        })

        return () => {
            isCancelled = true
        }
    }, [localModelsVersion])

    useEffect(() => {
        if (isLocalModelsActive) {
            setIsLocalModelsOpen(true)
        }
    }, [isLocalModelsActive])

    const recentModelItems = useMemo(
        () => recentModels.slice(0, 5),
        [recentModels]
    )

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Models</SidebarGroupLabel>
            <SidebarMenu>
                <Collapsible
                    open={isLocalModelsOpen}
                    onOpenChange={setIsLocalModelsOpen}
                    asChild
                    className="group/collapsible"
                >
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Local Models"
                            isActive={isLocalModelsActive}
                            className="pr-8"
                        >
                            <Link to="/models/local">
                                <HardDrive />
                                <span>Local</span>
                            </Link>
                        </SidebarMenuButton>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuAction
                                aria-label="Toggle local models"
                                className="cursor-pointer"
                            >
                                <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarGroupLabel className="px-2">
                                Recently edited
                            </SidebarGroupLabel>
                            <SidebarMenuSub>
                                {recentModelItems.map((item) => (
                                    <SidebarMenuSubItem key={item.id}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                pathname === `/edit/${item.id}`
                                            }
                                        >
                                            <Link
                                                to="/edit/$modelId"
                                                params={{
                                                    modelId: item.id,
                                                }}
                                                className="flex min-w-0 items-center gap-2"
                                            >
                                                <span className="size-1.5 shrink-0 rounded-full bg-[#2F80ED]" />
                                                <span className="min-w-0 truncate">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        tooltip="Community Models"
                        isActive={isCommunityModelsActive}
                    >
                        <Link to="/models/community">
                            <UsersRound />
                            <span>Community</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
}
