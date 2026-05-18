import { displayHistoryActionToast } from '@/lib/history-utils'
import type {
    EditableRegulatoryEdge,
    InternalGRNModel,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Node, Edge, ReactFlowInstance } from '@xyflow/react'
import diff, { type Difference } from 'microdiff'
import isEqual from 'lodash/isEqual'
import { create } from 'zustand'

type MicrodiffChange = Difference

type MicrodiffPathSegment = string | number

type CanonicalGraphState = InternalGRNModel

interface HistoryEntry {
    forwardDiffs: MicrodiffChange[]
    backwardDiffs: MicrodiffChange[]
    afterState: InternalGRNModel
}

interface HistoryJournal {
    entries: HistoryEntry[]
    position: number
}

interface HistoryGroupContext {
    depth: number
    reason: string
    startState: InternalGRNModel
}

interface HistoryState {
    snapshot: InternalGRNModel
    baselineVersion: number
    getBaselinePosition: () => number
    getHistoryPosition: () => number
    canHistoryForward: () => boolean

    takeSnapshot: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => void
    resetHistory: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
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
const EMPTY_HISTORY_META = { title: '', annotations: undefined } as const

let historyBaselinePosition = 0
let historyJournal: HistoryJournal = {
    entries: [],
    position: 0,
}
let historyRootSnapshot: InternalGRNModel = {
    ...EMPTY_HISTORY_META,
    nodes: [],
    edges: [],
}
let historyCanonicalState: CanonicalGraphState = {
    ...EMPTY_HISTORY_META,
    nodes: [],
    edges: [],
}
let historyGroupContext: HistoryGroupContext | null = null

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
        const nextNodeRecord = nextNode as Record<string, unknown>
        delete nextNode.dragging
        delete nextNode.resizing
        delete nextNode.measured
        delete nextNode.width
        delete nextNode.height
        delete nextNode.zIndex
        delete nextNodeRecord.positionAbsolute
        delete nextNode.ariaLabel
        delete nextNode.focusable
        return nextNode
    }),
    edges: snapshot.edges.map((edge) => {
        const nextEdge = { ...edge }
        delete nextEdge.zIndex
        delete nextEdge.ariaLabel
        delete nextEdge.focusable
        return nextEdge
    }),
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

const getSnapshotChanges = (
    previousSnapshot: InternalGRNModel,
    nextSnapshot: InternalGRNModel
): MicrodiffChange[] =>
    diff(getCanonicalState(previousSnapshot), getCanonicalState(nextSnapshot))

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

const cloneSnapshot = (snapshot: InternalGRNModel): InternalGRNModel =>
    structuredClone(snapshot)

const getSnapshotAtPosition = (position: number): InternalGRNModel => {
    if (position <= 0) {
        return cloneSnapshot(historyRootSnapshot)
    }

    const afterState = historyJournal.entries[position - 1]?.afterState
    if (!afterState) {
        return cloneSnapshot(historyRootSnapshot)
    }

    return cloneSnapshot(afterState)
}

const getSnapshotAtCurrentPosition = () =>
    getSnapshotAtPosition(historyJournal.position)

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
): CanonicalGraphState => {
    const next = structuredClone(base)

    changes.forEach((change) => {
        applyMicrodiffChange(next, change)
    })

    return next
}

const normalizeSnapshot = (
    nodes: Node<RegulatoryNodeProperties>[],
    edges: Edge<EditableRegulatoryEdge>[]
): InternalGRNModel => stripTransientFields(buildSnapshot(nodes, edges))

const trimHistory = () => {
    if (historyJournal.entries.length <= MAX_HISTORY) {
        return
    }

    const overflow = historyJournal.entries.length - MAX_HISTORY
    const removedEntries = historyJournal.entries.splice(0, overflow)

    const newRoot = removedEntries[overflow - 1]?.afterState
    if (newRoot) {
        historyRootSnapshot = cloneSnapshot(newRoot)
    }

    historyJournal.position = Math.max(0, historyJournal.position - overflow)
    historyBaselinePosition = Math.max(0, historyBaselinePosition - overflow)
}

const commitSnapshot = (nextSnapshot: InternalGRNModel): boolean => {
    const previousSnapshot = getSnapshotAtCurrentPosition()
    const forwardDiffs = filterHistoryChanges(
        getSnapshotChanges(previousSnapshot, nextSnapshot)
    )

    if (isEquivalentIgnoringSelectionAndOrder(previousSnapshot, nextSnapshot)) {
        historyCanonicalState = getCanonicalState(nextSnapshot)
        return false
    }

    if (forwardDiffs.length === 0) {
        historyCanonicalState = getCanonicalState(previousSnapshot)
        return false
    }

    const backwardDiffs = filterHistoryChanges(
        getSnapshotChanges(nextSnapshot, previousSnapshot)
    )

    if (historyJournal.position < historyJournal.entries.length) {
        historyJournal.entries.splice(historyJournal.position)
    }

    historyJournal.entries.push({
        forwardDiffs,
        backwardDiffs,
        afterState: cloneSnapshot(nextSnapshot),
    })
    historyJournal.position = historyJournal.entries.length

    trimHistory()

    historyCanonicalState = applyDiffs(historyCanonicalState, forwardDiffs)
    return true
}

