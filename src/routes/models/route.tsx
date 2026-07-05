import { ModelsHeader } from '@/components/layouts/header'
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
    const routeRootRef = useRef<HTMLDivElement | null>(null)

    usePageEnterTransition(routeRootRef)

    return (
        <div
            ref={routeRootRef}
            data-route-transition-root="true"
            className="flex h-full w-full flex-col"
        >
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <ModelsHeader />
            </header>
            <div className="relative min-h-0 flex-1 w-full">
                <Outlet />
            </div>
        </div>
    )
}
