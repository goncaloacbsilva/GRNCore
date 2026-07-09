import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/zod-config'
import './index.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const basepath = new URL(document.baseURI).pathname
const typedRouteTree = routeTree as Parameters<
    typeof createRouter
>[0]['routeTree']

const router = createRouter({
    routeTree: typedRouteTree,
    basepath,
    defaultPreload: 'intent',
    scrollRestoration: true,
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
)