const resetDiffHistory = (nextSnapshot: InternalGRNModel) => {
    historyRootSnapshot = cloneSnapshot(nextSnapshot)
    historyCanonicalState = getCanonicalState(nextSnapshot)
    historyJournal = {
        entries: [],
        position: 0,
    }
    historyGroupContext = null
}

const applySnapshotToInstance = (
    snapshot: InternalGRNModel,
    instance: ReactFlowInstance<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >
) => {
    const currentNodes = instance.getNodes()
    const currentEdges = instance.getEdges()
    const currentNodeSelectionById = new Map(
        currentNodes.map((node) => [node.id, Boolean(node.selected)])
    )
    const currentEdgeSelectionById = new Map(
        currentEdges.map((edge) => [edge.id, Boolean(edge.selected)])
    )
    const nextNodes = snapshot.nodes.map((node) => {
        const currentSelected = currentNodeSelectionById.get(node.id)
        if (currentSelected === undefined) {
            const nextNode = { ...node }
            delete nextNode.selected
            return nextNode
        }

        if (Boolean(node.selected) === currentSelected) {
            return node
        }

        return {
            ...node,
            selected: currentSelected,
        }
    })

    const nextEdges = snapshot.edges.map((edge) => {
        const currentSelected = currentEdgeSelectionById.get(edge.id)
        if (currentSelected === undefined) {
            const nextEdge = { ...edge }
            delete nextEdge.selected
            return nextEdge
        }

        if (Boolean(edge.selected) === currentSelected) {
            return edge
        }

        return {
            ...edge,
            selected: currentSelected,
        }
    })

    instance.setNodes(nextNodes)
    instance.setEdges(nextEdges)
}

export const useChangesTracking = create<HistoryState>((set, get) => ({
    snapshot: {} as InternalGRNModel,
    baselineVersion: 0,
    getBaselinePosition: () => historyBaselinePosition,
    getHistoryPosition: () => historyJournal.position,
    canHistoryForward: () =>
        historyJournal.position < historyJournal.entries.length,
    takeSnapshot: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => {
        const nextSnapshot = normalizeSnapshot(nodes, edges)

        if (historyGroupContext) {
            return
        }

        const didCommit = commitSnapshot(nextSnapshot)
        if (!didCommit) {
            return
        }

        set({ snapshot: getSnapshotAtCurrentPosition() })
    },
    resetHistory: (
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => {
        const nextSnapshot = normalizeSnapshot(nodes, edges)

        resetDiffHistory(nextSnapshot)
        set({ snapshot: cloneSnapshot(nextSnapshot) })

        historyBaselinePosition = historyJournal.position
        set({
            baselineVersion: get().baselineVersion + 1,
        })
    },
    beginGroup: (
        reason,
        nodes: Node<RegulatoryNodeProperties>[],
        edges: Edge<EditableRegulatoryEdge>[]
    ) => {
        const currentSnapshot = normalizeSnapshot(nodes, edges)
        const currentGroup = (historyGroupContext ??= {
            depth: 0,
            reason,
            startState: currentSnapshot,
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

        const finishedGroup = historyGroupContext
        historyGroupContext = null

        const nextSnapshot = normalizeSnapshot(nodes, edges)
        const snapshotChanges = getSnapshotChanges(
            finishedGroup.startState,
            nextSnapshot
        )

        if (snapshotChanges.length === 0) {
            return
        }

        const didCommit = commitSnapshot(nextSnapshot)
        if (!didCommit) {
            return
        }

        set({ snapshot: getSnapshotAtCurrentPosition() })
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
            snapshot: entry.afterState,
        })
        historyCanonicalState = applyDiffs(
            historyCanonicalState,
            entry.backwardDiffs
        )
        historyJournal.position -= 1

        const snapshot = getSnapshotAtCurrentPosition()
        set({ snapshot })
        applySnapshotToInstance(snapshot, instance)
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
            snapshot: entry.afterState,
        })
        historyCanonicalState = applyDiffs(
            historyCanonicalState,
            entry.forwardDiffs
        )
        historyJournal.position += 1

        const snapshot = getSnapshotAtCurrentPosition()
        set({ snapshot })
        applySnapshotToInstance(snapshot, instance)
    },
    getLastHistoryEntry: () => {
        if (historyJournal.position === 0) {
            return null
        }

        return historyJournal.entries[historyJournal.position - 1] ?? null
    },
}))
