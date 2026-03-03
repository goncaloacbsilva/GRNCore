import { Position, type XYPosition } from '@xyflow/react'
import {
    DEFAULT_ALGORITHM,
    EDGE_ALGORITHM,
    type ControlPoint,
    type EdgeAlgorithm,
} from '@/lib/types'
import { createId } from './id'

function isControlPoint(point: XYPosition | ControlPoint): point is ControlPoint {
    return 'id' in point
}

function getLinearPath(points: XYPosition[]): string {
    if (points.length < 1) {
        return ''
    }

    let path = `M ${points[0].x} ${points[0].y}`

    for (let index = 0; index < points.length; index++) {
        path += ` L ${points[index].x} ${points[index].y}`
    }

    return path
}

function getMidPoints(points: XYPosition[]): ControlPoint[] {
    const result: ControlPoint[] = []

    for (let index = 0; index < points.length - 1; index++) {
        const current = points[index]
        const next = points[index + 1]

        if (isControlPoint(current)) {
            result.push(current)
        }

        result.push({
            prev: isControlPoint(current) ? current.id : undefined,
            id: createId('spline'),
            active: false,
            x: (current.x + next.x) / 2,
            y: (current.y + next.y) / 2,
        })
    }

    return result
}

function getCatmullControl(value: number, curvatureScale: number): number {
    return value >= 0 ? value * 0.5 : curvatureScale * 25 * Math.sqrt(-value)
}

function projectHandle(
    side: Position,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    curvatureScale: number
): [number, number] {
    switch (side) {
        case Position.Left:
            return [fromX - getCatmullControl(fromX - toX, curvatureScale), fromY]
        case Position.Right:
            return [fromX + getCatmullControl(toX - fromX, curvatureScale), fromY]
        case Position.Top:
            return [fromX, fromY - getCatmullControl(fromY - toY, curvatureScale)]
        case Position.Bottom:
            return [fromX, fromY + getCatmullControl(toY - fromY, curvatureScale)]
    }
}

function extendStart(point: XYPosition, next: XYPosition, side: Position): XYPosition {
    const projected = projectHandle(side, point.x, point.y, next.x, next.y, 0.25)

    return {
        x: next.x + 6 * (point.x - projected[0]),
        y: next.y + 6 * (point.y - projected[1]),
    }
}

function extendEnd(point: XYPosition, next: XYPosition, side: Position): XYPosition {
    const projected = projectHandle(side, next.x, next.y, point.x, point.y, 0.25)

    return {
        x: point.x + 6 * (next.x - projected[0]),
        y: point.y + 6 * (next.y - projected[1]),
    }
}

function catmullToBezier(value0: number, value1: number, value2: number, value3: number, t = 0.5): number {
    const t2 = t ** 2
    const t3 = t ** 3

    return (
        0.5 *
        (2 * value1 +
            (-value0 + value2) * t +
            (2 * value0 - 5 * value1 + 4 * value2 - value3) * t2 +
            (-value0 + 3 * value1 - 3 * value2 + value3) * t3)
    )
}

