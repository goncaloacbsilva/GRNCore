import { DEFAULT_NODE_TYPE } from '@/components/views/editor/graph/config'
import type { RegulatoryNodeProperties } from '@/lib/schema'
import { useEditorStore } from '@/store'
import { useReactFlow } from '@xyflow/react'
import { type Node } from '@xyflow/react'
import { v4 } from 'uuid'

export function useNodeSetup() {
    const { addNodes } = useReactFlow()
    const setOpen = useEditorStore((state) => state.setAddNodeDialogVisible)

    return {
        addNode: (value: string) => {
            // TODO: Fetch metadata from NCBI

            // Add node
            addNodes({
                id: v4(),
                position: { x: 10, y: 50 },
                type: DEFAULT_NODE_TYPE,
                data: {
                    name: value,
                },
            } as Node<RegulatoryNodeProperties>)

            // Hide dialog
            setOpen(false)
        },
    }
}
