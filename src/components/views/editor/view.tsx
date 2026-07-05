import { ReactFlowProvider } from '@xyflow/react'
import { Graph } from './graph'
import { AddNodeDialog, ImportModelDialog } from './dialogs'
import { MenuSheet } from './menu-sheet'
import { useEffect, useRef } from 'react'
import { useChangesTracking, useEditorStore } from '@/store'
import { EditorHeader } from '@/components/layouts/header'
import { usePageEnterTransition } from '@/hooks/use-page-transition'

export function EditorView() {
    const setModelTitle = useEditorStore((state) => state.setModelTitle)
    const snapshot = useChangesTracking((state) => state.snapshot)
    const hasHydrated = useChangesTracking((state) => state.hasHydrated)
    const graphVersion = useChangesTracking((state) => state.graphVersion)
    const routeRootRef = useRef<HTMLDivElement | null>(null)

    usePageEnterTransition(routeRootRef)

    useEffect(() => {
        if (!hasHydrated) {
            return
        }

        setModelTitle(snapshot.title || 'Untitled model')
    }, [hasHydrated, setModelTitle, snapshot.title])

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
                        <Graph key={graphVersion} model={snapshot} />
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