function getCatmullRomPath(
    points: XYPosition[],
    withHandleProjection = false,
    sides: { fromSide: Position; toSide: Position } = {
        fromSide: Position.Left,
        toSide: Position.Right,
    }
): string {
    if (points.length < 2) {
        return ''
    }

    let path = `M ${points[0].x} ${points[0].y}`

    for (let index = 0; index < points.length - 1; index++) {
        const point = points[index]
        const next = points[index + 1]
        const previous =
            points[index - 1] ??
            (withHandleProjection ? extendStart(point, next, sides.fromSide) : point)
        const afterNext =
            points[index + 2] ??
            (withHandleProjection ? extendEnd(point, next, sides.toSide) : next)

        const cp1 = {
            x: (-previous.x + 6 * point.x + next.x) / 6,
            y: (-previous.y + 6 * point.y + next.y) / 6,
        }

        const cp2 = {
            x: (point.x + 6 * next.x - afterNext.x) / 6,
            y: (point.y + 6 * next.y - afterNext.y) / 6,
        }

        path += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${next.x} ${next.y}`
    }

    return path
}

function getCatmullRomControlPoints(
    points: XYPosition[],
    withHandleProjection = false,
    sides: { fromSide: Position; toSide: Position } = {
        fromSide: Position.Left,
        toSide: Position.Right,
    }
): ControlPoint[] {
    const result: ControlPoint[] = []

    for (let index = 0; index < points.length - 1; index++) {
        const point = points[index]
        const next = points[index + 1]
        const previous =
            points[index - 1] ??
            (withHandleProjection ? extendStart(point, next, sides.fromSide) : point)
        const afterNext =
            points[index + 2] ??
            (withHandleProjection ? extendEnd(point, next, sides.toSide) : next)

        if (isControlPoint(point)) {
            result.push(point)
        }

        result.push({
            id: '',
            active: false,
            x: catmullToBezier(previous.x, point.x, next.x, afterNext.x),
            y: catmullToBezier(previous.y, point.y, next.y, afterNext.y),
        })
    }

    return result
}

export function getEditableControlPoints({
    points,
    algorithm = DEFAULT_ALGORITHM,
    sides = {
        fromSide: Position.Left,
        toSide: Position.Right,
    },
}: {
    points: XYPosition[]
    algorithm?: EdgeAlgorithm
    sides?: { fromSide: Position; toSide: Position }
}): ControlPoint[] {
    switch (algorithm) {
        case EDGE_ALGORITHM.Linear:
            return getMidPoints(points)
        case EDGE_ALGORITHM.CatmullRom:
            return getCatmullRomControlPoints(points)
        default:
            return getCatmullRomControlPoints(points, false, sides)
    }
}

export function getEditablePath({
    points,
    algorithm = DEFAULT_ALGORITHM,
    sides,
}: {
    points: XYPosition[]
    algorithm?: EdgeAlgorithm
    sides?: { fromSide: Position; toSide: Position }
}): string {
    switch (algorithm) {
        case EDGE_ALGORITHM.Linear:
            return getLinearPath(points)
        case EDGE_ALGORITHM.CatmullRom:
            return getCatmullRomPath(points)
        default:
            return getCatmullRomPath(points, false, sides)
    }
}

export function pointsEqual(a?: XYPosition, b?: XYPosition): boolean {
    return a?.x === b?.x && a?.y === b?.y
}

export function compressHorizontalRuns(points: ControlPoint[]): ControlPoint[] {
    if (points.length < 3) {
        return points
    }

    const compressed: ControlPoint[] = []
    let index = 0

    while (index < points.length) {
        const y = points[index].y
        let next = index + 1

        while (next < points.length && points[next].y === y) {
            next += 1
        }

        if (next - index >= 3) {
            compressed.push(points[index])
            compressed.push(points[next - 1])
        } else {
            for (let cursor = index; cursor < next; cursor++) {
                compressed.push(points[cursor])
            }
        }

        index = next
    }

    return compressed
}

const ORTHOGONAL_AXIS_RATIO_THRESHOLD = 0.22

function segmentOrientation(
    start: XYPosition,
    end: XYPosition
): 'horizontal' | 'vertical' | null {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const dominant = Math.max(absDx, absDy)

    if (dominant < 1e-6) {
        return null
    }

    const axisRatio = Math.min(absDx, absDy) / dominant

    if (axisRatio > ORTHOGONAL_AXIS_RATIO_THRESHOLD) {
        return null
    }

    return absDx >= absDy ? 'horizontal' : 'vertical'
}

export function shouldPromoteCatmullToLinear(controlPoints: XYPosition[]): boolean {
    if (controlPoints.length < 2) {
        return false
    }

    for (let index = 0; index < controlPoints.length - 1; index++) {
        const orientation = segmentOrientation(
            controlPoints[index],
            controlPoints[index + 1]
        )

        if (!orientation) {
            continue
        }

        return true
    }

    return false
}
