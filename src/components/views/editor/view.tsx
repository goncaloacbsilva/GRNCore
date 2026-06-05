import { ReactFlowProvider } from '@xyflow/react'
import { Graph } from './graph'
import { AddNodeDialog, ImportModelDialog } from './dialogs'
import { MenuSheet } from './menu-sheet'
import { useEffect } from 'react'
import { useChangesTracking, useEditorStore } from '@/store'
import { ModelHeader } from './model-header'

export function EditorView() {
    const setModelTitle = useEditorStore((state) => state.setModelTitle)
    const snapshot = useChangesTracking((state) => state.snapshot)
    const hasHydrated = useChangesTracking((state) => state.hasHydrated)
    const graphVersion = useChangesTracking((state) => state.graphVersion)

    useEffect(() => {
        if (!hasHydrated) {
            return
        }

        setModelTitle(snapshot.title || 'Untitled model')
    }, [hasHydrated, setModelTitle, snapshot.title])

    return (
        <ReactFlowProvider>
            <div className="w-full h-full">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <ModelHeader />
                </header>
                <div className="relative h-[calc(100%-4rem)] w-full">
                    {hasHydrated ? (
                        <Graph key={graphVersion} model={snapshot} />
                    ) : null}
                    {/* Overlay dialogs */}
                    <AddNodeDialog />
                    <MenuSheet />
                    <ImportModelDialog />
                </div>
            </div>
        </ReactFlowProvider>
    )
}
