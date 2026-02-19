import { Graph } from '@/components/graph'
import { P53_MODEL } from '@/data/p53-model'

export function EditorView() {
    return <Graph data={P53_MODEL} />
}
