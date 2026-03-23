import type {
    EditableRegulatoryEdge,
    InternalGRNModel,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Node, Edge, ReactFlowInstance } from '@xyflow/react'
import diff from 'microdiff'
import { create } from 'zustand'
import { travel } from 'zustand-travel'
import { combine } from 'zustand/middleware'

interface HistoryState {
    snapshot: InternalGRNModel

    takeSnapshot: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => void

    undo: (
        instance: ReactFlowInstance<
            Node<RegulatoryNodeProperties>,
            Edge<EditableRegulatoryEdge>
        >
    ) => void
    redo: (
        instance: ReactFlowInstance<
            Node<RegulatoryNodeProperties>,
            Edge<EditableRegulatoryEdge>
        >
    ) => void
}

export const useChangesTracking = create<HistoryState>()(
    travel(
        combine(
            {
                snapshot: {} as InternalGRNModel,
            },
            (set, get) => ({
                takeSnapshot: (
                    nodes: Node<RegulatoryNodeProperties>[],
                    edges: Edge<EditableRegulatoryEdge>[]
                ) => {
                    const currentSnapshot = get().snapshot
                    const nextSnapshot = { nodes, edges }
                    const isSameSnapshot =
                        diff(currentSnapshot, nextSnapshot).length === 0

                    if (isSameSnapshot) {
                        return
                    }

                    set({
                        snapshot: nextSnapshot,
                    })

                    const controls = useChangesTracking.getControls()
                    if ('archive' in controls) {
                        controls.archive()
                    }
                },
                undo: (
                    instance: ReactFlowInstance<
                        Node<RegulatoryNodeProperties>,
                        Edge<EditableRegulatoryEdge>
                    >
                ) => {
                    const controls = useChangesTracking.getControls()
                    controls.back()

                    instance.setNodes(get().snapshot.nodes)
                    instance.setEdges(get().snapshot.edges)
                },
                redo: (
                    instance: ReactFlowInstance<
                        Node<RegulatoryNodeProperties>,
                        Edge<EditableRegulatoryEdge>
                    >
                ) => {
                    const controls = useChangesTracking.getControls()
                    controls.forward()

                    instance.setNodes(get().snapshot.nodes)
                    instance.setEdges(get().snapshot.edges)
                },
            })
        ),
        {
            autoArchive: false,
        }
    )
)
