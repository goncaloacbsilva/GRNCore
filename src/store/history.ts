import {
    displayHistoryActionToast,
    getHistoryActionSummary,
    hasSemanticHistoryChanges,
} from '@/lib/history-utils'
import {
    exportModel,
    importModel,
    type InterchangeFormat,
} from '@/lib/interchange'
import {
    createEmptyModelSnapshot,
    saveLocalModelSnapshot,
    stripTransientSnapshotFields,
} from '@/lib/persistence'
import type {
    EditableRegulatoryEdge,
    InternalGRNModel,
    PersistedAnnotations,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import type { SnapshotMutation } from '@/lib/persistence/snapshot-serialization'
import type { Node, Edge, ReactFlowInstance } from '@xyflow/react'
import diff, { type Difference } from 'microdiff'
import isEqual from 'lodash/isEqual'
import { create } from 'zustand'
import { toast } from 'sonner'
import { create as createImmutable } from 'mutative'
import { useEditorStore } from './editor'

type MicrodiffChange = Difference

type MicrodiffPathSegment = string | number

type CanonicalGraphState = InternalGRNModel

interface HistoryEntry {
    forwardDiffs: MicrodiffChange[]
    backwardDiffs: MicrodiffChange[]
    semantic: boolean
    summary: string | null
}

interface HistoryJournal {
    entries: HistoryEntry[]
    position: number
}

interface HistoryGroupContext {
    depth: number
}

interface HistoryState {
    activeModelId: string | null
    autoDeleteEmptyModelId: string | null
    snapshot: InternalGRNModel
    // Stable React Flow input; replaced only when loading or importing a model.
    graphModel: InternalGRNModel
    hasHydrated: boolean
    baselineVersion: number
    graphVersion: number
    getBaselinePosition: () => number
    getHistoryPosition: () => number
    canHistoryForward: () => boolean
    export: (format: InterchangeFormat) => void
    import: (file: File, callback: (error: boolean) => void) => void
    loadModel: (modelId: string, snapshot: InternalGRNModel) => void
    clearLoadedModel: () => void
    markAutoDeleteEmptyModel: (modelId: string | null) => void
    setSnapshotTitle: (title: string) => void
    setSnapshotAnnotations: (
        annotations: PersistedAnnotations | undefined
    ) => void

    takeSnapshot: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => void
    resetHistory: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[],
        options?: { persist?: boolean }
    ) => void

    beginGroup: (
        reason: string,
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => void
    endGroup: (
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

    getLastHistoryEntry: () => HistoryEntry | null
}

const MAX_HISTORY = 100

let historyBaselinePosition = 0
let historyJournal: HistoryJournal = {
    entries: [],
    position: 0,
}
let historyRootSnapshot: InternalGRNModel = createEmptyModelSnapshot()
let historyCanonicalState: CanonicalGraphState = createEmptyModelSnapshot()
let historyGroupContext: HistoryGroupContext | null = null

const saveSnapshotForModel = async (
    modelId: string | null,
    snapshot: InternalGRNModel,
    mutations?: SnapshotMutation[]
) => {
    if (!modelId) {
        return
    }

    await saveLocalModelSnapshot(modelId, snapshot, mutations)
}

const buildSnapshot = (
    nodes: Node<RegulatoryNodeProperties>[],
    edges: Edge<EditableRegulatoryEdge>[]
): InternalGRNModel => ({
    ...createEmptyModelSnapshot(),
    nodes,
    edges,
})

const sanitizeSnapshot = (
    snapshot: Partial<InternalGRNModel>
): InternalGRNModel => ({
    // Title/annotations are intentionally excluded from graph history.
    ...createEmptyModelSnapshot(),
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
        const nodeSnapshotRecord = nodeSnapshot as Record<string, unknown>

        delete nodeSnapshot.selected
        delete nodeSnapshot.dragging
        delete nodeSnapshot.resizing
        delete nodeSnapshot.measured
        delete nodeSnapshot.width
        delete nodeSnapshot.height
        delete nodeSnapshot.zIndex
        delete nodeSnapshotRecord.positionAbsolute
        delete nodeSnapshot.ariaLabel
        delete nodeSnapshot.focusable

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
        delete edgeSnapshot.zIndex
        delete edgeSnapshot.ariaLabel
        delete edgeSnapshot.focusable

        return edgeSnapshot
    }),
})

