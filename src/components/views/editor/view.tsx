import { ReactFlowProvider } from '@xyflow/react'
import { Graph } from './graph'
import { AddNodeDialog } from './dialogs'
import { P53_NODES_ONLY_MODEL } from '@/data/test-models'

export function EditorView() {
    return (
        <ReactFlowProvider>
            <div className="w-full h-full relative">
                <Graph model={P53_NODES_ONLY_MODEL} />
                {/* Overlay dialogs */}
                <AddNodeDialog />
            </div>
        </ReactFlowProvider>
    )
}
