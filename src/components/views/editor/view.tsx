import { ReactFlowProvider } from '@xyflow/react'
import { Graph } from './graph'
import { AddNodeDialog, ImportModelDialog } from './dialogs'
import { MenuSheet } from './menu-sheet'
import { useEffect, useRef } from 'react'
import { useChangesTracking, useEditorStore } from '@/store'
import { EditorHeader } from '@/components/layouts/header'
import { usePageEnterTransition } from '@/hooks/use-page-transition'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronUpIcon } from 'lucide-react'

export function EditorLoadingView() {
    const routeRootRef = useRef<HTMLDivElement | null>(null)

    usePageEnterTransition(routeRootRef)

    return (
        <div
            ref={routeRootRef}
            data-route-transition-root="true"
            className="flex h-full w-full flex-col bg-background"
            aria-busy="true"
        >
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex min-w-0 items-center gap-3">
                    <Skeleton className="h-4 w-24" />
                    <span className="text-muted-foreground">/</span>
                    <Skeleton className="h-4 w-72 max-w-[40vw]" />
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                    <Spinner className="size-4" />
                    <span>Opening model...</span>
                </div>
            </header>
            <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/10">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <Skeleton className="h-9 w-40 rounded-md border bg-background" />
                    <Skeleton className="h-9 w-28 rounded-md border bg-background" />
                    <Skeleton className="h-9 w-28 rounded-md border bg-background" />
                </div>

                <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex size-10 items-center justify-center rounded-md border bg-background shadow-sm">
                            <Spinner className="size-5" />
                        </div>
                        <span className="font-medium text-foreground">
                            Opening model...
                        </span>
                    </div>
                </div>

                <div className="absolute right-4 bottom-4 left-4 z-10 flex h-11 items-center gap-2 rounded-md border bg-background/90 px-4 shadow-sm">
                    <ChevronUpIcon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                        Model Annotations
                    </span>
                </div>
            </div>
        </div>
    )
}

export function EditorView() {
    const setModelTitle = useEditorStore((state) => state.setModelTitle)
    const hasHydrated = useChangesTracking((state) => state.hasHydrated)
    const graphVersion = useChangesTracking((state) => state.graphVersion)
    const graphModel = useChangesTracking((state) => state.graphModel)
    const routeRootRef = useRef<HTMLDivElement | null>(null)

    usePageEnterTransition(routeRootRef)

    useEffect(() => {
        if (!hasHydrated) {
            return
        }

        setModelTitle(graphModel.title || 'Untitled model')
    }, [graphModel.title, hasHydrated, setModelTitle])

    return (
        <ReactFlowProvider>
            <div
                ref={routeRootRef}
                data-route-transition-root="true"
                className="flex h-full w-full flex-col"
            >
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <EditorHeader />
                </header>
                <div className="relative min-h-0 flex-1 w-full">
                    {hasHydrated ? (
                        <Graph key={graphVersion} model={graphModel} />
                    ) : null}
                    {/* Overlay dialogs */}
                    <AddNodeDialog />
                    <MenuSheet />
                    <ImportModelDialog />
                    <ImportModelDialog mode="local-models" />
                </div>
            </div>
        </ReactFlowProvider>
    )
}
