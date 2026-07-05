import type { InternalGRNModel } from '@/lib/schema'

const EMPTY_SNAPSHOT_META = { title: '', annotations: undefined } as const

export const createEmptyModelSnapshot = (): InternalGRNModel => ({
    ...EMPTY_SNAPSHOT_META,
    nodes: [],
    edges: [],
})

export const stripTransientSnapshotFields = (
    snapshot: InternalGRNModel
): InternalGRNModel => ({
    ...snapshot,
    nodes: snapshot.nodes.map((node) => {
        const nextNode = { ...node }
        const nextNodeRecord = nextNode as Record<string, unknown>
        delete nextNode.selected
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
        delete nextEdge.selected
        delete nextEdge.zIndex
        delete nextEdge.ariaLabel
        delete nextEdge.focusable
        return nextEdge
    }),
})
