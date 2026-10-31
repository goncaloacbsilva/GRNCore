import { Position, type Edge, type InternalNode } from '@xyflow/react'
import type { ControlPoint } from '@/lib/types'
import { projectToNodePerimeter } from './edge-routing'

interface Point {
    x: number
    y: number
}

export interface ParallelEdgeMeta {
    index: number
    total: number
    centeredIndex: number
}

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersectionWithPoint(
    intersectionNode: InternalNode,
    targetPoint: Point
) {
    // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
    const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
        intersectionNode.measured
    const intersectionNodePosition = intersectionNode.internals.positionAbsolute

    const w = intersectionNodeWidth! / 2
    const h = intersectionNodeHeight! / 2

    const x2 = intersectionNodePosition.x + w
    const y2 = intersectionNodePosition.y + h
    const x1 = targetPoint.x
    const y1 = targetPoint.y

    const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h)
    const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h)
    const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1)
    const xx3 = a * xx1
    const yy3 = a * yy1
    const x = w * (xx3 + yy3) + x2
    const y = h * (-xx3 + yy3) + y2

    return { x, y }
}

function getNodeCenter(node: InternalNode): Point {
    return {
        x: node.internals.positionAbsolute.x + node.measured.width! / 2,
        y: node.internals.positionAbsolute.y + node.measured.height! / 2,
    }
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: InternalNode, intersectionPoint: Point) {
    const n = { ...node.internals.positionAbsolute, ...node }
    const nx = Math.round(n.x)
    const ny = Math.round(n.y)
    const px = Math.round(intersectionPoint.x)
    const py = Math.round(intersectionPoint.y)

    if (px <= nx + 1) {
        return Position.Left
    }
    if (px >= nx + n.measured.width! - 1) {
        return Position.Right
    }
    if (py <= ny + 1) {
        return Position.Top
    }
    if (py >= n.y + n.measured.height! - 1) {
        return Position.Bottom
    }

    return Position.Top
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(
    source: InternalNode,
    target: InternalNode,
    sourceDirectionHint?: Point,
    targetDirectionHint?: Point
) {
    const sourceIntersectionPoint = getNodeIntersectionWithPoint(
        source,
        sourceDirectionHint ?? getNodeCenter(target)
    )
    const targetIntersectionPoint = getNodeIntersectionWithPoint(
        target,
        targetDirectionHint ?? getNodeCenter(source)
    )

    const sourcePos = getEdgePosition(source, sourceIntersectionPoint)
    const targetPos = getEdgePosition(target, targetIntersectionPoint)

    return {
        sx: sourceIntersectionPoint.x,
        sy: sourceIntersectionPoint.y,
        tx: targetIntersectionPoint.x,
        ty: targetIntersectionPoint.y,
        sourcePos,
        targetPos,
    }
}

const getUndirectedPairKey = (source: string, target: string) =>
    source < target ? `${source}::${target}` : `${target}::${source}`

function getCanonicalSideKey(
    sourceId: string,
    targetId: string,
    sourcePos: Position,
    targetPos: Position
): string {
    return sourceId < targetId
        ? `${sourcePos}->${targetPos}`
        : `${targetPos}->${sourcePos}`
}

function getEdgeControlPoints(edge: Edge): ControlPoint[] {
    const edgeData = edge.data as { points?: ControlPoint[] } | undefined
    return edgeData?.points ?? []
}

function getEdgeSideKey(
    edge: Edge,
    nodeLookup: ReadonlyMap<string, InternalNode>
): string {
    const sourceId = String(edge.source)
    const targetId = String(edge.target)

    if (sourceId === targetId) {
        return 'self-loop'
    }

    const sourceNode = nodeLookup.get(sourceId)
    const targetNode = nodeLookup.get(targetId)
    if (!sourceNode || !targetNode) {
        return 'unknown'
    }

    const points = getEdgeControlPoints(edge)
    const startHandleId = `${edge.id}-start-control`
    const endHandleId = `${edge.id}-end-control`
    const startAnchorHint = points.find((point) => point.id === startHandleId)
    const endAnchorHint = points.find((point) => point.id === endHandleId)
    const projectedStartAnchorHint = startAnchorHint
        ? projectToNodePerimeter(sourceNode, startAnchorHint)
        : undefined
    const projectedEndAnchorHint = endAnchorHint
        ? projectToNodePerimeter(targetNode, endAnchorHint)
        : undefined
    const geometryPoints = points.filter(
        (point) => point.id !== startHandleId && point.id !== endHandleId
    )
    const sourceHint = projectedStartAnchorHint ?? geometryPoints[0]
    const targetHint = projectedEndAnchorHint ?? geometryPoints.at(-1)

    const { sourcePos, targetPos } = getEdgeParams(
        sourceNode,
        targetNode,
        sourceHint,
        targetHint
    )

    return getCanonicalSideKey(sourceId, targetId, sourcePos, targetPos)
}

/**
 * Groups every edge once so renderers can look up their parallel offset in O(1).
 * Edges are grouped by undirected node pair so A->B and B->A are spaced together.
 */
export function getParallelEdgeMetadata(
    edges: Edge[],
    nodeLookup: ReadonlyMap<string, InternalNode>
): ReadonlyMap<string, ParallelEdgeMeta> {
    const groups = new Map<string, Edge[]>()

    for (const edge of edges) {
        const source = String(edge.source)
        const target = String(edge.target)
        const groupKey = `${getUndirectedPairKey(source, target)}|${getEdgeSideKey(edge, nodeLookup)}`
        const group = groups.get(groupKey)

        if (group) {
            group.push(edge)
        } else {
            groups.set(groupKey, [edge])
        }
    }

    const metadataById = new Map<string, ParallelEdgeMeta>()
    for (const group of groups.values()) {
        group.sort((left, right) =>
            String(left.id).localeCompare(String(right.id))
        )

        const total = group.length
        group.forEach((edge, index) => {
            metadataById.set(String(edge.id), {
                index,
                total,
                centeredIndex: total <= 1 ? 0 : index - (total - 1) / 2,
            })
        })
    }

    return metadataById
}
