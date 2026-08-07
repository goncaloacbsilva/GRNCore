import { ModelsHeader } from '@/components/layouts/header'
import { ImportModelDialog } from '@/components/views/editor/dialogs'
import { useLocation } from '@tanstack/react-router'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { usePageEnterTransition } from '@/hooks/use-page-transition'
import { useRef } from 'react'

export const Route = createFileRoute('/models')({
    beforeLoad: ({ location }) => {
        if (location.pathname === '/models') {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: '/models/local', replace: true })
        }
    },
    staticData: {
        expandedNavbar: true,
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { pathname } = useLocation()
    const routeRootRef = useRef<HTMLDivElement | null>(null)

    usePageEnterTransition(routeRootRef)

    return (
        <div
            key={pathname}
            ref={routeRootRef}
            data-route-transition-root="true"
            className="flex h-full w-full flex-col"
        >
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <ModelsHeader />
            </header>
            <div className="relative min-h-0 flex-1 w-full">
                <Outlet />
            </div>
            <ImportModelDialog mode="local-models" />
        </div>
    )
}
