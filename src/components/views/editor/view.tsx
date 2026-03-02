import { Overlay } from './overlay'

export function EditorView() {
    return (
        <div className="w-full h-full relative">
            {/* <Graph data={P53_MODEL} /> */}
            <Overlay />
        </div>
    )
}
