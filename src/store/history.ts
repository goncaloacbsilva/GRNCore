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
    pendingSelectionSnapshot: InternalGRNModel | null

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

const buildSnapshot = (
    nodes: Node<RegulatoryNodeProperties>[],
    edges: Edge<EditableRegulatoryEdge>[]
): InternalGRNModel => ({
    nodes: structuredClone(nodes),
    edges: structuredClone(edges),
})

const sanitizeSnapshot = (
    nodes: Node<RegulatoryNodeProperties>[],
    edges: Edge<EditableRegulatoryEdge>[]
): InternalGRNModel => ({
    nodes: nodes.map((node) => {
        const nodeSnapshot = {
            ...node,
            data: {
                ...node.data,
                rules: node.data.rules.map((rule) => ({
                    ...rule,
                    isValid: false,
                })),
            },
        }

        delete nodeSnapshot.selected

        return nodeSnapshot
    }),

    edges: edges.map((edge) => {
        const edgeSnapshot = {
            ...edge,
            data: edge.data
                ? {
                      ...edge.data,
                      levels: edge.data.levels.map((level) => ({
                          ...level,
                          isValid: false,
                      })),
                  }
                : edge.data,
        }

        delete edgeSnapshot.selected

        return edgeSnapshot
    }),
})

const isDataChange = (path: readonly (string | number)[]) =>
    (path[0] === 'nodes' || path[0] === 'edges') && path[2] === 'data'

const isSelectionChange = (path: readonly (string | number)[]) =>
    (path[0] === 'nodes' || path[0] === 'edges') && path[2] === 'selected'

export const useChangesTracking = create<HistoryState>()(
    travel(
        combine(
            {
                snapshot: {} as InternalGRNModel,
                pendingSelectionSnapshot: null as InternalGRNModel | null,
            },
            (set, get) => ({
                takeSnapshot: (
                    nodes: Node<RegulatoryNodeProperties>[],
                    edges: Edge<EditableRegulatoryEdge>[]
                ) => {
                    const controls = useChangesTracking.getControls()
                    const currentSnapshot = get().snapshot
                    const pendingSelectionSnapshot =
                        get().pendingSelectionSnapshot
                    const nextSnapshot = buildSnapshot(nodes, edges)
                    const snapshotChanges = diff(
                        sanitizeSnapshot(
                            currentSnapshot.nodes ?? [],
                            currentSnapshot.edges ?? []
                        ),
                        sanitizeSnapshot(nextSnapshot.nodes, nextSnapshot.edges)
                    )
                    const isSameSnapshot = snapshotChanges.length === 0

                    if (isSameSnapshot) {
                        const selectionChanged = diff(
                            currentSnapshot,
                            nextSnapshot
                        ).some((change) => isSelectionChange(change.path))

                        if (selectionChanged) {
                            set({
                                pendingSelectionSnapshot: nextSnapshot,
                            })
                        }

                        return
                    }

                    const hasDataChanges = snapshotChanges.some((change) =>
                        isDataChange(change.path)
                    )

                    if (hasDataChanges && pendingSelectionSnapshot) {
                        set({
                            snapshot: pendingSelectionSnapshot,
                        })

                        if ('archive' in controls) {
                            controls.archive()
                        }
                    }

                    set({
                        snapshot: nextSnapshot,
                        pendingSelectionSnapshot: null,
                    })

                    if ('archive' in controls) {
                        controls.archive()
                    }

                    if (!hasDataChanges && pendingSelectionSnapshot) {
                        set({
                            pendingSelectionSnapshot: null,
                        })
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
            maxHistory: 100,
        }
    )
)
