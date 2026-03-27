'use client'

import * as React from 'react'
import { ChevronRight } from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar'
import { Logo } from './logo'
import { NAVIGATION_ITEMS } from './data'
import { CreateModelButton } from './create-model'
import { NavMain } from './nav-main'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const context = useSidebar()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => context.setOpen(false), [])

    return (
        <Sidebar collapsible="icon" externalContext={context} {...props}>
            <SidebarHeader className="flex flex-col gap-6">
                <Logo />
                <CreateModelButton context={context} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={NAVIGATION_ITEMS} />
            </SidebarContent>
            <SidebarRail asChild>
                <div className="flex h-full items-center justify-center">
                    <Button
                        variant="outline"
                        size="icon"
                        className="ml-4 h-14 w-4 rounded-bl-none rounded-tl-none"
                    >
                        <ChevronRight
                            className={
                                context.state === 'expanded' ? 'rotate-180' : ''
                            }
                        />
                    </Button>
                </div>
            </SidebarRail>
        </Sidebar>
    )
}
