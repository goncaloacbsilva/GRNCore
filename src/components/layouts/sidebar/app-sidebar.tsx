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
import { CreateModelButton } from './create-model'
import { ImportModelButton } from './import-model'
import { NavMain } from './nav-main'
import { Button } from '@/components/ui/button'
import { useLayoutEffect } from 'react'
import { useLocation } from '@tanstack/react-router'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const context = useSidebar()
    const previousForceExpandRef = React.useRef<boolean | null>(null)
    const { pathname } = useLocation()

    const forceExpand = pathname.startsWith('/models')

    useLayoutEffect(() => {
        if (previousForceExpandRef.current === forceExpand) {
            return
        }

        if (forceExpand) {
            context.setOpen(true)
        } else {
            context.setOpen(false)
        }

        previousForceExpandRef.current = forceExpand
    }, [context, forceExpand])

    return (
        <Sidebar collapsible="icon" externalContext={context} {...props}>
            <SidebarHeader className="flex flex-col gap-6">
                <Logo />
                <div className="flex flex-col gap-2">
                    <CreateModelButton context={context} />
                    <ImportModelButton context={context} />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
            </SidebarContent>
            {!forceExpand ? (
                <SidebarRail asChild>
                    <div className="flex h-full items-center justify-center">
                        <Button
                            variant="outline"
                            size="icon"
                            className="ml-4 h-14 w-4 rounded-bl-none rounded-tl-none"
                        >
                            <ChevronRight
                                className={
                                    context.state === 'expanded'
                                        ? 'rotate-180'
                                        : ''
                                }
                            />
                        </Button>
                    </div>
                </SidebarRail>
            ) : null}
        </Sidebar>
    )
}
