import {
    createContext,
    useCallback,
    useContext,
    useSyncExternalStore,
} from 'react'
import type { ParallelEdgeMeta } from './utils'

export interface EdgeRenderMetadataStore {
    getSnapshot: (edgeId: string) => ParallelEdgeMeta
    subscribe: (listener: () => void) => () => void
    update: (metadata: ReadonlyMap<string, ParallelEdgeMeta>) => void
}

export const EdgeRenderMetadataContext =
    createContext<EdgeRenderMetadataStore | null>(null)

const DEFAULT_PARALLEL_EDGE_META: ParallelEdgeMeta = {
    index: 0,
    total: 1,
    centeredIndex: 0,
}

const isSameMetadata = (previous: ParallelEdgeMeta, next: ParallelEdgeMeta) =>
    previous.index === next.index &&
    previous.total === next.total &&
    previous.centeredIndex === next.centeredIndex

export function createEdgeRenderMetadataStore(
    initialMetadata: ReadonlyMap<string, ParallelEdgeMeta>
): EdgeRenderMetadataStore {
    let currentMetadata = new Map(initialMetadata)
    const listeners = new Set<() => void>()

    return {
        getSnapshot: (edgeId) =>
            currentMetadata.get(edgeId) ?? DEFAULT_PARALLEL_EDGE_META,
        subscribe: (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        update: (nextMetadata) => {
            let hasChanges = currentMetadata.size !== nextMetadata.size
            const reconciledMetadata = new Map<string, ParallelEdgeMeta>()

            for (const [edgeId, next] of nextMetadata) {
                const previous = currentMetadata.get(edgeId)
                if (previous && isSameMetadata(previous, next)) {
                    reconciledMetadata.set(edgeId, previous)
                    continue
                }

                hasChanges = true
                reconciledMetadata.set(edgeId, next)
            }

            currentMetadata = reconciledMetadata
            if (hasChanges) {
                listeners.forEach((listener) => listener())
            }
        },
    }
}

export function useEdgeRenderMetadata(edgeId: string) {
    const store = useContext(EdgeRenderMetadataContext)
    if (!store) {
        throw new Error(
            'useEdgeRenderMetadata must be used within EdgeRenderMetadataProvider'
        )
    }

    const subscribe = useCallback(
        (listener: () => void) => store.subscribe(listener),
        [store]
    )
    const getSnapshot = useCallback(
        () => store.getSnapshot(edgeId),
        [edgeId, store]
    )

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
