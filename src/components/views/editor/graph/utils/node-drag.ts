import type { Edge, Node, XYPosition } from '@xyflow/react'
import type { RegulatoryNodeProperties } from '@/lib/schema'

type DragNode = Node<RegulatoryNodeProperties>

interface EdgePoint extends XYPosition {
    id?: string
}

interface EdgeDataWithPoints {
    points?: EdgePoint[]
}

export type NodePositionMap = Map<string, XYPosition>
export type EdgeAdjacencyMap = ReadonlyMap<string, ReadonlySet<string>>

export function buildEdgeAdjacencyMap<T extends Edge>(
    edges: T[]
): Map<string, Set<string>> {
    const adjacency = new Map<string, Set<string>>()

    for (const edge of edges) {
        for (const nodeId of [String(edge.source), String(edge.target)]) {
            const incidentEdges = adjacency.get(nodeId) ?? new Set<string>()
            incidentEdges.add(String(edge.id))
            adjacency.set(nodeId, incidentEdges)
        }
    }

    return adjacency
}

export function buildEdgeIndexById<T extends Edge>(
    edges: T[]
): Map<string, number> {
    return new Map(edges.map((edge, index) => [String(edge.id), index]))
}

export function mapDraggedNodePositions(
    draggedNodes: DragNode[]
): NodePositionMap {
    return new Map(draggedNodes.map((node) => [node.id, { ...node.position }]))
}

export function getNodeDragDelta({
    draggedNodes,
    previousPositions,
}: {
    draggedNodes: DragNode[]
    previousPositions: NodePositionMap
}): XYPosition | null {
    if (draggedNodes.length === 0) {
        return null
    }

    const anchorNode = draggedNodes.find((node) =>
        previousPositions.has(node.id)
    )
    if (!anchorNode) {
        return null
    }

    const previous = previousPositions.get(anchorNode.id)
    if (!previous) {
        return null
    }

    const dx = anchorNode.position.x - previous.x
    const dy = anchorNode.position.y - previous.y

    if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) {
        return null
    }

    return { x: dx, y: dy }
}

export function shiftDraggedEdgePoints<T extends Edge>({
    edges,
    draggedNodeIds,
    delta,
    adjacency,
    edgeIndexById,
}: {
    edges: T[]
    draggedNodeIds: Set<string>
    delta: XYPosition
    adjacency?: EdgeAdjacencyMap
    edgeIndexById?: ReadonlyMap<string, number>
}): T[] {
    const { x: dx, y: dy } = delta
    const affectedEdgeIds = new Set<string>()

    if (adjacency) {
        for (const nodeId of draggedNodeIds) {
            for (const edgeId of adjacency.get(nodeId) ?? []) {
                affectedEdgeIds.add(edgeId)
            }
        }
    }

    let nextEdges: T[] | null = null
    const candidateIndices = adjacency
        ? [...affectedEdgeIds].flatMap((edgeId) => {
              const index = edgeIndexById?.get(edgeId)
              if (index !== undefined) return [index]
              const fallbackIndex = edges.findIndex(
                  (edge) => String(edge.id) === edgeId
              )
              return fallbackIndex >= 0 ? [fallbackIndex] : []
          })
        : edges.map((_, index) => index)

    for (const index of candidateIndices) {
        const edge = edges[index]
        if (!edge) {
            continue
        }

        const sourceMoved = draggedNodeIds.has(String(edge.source))
        const targetMoved = draggedNodeIds.has(String(edge.target))
        const edgeData = (edge.data ?? {}) as EdgeDataWithPoints
        const points = edgeData.points
        if (!points || points.length === 0) {
            continue
        }

        const startHandleId = `${edge.id}-start-control`
        const endHandleId = `${edge.id}-end-control`
        const moveGeometryPoints = sourceMoved && targetMoved

        const nextPoints = points.map((point) => {
            const shouldMove =
                (point.id === startHandleId && sourceMoved) ||
                (point.id === endHandleId && targetMoved) ||
                (moveGeometryPoints &&
                    point.id !== startHandleId &&
                    point.id !== endHandleId)

            return shouldMove
                ? {
                      ...point,
                      x: point.x + dx,
                      y: point.y + dy,
                  }
                : point
        })

        if (nextPoints.every((point, pointIndex) => point === points[pointIndex])) {
            continue
        }

        nextEdges ??= edges.slice()
        nextEdges[index] = {
            ...edge,
            data: {
                ...edgeData,
                points: nextPoints,
            },
        }
    }

    return nextEdges ?? edges
}
