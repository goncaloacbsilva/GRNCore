import type { InternalGRNModel } from '@/lib/schema'
import type { Difference } from 'microdiff'
import { stripTransientSnapshotFields } from './model-snapshot'

export type SnapshotMutation =
    | { type: 'apply-diffs'; changes: Difference[] }
    | { type: 'set-title'; title: string }
    | {
          type: 'set-annotations'
          annotations: InternalGRNModel['annotations']
      }

type PathSegment = string | number

const getPathParent = (
    target: unknown,
    path: PathSegment[]
): {
    parent: Record<string | number, unknown>
    key: PathSegment
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
        } else {
            cursor = value as Record<string | number, unknown>
        }
    }

    return { parent: cursor, key: path[path.length - 1] }
}

const applyDifference = (snapshot: InternalGRNModel, change: Difference) => {
    const parentRef = getPathParent(snapshot, change.path)
    if (!parentRef) return

    const { parent, key } = parentRef
    if (change.type === 'REMOVE') {
        if (Array.isArray(parent) && typeof key === 'number') {
            parent.splice(key, 1)
        } else {
            delete parent[key]
        }
        return
    }

    parent[key] = structuredClone(change.value as unknown)
}

export const applySnapshotMutations = (
    snapshot: InternalGRNModel,
    mutations: SnapshotMutation[]
): InternalGRNModel => {
    for (const mutation of mutations) {
        if (mutation.type === 'apply-diffs') {
            mutation.changes.forEach((change) =>
                applyDifference(snapshot, change)
            )
        } else if (mutation.type === 'set-title') {
            snapshot.title = mutation.title
        } else {
            snapshot.annotations = structuredClone(mutation.annotations)
        }
    }

    return snapshot
}

export const serializeSnapshot = (
    snapshot: InternalGRNModel
): Uint8Array<ArrayBuffer> =>
    new TextEncoder().encode(
        JSON.stringify(stripTransientSnapshotFields(snapshot))
    )
