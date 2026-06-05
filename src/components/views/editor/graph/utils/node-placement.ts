import type { Edge, Node, ReactFlowInstance, XYPosition } from '@xyflow/react'
import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'

const NODE_CLEARANCE = 20
const EDGE_CLEARANCE = 10
const SEARCH_STEP = 40
const MAX_SEARCH_LAYERS = 50

interface Rect {
    x: number
    y: number
    width: number
    height: number
}

interface Segment {
    start: XYPosition
    end: XYPosition
}

function toNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }

    return undefined
}

function getNodeWidth(node: Node<RegulatoryNodeProperties>): number {
    return (
        node.measured?.width ??
        toNumber(node.style?.width) ??
        toNumber(node.width) ??
        0
    )
}

function getNodeHeight(node: Node<RegulatoryNodeProperties>): number {
    return (
        node.measured?.height ??
        toNumber(node.style?.height) ??
        toNumber(node.height) ??
        0
    )
}

function getNodeRect(node: Node<RegulatoryNodeProperties>): Rect {
    return {
        x: node.position.x,
        y: node.position.y,
        width: getNodeWidth(node),
        height: getNodeHeight(node),
    }
}

function growRect(rect: Rect, margin: number): Rect {
    return {
        x: rect.x - margin,
        y: rect.y - margin,
        width: rect.width + margin * 2,
        height: rect.height + margin * 2,
    }
}

function rectsIntersect(left: Rect, right: Rect): boolean {
    return !(
        left.x + left.width < right.x ||
        right.x + right.width < left.x ||
        left.y + left.height < right.y ||
        right.y + right.height < left.y
    )
}

function pointInRect(point: XYPosition, rect: Rect): boolean {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    )
}

function orientation(p: XYPosition, q: XYPosition, r: XYPosition): number {
    const value = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)

    if (Math.abs(value) < 1e-9) {
        return 0
    }

    return value > 0 ? 1 : 2
}

function onSegment(p: XYPosition, q: XYPosition, r: XYPosition): boolean {
    return (
        q.x <= Math.max(p.x, r.x) &&
        q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) &&
        q.y >= Math.min(p.y, r.y)
    )
}

function segmentsIntersect(
    p1: XYPosition,
    q1: XYPosition,
    p2: XYPosition,
    q2: XYPosition
): boolean {
    const o1 = orientation(p1, q1, p2)
    const o2 = orientation(p1, q1, q2)
    const o3 = orientation(p2, q2, p1)
    const o4 = orientation(p2, q2, q1)

    if (o1 !== o2 && o3 !== o4) {
        return true
    }

    if (o1 === 0 && onSegment(p1, p2, q1)) {
        return true
    }
    if (o2 === 0 && onSegment(p1, q2, q1)) {
        return true
    }
    if (o3 === 0 && onSegment(p2, p1, q2)) {
        return true
    }
    if (o4 === 0 && onSegment(p2, q1, q2)) {
        return true
    }

    return false
}

function segmentIntersectsRect(segment: Segment, rect: Rect): boolean {
    if (pointInRect(segment.start, rect) || pointInRect(segment.end, rect)) {
        return true
    }

    const topLeft = { x: rect.x, y: rect.y }
    const topRight = { x: rect.x + rect.width, y: rect.y }
    const bottomLeft = { x: rect.x, y: rect.y + rect.height }
    const bottomRight = { x: rect.x + rect.width, y: rect.y + rect.height }

    return (
        segmentsIntersect(segment.start, segment.end, topLeft, topRight) ||
        segmentsIntersect(segment.start, segment.end, topRight, bottomRight) ||
        segmentsIntersect(
            segment.start,
            segment.end,
            bottomRight,
            bottomLeft
        ) ||
        segmentsIntersect(segment.start, segment.end, bottomLeft, topLeft)
    )
}

function getNodeCenter(node: Node<RegulatoryNodeProperties>): XYPosition {
    const rect = getNodeRect(node)

    return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
    }
}

function getEdgeSegments(
    edges: Edge<EditableRegulatoryEdge>[],
    nodesById: Map<string, Node<RegulatoryNodeProperties>>
): Segment[] {
    const segments: Segment[] = []

    for (const edge of edges) {
        const sourceNode = nodesById.get(String(edge.source))
        const targetNode = nodesById.get(String(edge.target))
        if (!sourceNode || !targetNode) {
            continue
        }

        const sourceCenter = getNodeCenter(sourceNode)
        const targetCenter = getNodeCenter(targetNode)

        const startHandleId = `${edge.id}-start-control`
        const endHandleId = `${edge.id}-end-control`
        const geometryPoints = (edge.data?.points ?? []).filter(
            (point) => point.id !== startHandleId && point.id !== endHandleId
        )

        const pathPoints: XYPosition[] = [
            sourceCenter,
            ...geometryPoints,
            targetCenter,
        ]

        for (let index = 0; index < pathPoints.length - 1; index++) {
            segments.push({
                start: pathPoints[index],
                end: pathPoints[index + 1],
            })
        }
    }

    return segments
}

function* spiralOffsets(maxLayer: number): Generator<{ x: number; y: number }> {
    yield { x: 0, y: 0 }

    for (let layer = 1; layer <= maxLayer; layer++) {
        for (let x = -layer; x <= layer; x++) {
            yield { x, y: -layer }
            yield { x, y: layer }
        }

        for (let y = -layer + 1; y <= layer - 1; y++) {
            yield { x: -layer, y }
            yield { x: layer, y }
        }
    }
}

interface NextNodePositionArgs {
    basePosition: XYPosition
    width: number
    height: number
    nodes: Node<RegulatoryNodeProperties>[]
    edges: Edge<EditableRegulatoryEdge>[]
    getIntersectingNodes?: ReactFlowInstance<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >['getIntersectingNodes']
}

export function findNextNodePosition({
    basePosition,
    width,
    height,
    nodes,
    edges,
    getIntersectingNodes,
}: NextNodePositionArgs): XYPosition {
    const nodesById = new Map(nodes.map((node) => [node.id, node]))
    const edgeSegments = getEdgeSegments(edges, nodesById)

    const isFree = (position: XYPosition): boolean => {
        const candidateRect = { x: position.x, y: position.y, width, height }
        const nodeSafeRect = growRect(candidateRect, NODE_CLEARANCE)
        const edgeSafeRect = growRect(candidateRect, EDGE_CLEARANCE)

        const intersectingNodes = getIntersectingNodes
            ? getIntersectingNodes(nodeSafeRect, true)
            : nodes.filter((node) =>
                  rectsIntersect(
                      growRect(getNodeRect(node), NODE_CLEARANCE),
                      nodeSafeRect
                  )
              )

        if (intersectingNodes.length > 0) {
            return false
        }

        if (
            edgeSegments.some((segment) =>
                segmentIntersectsRect(segment, edgeSafeRect)
            )
        ) {
            return false
        }

        return true
    }

    for (const offset of spiralOffsets(MAX_SEARCH_LAYERS)) {
        const candidate = {
            x: basePosition.x + offset.x * SEARCH_STEP,
            y: basePosition.y + offset.y * SEARCH_STEP,
        }

        if (isFree(candidate)) {
            return candidate
        }
    }

    return basePosition
}