const getCanonicalState = (snapshot: InternalGRNModel): CanonicalGraphState =>
    sanitizeSnapshot(snapshot)

const isSelectionNoisePath = (path: (string | number)[]) => {
    const staticNoiseKeys = new Set([
        'zIndex',
        'positionAbsolute',
        'ariaLabel',
        'focusable',
        'internals',
    ])

    return path.some(
        (segment) => typeof segment === 'string' && staticNoiseKeys.has(segment)
    )
}

const filterHistoryChanges = (
    changes: MicrodiffChange[]
): MicrodiffChange[] => {
    return changes.filter((change) => {
        if (isSelectionNoisePath(change.path)) {
            return false
        }

        const firstSegment = change.path[0]
        const lastSegment = change.path[change.path.length - 1]

        if (firstSegment === 'nodes' && lastSegment === 'selected') {
            return false
        }

        if (firstSegment === 'edges' && lastSegment === 'selected') {
            return false
        }

        return true
    })
}

const normalizeElementsForOrderInsensitiveComparison = <
    T extends { id: string; selected?: boolean },
>(
    elements: T[]
) =>
    elements
        .map((element) => {
            const nextElement = { ...element }
            delete nextElement.selected
            return nextElement
        })
        .sort((left, right) => left.id.localeCompare(right.id))

const isEquivalentIgnoringSelectionAndOrder = (
    previousSnapshot: InternalGRNModel,
    nextSnapshot: InternalGRNModel
) =>
    isEqual(
        {
            ...previousSnapshot,
            nodes: normalizeElementsForOrderInsensitiveComparison(
                previousSnapshot.nodes
            ),
            edges: normalizeElementsForOrderInsensitiveComparison(
                previousSnapshot.edges
            ),
        },
        {
            ...nextSnapshot,
            nodes: normalizeElementsForOrderInsensitiveComparison(
                nextSnapshot.nodes
            ),
            edges: normalizeElementsForOrderInsensitiveComparison(
                nextSnapshot.edges
            ),
        }
    )

const hasSameElementOrder = (
    previousSnapshot: InternalGRNModel,
    nextSnapshot: InternalGRNModel
) =>
    previousSnapshot.nodes.length === nextSnapshot.nodes.length &&
    previousSnapshot.edges.length === nextSnapshot.edges.length &&
    previousSnapshot.nodes.every(
        (node, index) => node.id === nextSnapshot.nodes[index]?.id
    ) &&
    previousSnapshot.edges.every(
        (edge, index) => edge.id === nextSnapshot.edges[index]?.id
    )

const pathParent = (
    target: unknown,
    path: MicrodiffPathSegment[]
): {
    parent: Record<string | number, unknown>
    key: MicrodiffPathSegment
} | null => {
    if (path.length === 0 || target === null || target === undefined) {
        return null
    }

    let cursor = target as Record<string | number, unknown>

    for (let index = 0; index < path.length - 1; index++) {
        const key = path[index]
        const nextKey = path[index + 1]
        const value = cursor[key]

        if (value === undefined || value === null) {
            const nextContainer: Record<string | number, unknown> | unknown[] =
                typeof nextKey === 'number' ? [] : {}
            cursor[key] = nextContainer
            cursor = nextContainer as Record<string | number, unknown>
            continue
        }

        cursor = value as Record<string | number, unknown>
    }

    return {
        parent: cursor,
        key: path[path.length - 1],
    }
}

const applyMicrodiffChange = (
    target: CanonicalGraphState,
    change: MicrodiffChange
) => {
    if (change.path.length === 0) {
        return
    }

    const parentRef = pathParent(target, change.path)
    if (!parentRef) {
        return
    }

    const { parent, key } = parentRef

    if (change.type === 'REMOVE') {
        if (Array.isArray(parent) && typeof key === 'number') {
            parent.splice(key, 1)
            return
        }

        delete parent[key]
        return
    }

    const nextValue: unknown =
        change.type === 'CREATE' || change.type === 'CHANGE'
            ? structuredClone(change.value as unknown)
            : undefined

    parent[key] = nextValue
}

const applyDiffs = (
    base: CanonicalGraphState,
    changes: MicrodiffChange[]
): CanonicalGraphState =>
    createImmutable(base, (draft) => {
        changes.forEach((change) => {
            applyMicrodiffChange(draft, change)
        })
    })

