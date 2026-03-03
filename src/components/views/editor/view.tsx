import { ReactFlowProvider } from '@xyflow/react'
import { P53_MODEL } from '@/data/p53-model'
import { Graph } from './graph'

export function EditorView() {
    return (
        <ReactFlowProvider>
            <div className="w-full h-full relative">
                <Graph model={P53_MODEL} />
                {/* <POC model={P53_MODEL} /> */}
            </div>
        </ReactFlowProvider>
    )
}
