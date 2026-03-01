import type { EdgeData, Graph as G6Graph } from '@antv/g6'

/**
 * Creates an in-memory edge snapshot store to keep edge data/style stable
 * during high-frequency graph updates (for example while dragging).
 */
export const createEdgeSnapshotStore = (
    graph: G6Graph,
    initialEdges: EdgeData[]
) => {
    const edgeSnapshot = new Map<string, EdgeData>()

    /**
     * Merges an edge update into the local snapshot map.
     */
    const snapshotEdge = (edge: EdgeData | undefined) => {
        if (!edge?.id) return

        const id = String(edge.id)
        const previous = edgeSnapshot.get(id)

        edgeSnapshot.set(id, {
            ...(previous ?? {}),
            ...edge,
            source: edge.source ?? previous?.source,
            target: edge.target ?? previous?.target,
            data: edge.data
                ? { ...(previous?.data ?? {}), ...edge.data }
                : previous?.data,
            style: edge.style
                ? { ...(previous?.style ?? {}), ...edge.style }
                : previous?.style,
        } as EdgeData)
    }

    /**
     * Returns the latest edge datum, preferring a merged snapshot when available.
     */
    const getEdgeDatum = (edgeId: string): EdgeData | undefined => {
        const liveEdge = graph.getEdgeData(edgeId) as EdgeData | undefined
        if (liveEdge) {
            const previous = edgeSnapshot.get(edgeId)
            if (!previous) {
                snapshotEdge(liveEdge)
                return edgeSnapshot.get(edgeId) ?? liveEdge
            }

            // Keep snapshot data/style authoritative during drag interactions.
            // G6 live edge data can lag by a frame and otherwise overwrite
            // pending endpoint/control-point updates.
            edgeSnapshot.set(edgeId, {
                ...liveEdge,
                source: liveEdge.source ?? previous.source,
                target: liveEdge.target ?? previous.target,
                data: {
                    ...liveEdge.data,
                    ...previous.data,
                },
                style: {
                    ...(liveEdge.style as Record<string, unknown> | undefined),
                    ...(previous.style as Record<string, unknown> | undefined),
                },
            } as EdgeData)

            return edgeSnapshot.get(edgeId) ?? liveEdge
        }

        return edgeSnapshot.get(edgeId)
    }

    for (const edge of initialEdges) {
        snapshotEdge(edge)
    }

    return {
        snapshotEdge,
        getEdgeDatum,
    }
}
