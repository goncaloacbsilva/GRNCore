import { Graph } from '@/components/views/editor/graph'
import { P53_MODEL } from '@/data/p53-model'
import { Overlay } from './overlay'

export function EditorView() {
    return (
        <div className="w-full h-full relative">
            <Graph data={P53_MODEL} />
            <Overlay />
        </div>
    )
}