const normalizeSnapshot = (
    currentSnapshot: InternalGRNModel,
    nodes: Node<RegulatoryNodeProperties>[],
    edges: Edge<EditableRegulatoryEdge>[]
): InternalGRNModel => ({
    ...stripTransientSnapshotFields(buildSnapshot(nodes, edges)),
    title: currentSnapshot.title,
    annotations: currentSnapshot.annotations,
})

const trimHistory = () => {
    if (historyJournal.entries.length <= MAX_HISTORY) {
        return
    }

    const overflow = historyJournal.entries.length - MAX_HISTORY
    const removedEntries = historyJournal.entries.splice(0, overflow)

    removedEntries.forEach((entry) => {
        historyRootSnapshot = applyDiffs(
            historyRootSnapshot,
            entry.forwardDiffs
        )
    })

    historyJournal.position = Math.max(0, historyJournal.position - overflow)
    historyBaselinePosition = Math.max(0, historyBaselinePosition - overflow)
}

const commitSnapshot = (
    nextSnapshot: InternalGRNModel
): HistoryEntry | null => {
    const previousSnapshot = historyCanonicalState
    const nextCanonicalSnapshot = getCanonicalState(nextSnapshot)
    const forwardDiffs = filterHistoryChanges(
        diff(previousSnapshot, nextCanonicalSnapshot)
    )

    if (forwardDiffs.length === 0) {
        historyCanonicalState = nextCanonicalSnapshot
        return null
    }

    if (
        !hasSameElementOrder(previousSnapshot, nextCanonicalSnapshot) &&
        isEquivalentIgnoringSelectionAndOrder(
            previousSnapshot,
            nextCanonicalSnapshot
        )
    ) {
        historyCanonicalState = nextCanonicalSnapshot
        return null
    }

    const backwardDiffs = filterHistoryChanges(
        diff(nextCanonicalSnapshot, previousSnapshot)
    )

    if (historyJournal.position < historyJournal.entries.length) {
        historyJournal.entries.splice(historyJournal.position)
    }

    const entry: HistoryEntry = {
        forwardDiffs,
        backwardDiffs,
        semantic: hasSemanticHistoryChanges(forwardDiffs),
        summary: getHistoryActionSummary(forwardDiffs, nextSnapshot),
    }
    historyJournal.entries.push(entry)
    historyJournal.position = historyJournal.entries.length

    trimHistory()

    historyCanonicalState = nextCanonicalSnapshot
    return entry
}

const resetDiffHistory = (nextSnapshot: InternalGRNModel) => {
    const canonicalSnapshot = getCanonicalState(nextSnapshot)
    historyRootSnapshot = canonicalSnapshot
    historyCanonicalState = canonicalSnapshot
    historyJournal = {
        entries: [],
        position: 0,
    }
    historyGroupContext = null
}

const getConsumerSnapshot = (state: InternalGRNModel): InternalGRNModel => ({
    ...historyCanonicalState,
    title: state.title,
    annotations: state.annotations,
})

const cloneSnapshot = (snapshot: InternalGRNModel): InternalGRNModel =>
    structuredClone(snapshot)

const applyHistoryToInstance = (
    previous: InternalGRNModel,
    snapshot: InternalGRNModel,
    changes: MicrodiffChange[],
    instance: ReactFlowInstance<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >
) => {
    const currentNodes = instance.getNodes()
    const currentEdges = instance.getEdges()
    const affectedNodeIds = new Set<string>()
    const affectedEdgeIds = new Set<string>()
    for (const change of changes) {
        const [collection, index] = change.path
        if (typeof index !== 'number') continue
        if (collection === 'nodes') {
            const previousId = previous.nodes[index]?.id
            const nextId = snapshot.nodes[index]?.id
            if (previousId) affectedNodeIds.add(previousId)
            if (nextId) affectedNodeIds.add(nextId)
        } else if (collection === 'edges') {
            const previousId = previous.edges[index]?.id
            const nextId = snapshot.edges[index]?.id
            if (previousId) affectedEdgeIds.add(previousId)
            if (nextId) affectedEdgeIds.add(nextId)
        }
    }

    const currentNodeById = new Map(currentNodes.map((node) => [node.id, node]))
    const currentEdgeById = new Map(currentEdges.map((edge) => [edge.id, edge]))
    const nextNodes = snapshot.nodes.map((node) => {
        const current = currentNodeById.get(node.id)
        if (current && !affectedNodeIds.has(node.id)) return current
        return current
            ? { ...current, ...node, selected: current.selected }
            : { ...node }
    })
    const nextEdges = snapshot.edges.map((edge) => {
        const current = currentEdgeById.get(edge.id)
        if (current && !affectedEdgeIds.has(edge.id)) return current
        return current
            ? { ...current, ...edge, selected: current.selected }
            : { ...edge }
    })

    if (
        affectedNodeIds.size > 0 ||
        previous.nodes.length !== snapshot.nodes.length
    ) {
        instance.setNodes(nextNodes)
    }
    if (
        affectedEdgeIds.size > 0 ||
        previous.edges.length !== snapshot.edges.length
    ) {
        instance.setEdges(nextEdges)
    }
}

