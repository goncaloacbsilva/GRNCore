import { Toggle } from '@/components/ui/toggle'
import { useEditorStore } from '@/store'
import { MousePointerClick } from 'lucide-react'

export function AddEdgeToggle() {
    const setConnectMode = useEditorStore((state) => state.setConnectMode)

    return (
        <Toggle
            className="rounded-full text-sm data-[state=on]:border-2 cursor-pointer text-muted-foreground bg-white px-4 hover:border-[#3b83f682] hover:text-[#3B82F6] hover:bg-white data-[state=on]:border-[#3b83f6d9] data-[state=on]:text-[#3B82F6] data-[state=on]:bg-white  transition-all"
            aria-label="Toggle bookmark"
            size="default"
            variant="outline"
            onPressedChange={setConnectMode}
        >
            Add Edge
            <MousePointerClick />
        </Toggle>
    )
}
