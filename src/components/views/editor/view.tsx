import { ReactFlowProvider } from '@xyflow/react'
import { Graph } from './graph'
import { AddNodeDialog } from './dialogs'
import { P53_NODES_ONLY_MODEL } from '@/data/test-models'
import { MenuSheet } from './menu-sheet'
import { useEffect } from 'react'
import { useEditorStore } from '@/store'
import { ModelHeader } from './model-header'

export function EditorView() {
    const setModelTitle = useEditorStore((state) => state.setModelTitle)

    useEffect(() => {
        setModelTitle(P53_NODES_ONLY_MODEL.title || 'Untitled model')
    }, [setModelTitle])

    return (
        <ReactFlowProvider>
            <div className="w-full h-full">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <ModelHeader />
                </header>
                <div className="relative h-[calc(100%-4rem)] w-full">
                    <Graph model={P53_NODES_ONLY_MODEL} />
                    {/* Overlay dialogs */}
                    <AddNodeDialog />
                    <MenuSheet />
                </div>
            </div>
        </ReactFlowProvider>
    )
}
