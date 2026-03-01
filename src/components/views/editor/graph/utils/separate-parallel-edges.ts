import type { EdgeData, GraphData } from '@antv/g6'

/*
 * Utility to separate parallel edges in a graph by applying curve offsets.
 * This is necessary because G6 does not automatically separate parallel edges,
 * which can lead to visual overlap and confusion when multiple edges connect the same nodes.
 *
 * Important: These functions were vibe-coded due to the non-trivial logic of grouping edges and calculating offsets.
 * Please be cautious when making changes and ensure to test with various graph configurations,
 * especially with different numbers of parallel edges and combinations of directed/undirected edges.
 */

export const DEFAULT_PARALLEL_EDGE_DISTANCE = 18

/**
 * Stable edge ordering helper by edge identifier.
 */
const byId = (a: EdgeData, b: EdgeData) =>
    String(a.id).localeCompare(String(b.id))

/**
 * Produces symmetric offsets around zero: `0, +d, -d, +2d, -2d...`.
 */
const nextSymmetricOffset = (index: number, distance: number): number => {
    if (index === 0) return 0
    const level = Math.ceil(index / 2)
    const sign = index % 2 === 1 ? 1 : -1
    return sign * level * distance
}

/**
 * Applies deterministic curve offsets so parallel edges remain visually separated.
 */
export const separateParallelEdges = (
    data: GraphData,
    distance = DEFAULT_PARALLEL_EDGE_DISTANCE
): GraphData => {
    const edges = (data.edges ?? []).map((edge) => ({
        ...edge,
        // Keep non-parallel edges straight when using Quadratic edges.
        style: { curveOffset: 0, ...(edge.style ?? {}) },
    }))

    const groups = new Map<string, EdgeData[]>()
    for (const edge of edges) {
        const source = String(edge.source)
        const target = String(edge.target)
        const key =
            source < target ? `${source}|${target}` : `${target}|${source}`
        const group = groups.get(key)
        if (group) group.push(edge)
        else groups.set(key, [edge])
    }

    for (const group of groups.values()) {
        if (group.length <= 1) continue

        const [a, b] = [String(group[0].source), String(group[0].target)].sort()
        const forward = group.filter(
            (e) => String(e.source) === a && String(e.target) === b
        )
        const reverse = group.filter(
            (e) => String(e.source) === b && String(e.target) === a
        )

        forward.sort(byId)
        reverse.sort(byId)

        // Bidirectional pair/group: keep same-sign offsets for opposite directions,
        // so two directed edges between the same nodes do not collapse on top of each other.
        if (forward.length > 0 && reverse.length > 0) {
            forward.forEach((edge, i) => {
                edge.style = {
                    ...(edge.style ?? {}),
                    curveOffset: (i + 1) * distance,
                }
            })
            reverse.forEach((edge, i) => {
                edge.style = {
                    ...(edge.style ?? {}),
                    curveOffset: (i + 1) * distance,
                }
            })
            continue
        }

        // Same-direction parallel edges: distribute around center.
        group.sort(byId)
        group.forEach((edge, i) => {
            edge.style = {
                ...(edge.style ?? {}),
                curveOffset: nextSymmetricOffset(i, distance),
            }
        })
    }

    return {
        ...data,
        edges,
    }
}
