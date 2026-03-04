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
}: {
    edges: T[]
    draggedNodeIds: Set<string>
    delta: XYPosition
}): T[] {
    const { x: dx, y: dy } = delta

    return edges.map((edge) => {
        const sourceMoved = draggedNodeIds.has(String(edge.source))
        const targetMoved = draggedNodeIds.has(String(edge.target))

        if (!sourceMoved && !targetMoved) {
            return edge
        }

        const edgeData = (edge.data ?? {}) as EdgeDataWithPoints
        const points = edgeData.points
        if (!points || points.length === 0) {
            return edge
        }

        const startHandleId = `${edge.id}-start-control`
        const endHandleId = `${edge.id}-end-control`
        const moveGeometryPoints = sourceMoved && targetMoved

        return {
            ...edge,
            data: {
                ...edgeData,
                points: points.map((point) => {
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
                }),
            },
        } as T
    })
}
