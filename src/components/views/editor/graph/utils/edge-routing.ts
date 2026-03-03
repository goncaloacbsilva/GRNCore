import { Position, type Edge, type InternalNode, type XYPosition } from '@xyflow/react'

export function projectToNodePerimeter(
    node: InternalNode,
    pointer: XYPosition
): XYPosition {
    const width = node.measured.width ?? 0
    const height = node.measured.height ?? 0
    const nodeX = node.internals.positionAbsolute.x
    const nodeY = node.internals.positionAbsolute.y
    const centerX = nodeX + width / 2
    const centerY = nodeY + height / 2

    const w = width / 2
    const h = height / 2
    const dx = pointer.x - centerX
    const dy = pointer.y - centerY
    const xx1 = dx / (2 * w || 1) - dy / (2 * h || 1)
    const yy1 = dx / (2 * w || 1) + dy / (2 * h || 1)
    const divisor = Math.abs(xx1) + Math.abs(yy1)

    if (divisor < 1e-6) {
        return { x: centerX, y: nodeY }
    }

    const a = 1 / divisor
    const xx3 = a * xx1
    const yy3 = a * yy1

    return {
        x: w * (xx3 + yy3) + centerX,
        y: h * (-xx3 + yy3) + centerY,
    }
}

export function getMarkerGapPoint({
    tip,
    from,
    markerTipGap,
    fallbackNormal,
}: {
    tip: XYPosition
    from: XYPosition
    markerTipGap: number
    fallbackNormal: XYPosition
}): XYPosition {
    const dx = tip.x - from.x
    const dy = tip.y - from.y
    const length = Math.hypot(dx, dy)

    if (length > 1e-6) {
        return {
            x: tip.x - (dx / length) * markerTipGap,
            y: tip.y - (dy / length) * markerTipGap,
        }
    }

    return {
        x: tip.x - fallbackNormal.x * markerTipGap,
        y: tip.y - fallbackNormal.y * markerTipGap,
    }
}

export function getLeastConnectedLoopSide({
    nodeId,
    node,
    edges,
    nodeLookup,
}: {
    nodeId: string
    node: InternalNode
    edges: Edge[]
    nodeLookup: ReadonlyMap<string, InternalNode>
}): Position {
    const nodeWidth = node.measured.width ?? 0
    const nodeHeight = node.measured.height ?? 0
    const nodeX = node.internals.positionAbsolute.x
    const nodeY = node.internals.positionAbsolute.y
    const nodeCenter = {
        x: nodeX + nodeWidth / 2,
        y: nodeY + nodeHeight / 2,
    }

    const connectivityBySide: Record<Position, number> = {
        [Position.Top]: 0,
        [Position.Right]: 0,
        [Position.Bottom]: 0,
        [Position.Left]: 0,
    }

    for (const edge of edges) {
        const edgeSource = String(edge.source)
        const edgeTarget = String(edge.target)
        if (edgeSource === nodeId && edgeTarget === nodeId) {
            continue
        }

        if (edgeSource !== nodeId && edgeTarget !== nodeId) {
            continue
        }

        const otherNodeId = edgeSource === nodeId ? edgeTarget : edgeSource
        const otherNode = nodeLookup.get(otherNodeId)
        if (!otherNode) {
            continue
        }

        const otherWidth = otherNode.measured.width ?? 0
        const otherHeight = otherNode.measured.height ?? 0
        const otherCenter = {
            x: otherNode.internals.positionAbsolute.x + otherWidth / 2,
            y: otherNode.internals.positionAbsolute.y + otherHeight / 2,
        }

        const dx = otherCenter.x - nodeCenter.x
        const dy = otherCenter.y - nodeCenter.y
        const side =
            Math.abs(dx) >= Math.abs(dy)
                ? dx >= 0
                    ? Position.Right
                    : Position.Left
                : dy >= 0
                  ? Position.Bottom
                  : Position.Top

        connectivityBySide[side] += 1
    }

    const preferredSideOrder = [
        Position.Top,
        Position.Right,
        Position.Bottom,
        Position.Left,
    ]

    return preferredSideOrder.reduce((best, candidate) =>
        connectivityBySide[candidate] < connectivityBySide[best]
            ? candidate
            : best
    )
}

export function isSingleControlPointOrthogonal({
    source,
    pivot,
    target,
    threshold = 0.22,
}: {
    source: XYPosition
    pivot: XYPosition
    target: XYPosition
    threshold?: number
}): boolean {
    const getOrientation = (
        from: XYPosition,
        to: XYPosition
    ): 'horizontal' | 'vertical' | null => {
        const dx = Math.abs(to.x - from.x)
        const dy = Math.abs(to.y - from.y)
        const dominant = Math.max(dx, dy)

        if (dominant < 1e-6) {
            return null
        }

        const axisRatio = Math.min(dx, dy) / dominant
        if (axisRatio > threshold) {
            return null
        }

        return dx >= dy ? 'horizontal' : 'vertical'
    }

    const first = getOrientation(source, pivot)
    const second = getOrientation(pivot, target)
    return Boolean(first && second && first !== second)
}
