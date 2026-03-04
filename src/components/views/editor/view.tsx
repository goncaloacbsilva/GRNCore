import { ReactFlowProvider } from '@xyflow/react'
import { P53_MODEL } from '@/data/p53-model'
import { Graph } from './graph'
import { AddNodeDialog } from './dialogs'

export function EditorView() {
    return (
        <ReactFlowProvider>
            <div className="w-full h-full relative">
                <Graph model={P53_MODEL} />
                {/* Overlay dialogs */}
                <AddNodeDialog />
            </div>
        </ReactFlowProvider>
    )
}
