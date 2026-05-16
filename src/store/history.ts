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
    baselineVersion: number
    getBaselinePosition: () => number

    takeSnapshot: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => void
    resetHistory: (
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

let historyBaselinePosition = 0
const EMPTY_HISTORY_META = { title: '', annotations: undefined } as const

const archiveIfAvailable = (controls: ReturnType<typeof useChangesTracking.getControls>) => {
    if ('archive' in controls) {
        controls.archive()
    }
}

const buildSnapshot = (
    nodes: Node<RegulatoryNodeProperties>[],
    edges: Edge<EditableRegulatoryEdge>[]
): InternalGRNModel => ({
    ...EMPTY_HISTORY_META,
    nodes: structuredClone(nodes),
    edges: structuredClone(edges),
})

const stripTransientFields = (
    snapshot: InternalGRNModel
): InternalGRNModel => ({
    ...snapshot,
    nodes: snapshot.nodes.map((node) => {
        const nextNode = { ...node }
        delete nextNode.dragging
        delete nextNode.resizing
        delete nextNode.measured
        delete nextNode.width
        delete nextNode.height
        return nextNode
    }),
    edges: snapshot.edges,
})

const sanitizeSnapshot = (
    snapshot: Partial<InternalGRNModel>
): InternalGRNModel => ({
    // Title/annotations are intentionally excluded from graph history.
    ...EMPTY_HISTORY_META,
    nodes: (snapshot.nodes ?? []).map((node) => {
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
        delete nodeSnapshot.dragging
        delete nodeSnapshot.resizing
        delete nodeSnapshot.measured
        delete nodeSnapshot.width
        delete nodeSnapshot.height

        return nodeSnapshot
    }),

    edges: (snapshot.edges ?? []).map((edge) => {
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

export const useChangesTracking = create<HistoryState>()(
    travel(
        combine(
            {
                snapshot: {} as InternalGRNModel,
                baselineVersion: 0,
            },
            (set, get) => ({
                getBaselinePosition: () => historyBaselinePosition,
                takeSnapshot: (
                    nodes: Node<RegulatoryNodeProperties>[],
                    edges: Edge<EditableRegulatoryEdge>[]
                ) => {
                    const controls = useChangesTracking.getControls()
                    const currentSnapshot = get().snapshot
                    const nextSnapshot = buildSnapshot(nodes, edges)
                    const nextStoredSnapshot =
                        stripTransientFields(nextSnapshot)
                    const snapshotChanges = diff(
                        sanitizeSnapshot(currentSnapshot),
                        sanitizeSnapshot(nextStoredSnapshot)
                    )
                    const isSameSnapshot = snapshotChanges.length === 0

                    if (isSameSnapshot) {
                        return
                    }

                    set({ snapshot: nextStoredSnapshot })
                    archiveIfAvailable(controls)
                },
                resetHistory: (
                    nodes: Node<RegulatoryNodeProperties>[],
                    edges: Edge<EditableRegulatoryEdge>[]
                ) => {
                    const controls = useChangesTracking.getControls()
                    const nextSnapshot = stripTransientFields(buildSnapshot(nodes, edges))

                    set({
                        snapshot: nextSnapshot,
                    })

                    archiveIfAvailable(controls)

                    historyBaselinePosition = controls.position
                    set({
                        baselineVersion: get().baselineVersion + 1,
                    })
                },
                undo: (
                    instance: ReactFlowInstance<
                        Node<RegulatoryNodeProperties>,
                        Edge<EditableRegulatoryEdge>
                    >
                ) => {
                    const controls = useChangesTracking.getControls()
                    const baselinePosition = historyBaselinePosition
                    if (controls.position <= baselinePosition) {
                        return
                    }

                    controls.back()
                    if (controls.position < baselinePosition && 'go' in controls) {
                        controls.go(baselinePosition)
                    }

                    const snapshot = get().snapshot
                    instance.setNodes(snapshot.nodes)
                    instance.setEdges(snapshot.edges)
                },
                redo: (
                    instance: ReactFlowInstance<
                        Node<RegulatoryNodeProperties>,
                        Edge<EditableRegulatoryEdge>
                    >
                ) => {
                    const controls = useChangesTracking.getControls()
                    controls.forward()

                    const snapshot = get().snapshot
                    instance.setNodes(snapshot.nodes)
                    instance.setEdges(snapshot.edges)
                },
            })
        ),
        {
            autoArchive: false,
            maxHistory: 100,
        }
    )
)