export const useChangesTracking = create<HistoryState>()((set, get) => ({
    activeModelId: null,
    autoDeleteEmptyModelId: null,
    snapshot: createEmptyModelSnapshot(),
    graphModel: createEmptyModelSnapshot(),
    hasHydrated: false,
    baselineVersion: 0,
    graphVersion: 0,
    getBaselinePosition: () => historyBaselinePosition,
    getHistoryPosition: () => historyJournal.position,
    canHistoryForward: () =>
        historyJournal.position < historyJournal.entries.length,
    export: (format) => {
        toast.promise<void>(() => exportModel(get().snapshot, format), {
            loading: `Exporting model as ${format.toUpperCase()}...`,
            success: `Model exported as ${format.toUpperCase()}`,
            error: (err) => ({
                message: `Failed to export model as ${format.toUpperCase()}`,
                description: `${err instanceof Error ? err.message : String(err)}`,
                duration: 5000,
            }),
            position: 'top-right',
        })
    },
    import: (file, callback) => {
        toast.promise(
            async () => {
                try {
                    const importedSnapshot = stripTransientSnapshotFields(
                        await importModel(file)
                    )

                    resetDiffHistory(importedSnapshot)
                    historyBaselinePosition = historyJournal.position
                    const graphModel = cloneSnapshot(importedSnapshot)

                    set((state) => ({
                        snapshot: graphModel,
                        graphModel,
                        baselineVersion: state.baselineVersion + 1,
                        graphVersion: state.graphVersion + 1,
                    }))

                    await saveSnapshotForModel(
                        get().activeModelId,
                        importedSnapshot
                    )
                    callback(false)
                } catch (e) {
                    callback(true)
                    throw e
                }
            },
            {
                loading: `Importing ${file.name}...`,
                success: `Imported ${file.name}`,
                error: (err) => ({
                    message: `Failed to import ${file.name}`,
                    description: `${err instanceof Error ? err.message : String(err)}`,
                    duration: 5000,
                }),
                position: 'top-right',
            }
        )
    },
    loadModel: (modelId, snapshot) => {
        const sanitizedSnapshot = stripTransientSnapshotFields(snapshot)
        resetDiffHistory(sanitizedSnapshot)
        historyBaselinePosition = 0

        set((state) => ({
            activeModelId: modelId,
            snapshot: sanitizedSnapshot,
            graphModel: sanitizedSnapshot,
            hasHydrated: true,
            baselineVersion: state.baselineVersion + 1,
            graphVersion: state.graphVersion + 1,
        }))
    },
    clearLoadedModel: () => {
        const graphModel = createEmptyModelSnapshot()
        resetDiffHistory(graphModel)
        historyBaselinePosition = 0

        set((state) => ({
            activeModelId: null,
            snapshot: graphModel,
            graphModel,
            hasHydrated: false,
            baselineVersion: state.baselineVersion + 1,
            graphVersion: state.graphVersion + 1,
        }))
    },
    markAutoDeleteEmptyModel: (modelId) => {
        set(() => ({ autoDeleteEmptyModelId: modelId }))
    },
    setSnapshotTitle: (title: string) => {
        const nextSnapshot = {
            ...get().snapshot,
            title,
        }

        set({ snapshot: nextSnapshot })
        void saveSnapshotForModel(get().activeModelId, nextSnapshot, [
            { type: 'set-title', title },
        ])
    },
    setSnapshotAnnotations: (annotations) => {
        const nextSnapshot = {
            ...get().snapshot,
            annotations,
        }

        set({ snapshot: nextSnapshot })
        void saveSnapshotForModel(get().activeModelId, nextSnapshot, [
            { type: 'set-annotations', annotations },
        ])
    },
    takeSnapshot: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => {
        const nextSnapshot = normalizeSnapshot(get().snapshot, nodes, edges)

        if (historyGroupContext) {
            return
        }

        const committedEntry = commitSnapshot(nextSnapshot)
        if (!committedEntry) {
            return
        }

        const committedSnapshot = getConsumerSnapshot(get().snapshot)
        set({ snapshot: committedSnapshot })
        void saveSnapshotForModel(get().activeModelId, committedSnapshot, [
            { type: 'apply-diffs', changes: committedEntry.forwardDiffs },
        ])
    },
    resetHistory: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[],
        options
    ) => {
        const nextSnapshot = normalizeSnapshot(get().snapshot, nodes, edges)

        resetDiffHistory(nextSnapshot)
        historyBaselinePosition = historyJournal.position

        set((state) => ({
            snapshot: cloneSnapshot(nextSnapshot),
            baselineVersion: state.baselineVersion + 1,
        }))

        if (options?.persist !== false) {
            void saveSnapshotForModel(get().activeModelId, nextSnapshot)
        }
    },
    beginGroup: () => {
        const currentGroup = (historyGroupContext ??= {
            depth: 0,
        })

        currentGroup.depth += 1
    },
    endGroup: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => {
        if (!historyGroupContext) {
            return
        }

        historyGroupContext.depth = Math.max(0, historyGroupContext.depth - 1)
        if (historyGroupContext.depth > 0) {
            return
        }

        historyGroupContext = null

        const nextSnapshot = normalizeSnapshot(get().snapshot, nodes, edges)

        const committedEntry = commitSnapshot(nextSnapshot)
        if (!committedEntry) {
            return
        }

        const committedSnapshot = getConsumerSnapshot(get().snapshot)
        set({ snapshot: committedSnapshot })
        void saveSnapshotForModel(get().activeModelId, committedSnapshot, [
            { type: 'apply-diffs', changes: committedEntry.forwardDiffs },
        ])
    },
    undo: (
        instance: ReactFlowInstance<
            Node<RegulatoryNodeProperties>,
            Edge<EditableRegulatoryEdge>
        >
    ) => {
        const baselinePosition = historyBaselinePosition
        if (historyJournal.position <= baselinePosition) {
            return
        }

        const entry = historyJournal.entries[historyJournal.position - 1]
        if (!entry) {
            return
        }

        displayHistoryActionToast({
            changes: entry.backwardDiffs,
            message: entry.summary,
        })
        const previousSnapshot = getConsumerSnapshot(get().snapshot)
        historyCanonicalState = applyDiffs(
            historyCanonicalState,
            entry.backwardDiffs
        )
        historyJournal.position -= 1

        const snapshot = getConsumerSnapshot(get().snapshot)
        set({ snapshot })
        applyHistoryToInstance(
            previousSnapshot,
            snapshot,
            entry.backwardDiffs,
            instance
        )
        if (entry.semantic) useEditorStore.getState().bumpSemanticRevision()
        void saveSnapshotForModel(get().activeModelId, snapshot, [
            { type: 'apply-diffs', changes: entry.backwardDiffs },
        ])
    },
    redo: (
        instance: ReactFlowInstance<
            Node<RegulatoryNodeProperties>,
            Edge<EditableRegulatoryEdge>
        >
    ) => {
        if (historyJournal.position >= historyJournal.entries.length) {
            return
        }

        const entry = historyJournal.entries[historyJournal.position]
        if (!entry) {
            return
        }

        displayHistoryActionToast({
            changes: entry.forwardDiffs,
            message: entry.summary,
        })
        const previousSnapshot = getConsumerSnapshot(get().snapshot)
        historyCanonicalState = applyDiffs(
            historyCanonicalState,
            entry.forwardDiffs
        )
        historyJournal.position += 1

        const snapshot = getConsumerSnapshot(get().snapshot)
        set({ snapshot })
        applyHistoryToInstance(
            previousSnapshot,
            snapshot,
            entry.forwardDiffs,
            instance
        )
        if (entry.semantic) useEditorStore.getState().bumpSemanticRevision()
        void saveSnapshotForModel(get().activeModelId, snapshot, [
            { type: 'apply-diffs', changes: entry.forwardDiffs },
        ])
    },
    getLastHistoryEntry: () => {
        if (historyJournal.position === 0) {
            return null
        }

        return historyJournal.entries[historyJournal.position - 1] ?? null
    },
}))
