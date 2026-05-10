import type {
    EditableRegulatoryEdge,
    InternalGRNModel,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Node, Edge, ReactFlowInstance } from '@xyflow/react'
import type { SerializedEditorState } from 'lexical'
import diff from 'microdiff'
import { create } from 'zustand'
import { travel } from 'zustand-travel'
import { combine } from 'zustand/middleware'
import { useEditorStore } from './editor'

interface HistoryState {
    snapshot: InternalGRNModel
    pendingSelectionSnapshot: InternalGRNModel | null

    takeSnapshot: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[],
        annotations: SerializedEditorState | null
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
    edges: Edge<EditableRegulatoryEdge>[],
    annotations: SerializedEditorState | null
): InternalGRNModel => ({
    annotations: annotations ? structuredClone(annotations) : undefined,
    nodes: structuredClone(nodes),
    edges: structuredClone(edges),
})

const sanitizeSnapshot = (
    snapshot: Partial<InternalGRNModel>
): InternalGRNModel => ({
    annotations: snapshot.annotations,
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

const isDataChange = (path: readonly (string | number)[]) =>
    path[0] === 'annotations' ||
    ((path[0] === 'nodes' || path[0] === 'edges') && path[2] === 'data')

const isSelectionChange = (path: readonly (string | number)[]) =>
    (path[0] === 'nodes' || path[0] === 'edges') && path[2] === 'selected'

const isAnnotationChange = (path: readonly (string | number)[]) =>
    path[0] === 'annotations' ||
    ((path[0] === 'nodes' || path[0] === 'edges') &&
        path[2] === 'data' &&
        path[3] === 'annotations')

const hasAnnotationChanges = (
    previousSnapshot: InternalGRNModel,
    nextSnapshot: InternalGRNModel
) =>
    diff(
        sanitizeSnapshot(previousSnapshot),
        sanitizeSnapshot(nextSnapshot)
    ).some((change) => isAnnotationChange(change.path))

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
                    edges: Edge<EditableRegulatoryEdge>[],
                    annotations: SerializedEditorState | null
                ) => {
                    const controls = useChangesTracking.getControls()
                    const currentSnapshot = get().snapshot
                    const pendingSelectionSnapshot =
                        get().pendingSelectionSnapshot
                    const nextSnapshot = buildSnapshot(
                        nodes,
                        edges,
                        annotations
                    )
                    const snapshotChanges = diff(
                        sanitizeSnapshot(currentSnapshot),
                        sanitizeSnapshot(nextSnapshot)
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
                    const previousSnapshot = get().snapshot
                    controls.back()

                    const snapshot = get().snapshot
                    const shouldExpandAnnotations = hasAnnotationChanges(
                        previousSnapshot,
                        snapshot
                    )
                    instance.setNodes(snapshot.nodes)
                    instance.setEdges(snapshot.edges)
                    const editorStore = useEditorStore.getState()
                    editorStore.setModelAnnotations(
                        snapshot.annotations ?? null
                    )

                    if (shouldExpandAnnotations) {
                        editorStore.setAnnotationsPanelOpen(true)
                    }
                },
                redo: (
                    instance: ReactFlowInstance<
                        Node<RegulatoryNodeProperties>,
                        Edge<EditableRegulatoryEdge>
                    >
                ) => {
                    const controls = useChangesTracking.getControls()
                    const previousSnapshot = get().snapshot
                    controls.forward()

                    const snapshot = get().snapshot
                    const shouldExpandAnnotations = hasAnnotationChanges(
                        previousSnapshot,
                        snapshot
                    )
                    instance.setNodes(snapshot.nodes)
                    instance.setEdges(snapshot.edges)
                    const editorStore = useEditorStore.getState()
                    editorStore.setModelAnnotations(
                        snapshot.annotations ?? null
                    )

                    if (shouldExpandAnnotations) {
                        editorStore.setAnnotationsPanelOpen(true)
                    }
                },
            })
        ),
        {
            autoArchive: false,
            maxHistory: 100,
        }
    )
)
