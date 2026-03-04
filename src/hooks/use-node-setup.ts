import {
    DEFAULT_NODE_HEIGHT,
    DEFAULT_NODE_TYPE,
} from '@/components/views/editor/graph/config'
import {
    findNextNodePosition,
    getNodeContentMinWidth,
} from '@/components/views/editor/graph/utils'
import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { useEditorStore } from '@/store'
import { useReactFlow } from '@xyflow/react'
import { type Edge, type Node } from '@xyflow/react'
import { v4 } from 'uuid'

export function useNodeSetup() {
    const { addNodes, getNodes, getEdges, getIntersectingNodes } = useReactFlow<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >()
    const setOpen = useEditorStore((state) => state.setAddNodeDialogVisible)

    return {
        addNode: (value: string) => {
            // TODO: Fetch metadata from NCBI
            const width = getNodeContentMinWidth(value)
            const height = DEFAULT_NODE_HEIGHT
            const position = findNextNodePosition({
                basePosition: { x: 10, y: 50 },
                width,
                height,
                nodes: getNodes(),
                edges: getEdges(),
                getIntersectingNodes,
            })

            // Add node
            addNodes({
                id: v4(),
                position,
                type: DEFAULT_NODE_TYPE,
                data: {
                    name: value,
                },
                style: {
                    width,
                    height,
                },
            } as Node<RegulatoryNodeProperties>)

            // Hide dialog
            setOpen(false)
        },
    }
}
