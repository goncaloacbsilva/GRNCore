import { HardDrive, ChevronRight, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState, type MouseEvent } from 'react'

import { usePageTransitionNavigate } from '@/hooks/use-page-transition'
import { listLocalModels } from '@/lib/persistence'
import type { ModelMetadata } from '@/lib/schema'
import { useChangesTracking, useEditorStore, usePersistenceStatus } from '@/store'
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
import { Link, useLocation, useNavigate } from '@tanstack/react-router'

export function NavMain() {
    const navigate = useNavigate()
    const navigateWithTransition = usePageTransitionNavigate()
    const { pathname } = useLocation()
    const localModelsVersion = usePersistenceStatus(
        (state) => state.localModelsVersion
    )
    const activeModelId = useChangesTracking((state) => state.activeModelId)
    const modelTitle = useEditorStore((state) => state.modelTitle)
    const [fetchedRecentModels, setFetchedRecentModels] = useState<
        ModelMetadata[]
    >([])
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

            setFetchedRecentModels(items.slice(0, 5))
        })

        return () => {
            isCancelled = true
        }
    }, [localModelsVersion])

    const recentModelItems = useMemo(
        () =>
            fetchedRecentModels.map((item) =>
                item.id === activeModelId ? { ...item, title: modelTitle } : item
            ),
        [activeModelId, fetchedRecentModels, modelTitle]
    )

    const handleModelsNavigation =
        (to: '/models/local' | '/models/community') =>
        (event: MouseEvent<HTMLAnchorElement>) => {
            if (pathname === to) {
                event.preventDefault()
                return
            }

            event.preventDefault()
            if (to === '/models/local') {
                setIsLocalModelsOpen(true)
            }

            void navigateWithTransition('forward', () =>
                navigate({
                    to,
                })
            )
        }

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
                            <Link
                                to="/models/local"
                                onClick={handleModelsNavigation(
                                    '/models/local'
                                )}
                            >
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
                        <Link
                            to="/models/community"
                            onClick={handleModelsNavigation(
                                '/models/community'
                            )}
                        >
                            <UsersRound />
                            <span>Community</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    )
}
