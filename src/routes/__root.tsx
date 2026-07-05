import { Outlet, createRootRoute, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AppSidebar } from '@/components/layouts/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '../components/ui/sonner'

export const Route = createRootRoute({
    component: RootComponent,
    beforeLoad: ({ location }) => {
        if (location.pathname === '/') {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: '/models/local', replace: true })
        }
    },
})

function RootComponent() {
    useEffect(() => {
        document.title = 'GRN Core'
    }, [])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Outlet />
            </SidebarInset>
            {/* Toaster Notifications */}
            <Toaster
                toastOptions={{
                    classNames: {
                        icon: '!text-[#3B82F6]',
                        description: '!text-muted-foreground',
                    },
                }}
            />
        </SidebarProvider>
    )
}
