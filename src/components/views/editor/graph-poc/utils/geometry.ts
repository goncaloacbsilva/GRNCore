import { Position, type XYPosition } from '@xyflow/react'
import {
    DEFAULT_ALGORITHM,
    EDGE_ALGORITHM,
    type ControlPoint,
    type EdgeAlgorithm,
} from '../types'
import { createId } from './id'

const HANDLE_OFFSET = 20

type SideVectors = {
    [Position.Left]: XYPosition
    [Position.Right]: XYPosition
    [Position.Top]: XYPosition
    [Position.Bottom]: XYPosition
}

const sideVector: SideVectors = {
    [Position.Left]: { x: -1, y: 0 },
    [Position.Right]: { x: 1, y: 0 },
    [Position.Top]: { x: 0, y: -1 },
    [Position.Bottom]: { x: 0, y: 1 },
}

function getPointDistance(a: XYPosition, b: XYPosition): number {
    return Math.hypot(b.x - a.x, b.y - a.y)
}

function getCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
}: {
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
}): [number, number] {
    const xOffset = Math.abs(targetX - sourceX) / 2
    const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset

    const yOffset = Math.abs(targetY - sourceY) / 2
    const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset

    return [centerX, centerY]
}

function getDirectionVector({
    source,
    sourcePosition = Position.Bottom,
    target,
}: {
    source: XYPosition
    sourcePosition?: Position
    target: XYPosition
}): XYPosition {
    if (sourcePosition === Position.Left || sourcePosition === Position.Right) {
        return source.x < target.x ? { x: 1, y: 0 } : { x: -1, y: 0 }
    }

    return source.y < target.y ? { x: 0, y: 1 } : { x: 0, y: -1 }
}

export function getSmoothStepPoints({
    source,
    sourcePosition = Position.Bottom,
    target,
    targetPosition = Position.Top,
    center = { x: undefined, y: undefined },
    offset = HANDLE_OFFSET,
}: {
    source: XYPosition
    sourcePosition?: Position
    target: XYPosition
    targetPosition?: Position
    center?: { x?: number; y?: number }
    offset?: number
}): XYPosition[] {
    const sourceDir = sideVector[sourcePosition]
    const targetDir = sideVector[targetPosition]

    const sourceGapped = {
        x: source.x + sourceDir.x * offset,
        y: source.y + sourceDir.y * offset,
    }

    const targetGapped = {
        x: target.x + targetDir.x * offset,
        y: target.y + targetDir.y * offset,
    }

    const sourceTarget = getDirectionVector({
        source: sourceGapped,
        sourcePosition,
        target: targetGapped,
    })

    const directionAxis = sourceTarget.x !== 0 ? 'x' : 'y'
    const direction = sourceTarget[directionAxis]

    const sourceGapOffset = { x: 0, y: 0 }
    const targetGapOffset = { x: 0, y: 0 }

    let defaultCenterX: number
    let defaultCenterY: number
    let points: XYPosition[] = []

    const [centerX, centerY] = getCenter({
        sourceX: source.x,
        sourceY: source.y,
        targetX: target.x,
        targetY: target.y,
    })

    if (sourceDir[directionAxis] * targetDir[directionAxis] === -1) {
        defaultCenterX = center.x ?? centerX
        defaultCenterY = center.y ?? centerY

        const verticalSplit = [
            { x: defaultCenterX, y: sourceGapped.y },
            { x: defaultCenterX, y: targetGapped.y },
        ]

        const horizontalSplit = [
            { x: sourceGapped.x, y: defaultCenterY },
            { x: targetGapped.x, y: defaultCenterY },
        ]

        if (sourceDir[directionAxis] === direction) {
            points = directionAxis === 'x' ? verticalSplit : horizontalSplit
        } else {
            points = directionAxis === 'x' ? horizontalSplit : verticalSplit
        }
    } else {
        const vertical = [{ x: sourceGapped.x, y: targetGapped.y }]
        const horizontal = [{ x: targetGapped.x, y: sourceGapped.y }]

        if (directionAxis === 'x') {
            points = sourceDir.x === direction ? horizontal : vertical
        } else {
            points = sourceDir.y === direction ? vertical : horizontal
        }

        if (sourcePosition === targetPosition) {
            const axisDistance = Math.abs(
                source[directionAxis] - target[directionAxis]
            )

            if (axisDistance <= offset) {
                const gap = Math.min(offset - 1, offset - axisDistance)

                if (sourceDir[directionAxis] === direction) {
                    sourceGapOffset[directionAxis] =
                        (sourceGapped[directionAxis] > source[directionAxis]
                            ? -1
                            : 1) * gap
                } else {
                    targetGapOffset[directionAxis] =
                        (targetGapped[directionAxis] > target[directionAxis]
                            ? -1
                            : 1) * gap
                }
            }
        }

        if (sourcePosition !== targetPosition) {
            const oppositeAxis = directionAxis === 'x' ? 'y' : 'x'
            const sourceCrosses =
                sourceDir[directionAxis] === targetDir[oppositeAxis]
            const sourceHigher =
                sourceGapped[oppositeAxis] > targetGapped[oppositeAxis]
            const sourceLower =
                sourceGapped[oppositeAxis] < targetGapped[oppositeAxis]

            if (
                (sourceDir[directionAxis] === 1 &&
                    ((!sourceCrosses && sourceHigher) ||
                        (sourceCrosses && sourceLower))) ||
                (sourceDir[directionAxis] !== 1 &&
                    ((!sourceCrosses && sourceLower) ||
                        (sourceCrosses && sourceHigher)))
            ) {
                points = directionAxis === 'x' ? vertical : horizontal
            }
        }

        const sourceWithOffset = {
            x: sourceGapped.x + sourceGapOffset.x,
            y: sourceGapped.y + sourceGapOffset.y,
        }

        const targetWithOffset = {
            x: targetGapped.x + targetGapOffset.x,
            y: targetGapped.y + targetGapOffset.y,
        }

        const xSpread = Math.max(
            Math.abs(sourceWithOffset.x - points[0].x),
            Math.abs(targetWithOffset.x - points[0].x)
        )

        const ySpread = Math.max(
            Math.abs(sourceWithOffset.y - points[0].y),
            Math.abs(targetWithOffset.y - points[0].y)
        )

        if (xSpread >= ySpread) {
            defaultCenterX = (sourceWithOffset.x + targetWithOffset.x) / 2
            defaultCenterY = points[0].y
        } else {
            defaultCenterX = points[0].x
            defaultCenterY = (sourceWithOffset.y + targetWithOffset.y) / 2
        }
    }

    return [
        source,
        {
            x: sourceGapped.x + sourceGapOffset.x,
            y: sourceGapped.y + sourceGapOffset.y,
        },
        ...points,
        {
            x: targetGapped.x + targetGapOffset.x,
            y: targetGapped.y + targetGapOffset.y,
        },
        target,
    ]
}

function isControlPoint(
    point: XYPosition | ControlPoint
): point is ControlPoint {
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
            return [
                fromX - getCatmullControl(fromX - toX, curvatureScale),
                fromY,
            ]
        case Position.Right:
            return [
                fromX + getCatmullControl(toX - fromX, curvatureScale),
                fromY,
            ]
        case Position.Top:
            return [
                fromX,
                fromY - getCatmullControl(fromY - toY, curvatureScale),
            ]
        case Position.Bottom:
            return [
                fromX,
                fromY + getCatmullControl(toY - fromY, curvatureScale),
            ]
    }
}

function extendStart(
    point: XYPosition,
    next: XYPosition,
    side: Position
): XYPosition {
    const projected = projectHandle(
        side,
        point.x,
        point.y,
        next.x,
        next.y,
        0.25
    )

    return {
        x: next.x + 6 * (point.x - projected[0]),
        y: next.y + 6 * (point.y - projected[1]),
    }
}

function extendEnd(
    point: XYPosition,
    next: XYPosition,
    side: Position
): XYPosition {
    const projected = projectHandle(
        side,
        next.x,
        next.y,
        point.x,
        point.y,
        0.25
    )

    return {
        x: point.x + 6 * (next.x - projected[0]),
        y: point.y + 6 * (next.y - projected[1]),
    }
}

function catmullToBezier(
    value0: number,
    value1: number,
    value2: number,
    value3: number,
    t = 0.5
): number {
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
            (withHandleProjection
                ? extendStart(point, next, sides.fromSide)
                : point)
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
            (withHandleProjection
                ? extendStart(point, next, sides.fromSide)
                : point)
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

function getStepCornerPath(
    previous: XYPosition,
    current: XYPosition,
    next: XYPosition,
    radius: number
): string {
    const cornerRadius = Math.min(
        getPointDistance(previous, current) / 2,
        getPointDistance(current, next) / 2,
        radius
    )

    const { x, y } = current

    if (
        (previous.x === x && x === next.x) ||
        (previous.y === y && y === next.y)
    ) {
        return `L${x} ${y}`
    }

    if (previous.y === y) {
        const horizontalDirection = previous.x < next.x ? -1 : 1
        const verticalDirection = previous.y < next.y ? 1 : -1

        return `L ${x + cornerRadius * horizontalDirection},${y}Q ${x},${y} ${x},${y + cornerRadius * verticalDirection}`
    }

    const horizontalDirection = previous.x < next.x ? 1 : -1
    const verticalDirection = previous.y < next.y ? -1 : 1

    return `L ${x},${y + cornerRadius * verticalDirection}Q ${x},${y} ${x + cornerRadius * horizontalDirection},${y}`
}

function getDefaultStepPoints({
    points,
    initialStepPoints,
}: {
    points: XYPosition[]
    initialStepPoints: XYPosition[]
}): XYPosition[] {
    const shouldUseInitialPoints =
        points.length === 2 &&
        !points.some((point) => 'active' in point && point.active)

    return shouldUseInitialPoints ? initialStepPoints : points
}

function alignToHandleAxis({
    points,
    side,
    handlePosition,
    isTarget = false,
}: {
    points: XYPosition[]
    side: Position
    handlePosition: XYPosition
    isTarget?: boolean
}): void {
    let mainAxis: 'x' | 'y' = 'x'
    let crossAxis: 'x' | 'y' = 'y'

    if (side === Position.Left || side === Position.Right) {
        mainAxis = 'y'
        crossAxis = 'x'
    }

    let fixedIndex = 0
    let movableIndex = 1

    if (isTarget) {
        fixedIndex = points.length - 1
        movableIndex = points.length - 2
    }

    if (
        points[movableIndex] &&
        points[fixedIndex] &&
        points[movableIndex][mainAxis] !== points[fixedIndex][mainAxis]
    ) {
        const vector = sideVector[side]

        points[fixedIndex] = {
            ...points[fixedIndex],
            [crossAxis]:
                vector[crossAxis] * HANDLE_OFFSET + handlePosition[crossAxis],
            [mainAxis]: handlePosition[mainAxis],
        }

        points[movableIndex] = {
            ...points[movableIndex],
            [crossAxis]:
                vector[crossAxis] * HANDLE_OFFSET + handlePosition[crossAxis],
        }
    }

    if (points[movableIndex]?.[mainAxis] === points[fixedIndex]?.[mainAxis]) {
        const vector = sideVector[side]

        points[fixedIndex] = {
            ...points[fixedIndex],
            [mainAxis]: handlePosition[mainAxis],
            [crossAxis]:
                vector[crossAxis] * HANDLE_OFFSET + handlePosition[crossAxis],
        }

        points[movableIndex] = {
            ...points[movableIndex],
            [mainAxis]: handlePosition[mainAxis],
        }
    }
}

export function normalizeStepControlPoints({
    points,
    sides,
    source,
    target,
}: {
    points: ControlPoint[]
    sides: { fromSide: Position; toSide: Position }
    source: XYPosition
    target: XYPosition
}): ControlPoint[] {
    const normalized = [...points]

    alignToHandleAxis({
        points: normalized,
        side: sides.fromSide,
        handlePosition: source,
    })

    alignToHandleAxis({
        points: normalized,
        side: sides.toSide,
        handlePosition: target,
        isTarget: true,
    })

    return normalized
}

export function getStepPath({
    points,
    initialStepPoints,
}: {
    points: XYPosition[]
    initialStepPoints: XYPosition[]
}): string {
    const effectivePoints = getDefaultStepPoints({ points, initialStepPoints })

    return (
        effectivePoints.reduce((path, point, index) => {
            let segment = ''

            if (index > 0 && index < effectivePoints.length - 1) {
                segment = getStepCornerPath(
                    effectivePoints[index - 1],
                    point,
                    effectivePoints[index + 1],
                    5
                )
            } else {
                segment = `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`
            }

            return path + segment
        }, '') || ''
    )
}

function isStepSegmentActive({
    nextPoint,
}: {
    nextPoint: XYPosition | ControlPoint
}): boolean {
    return 'active' in nextPoint ? nextPoint.active : false
}

export function getStepControlPoints({
    points,
    initialStepPoints,
}: {
    points: XYPosition[]
    initialStepPoints: XYPosition[]
}): ControlPoint[] {
    const result: ControlPoint[] = []
    const effectivePoints = getDefaultStepPoints({ points, initialStepPoints })

    for (let index = 1; index < effectivePoints.length - 2; index++) {
        const current = effectivePoints[index] as ControlPoint
        const next = effectivePoints[index + 1] as ControlPoint

        if (!current && !next) {
            continue
        }

        const horizontal = current.x - next.x === 0

        let x = 0
        let y = 0

        if (horizontal) {
            x = current.x
            y = (next.y - current.y) / 2 + current.y
        } else {
            x = (next.x - current.x) / 2 + current.x
            y = current.y
        }

        result.push({
            prev: 'id' in current ? current.id : undefined,
            id: `${current.id ?? ''}-${next.id ?? ''}`,
            active: isStepSegmentActive({
                nextPoint: next,
            }),
            x,
            y,
            direction: horizontal ? 'horizontal' : 'vertical',
        })
    }

    return result
}

export function getEditableControlPoints({
    points,
    algorithm = EDGE_ALGORITHM.BezierCatmullRom,
    sides = {
        fromSide: Position.Left,
        toSide: Position.Right,
    },
    initialStepPoints,
}: {
    points: XYPosition[]
    algorithm?: EdgeAlgorithm
    sides?: { fromSide: Position; toSide: Position }
    initialStepPoints: XYPosition[]
}): ControlPoint[] {
    switch (algorithm) {
        case EDGE_ALGORITHM.Linear:
            return getMidPoints(points)
        case EDGE_ALGORITHM.Step:
            return getStepControlPoints({ points, initialStepPoints })
        case EDGE_ALGORITHM.CatmullRom:
            return getCatmullRomControlPoints(points)
        case EDGE_ALGORITHM.BezierCatmullRom:
            return getCatmullRomControlPoints(points, true, sides)
        default:
            return getCatmullRomControlPoints(points, true, sides)
    }
}

export function getEditablePath({
    points,
    algorithm = DEFAULT_ALGORITHM,
    sides = {
        fromSide: Position.Left,
        toSide: Position.Right,
    },
    initialStepPoints,
}: {
    points: XYPosition[]
    algorithm?: EdgeAlgorithm
    sides?: { fromSide: Position; toSide: Position }
    initialStepPoints: XYPosition[]
}): string {
    switch (algorithm) {
        case EDGE_ALGORITHM.Linear:
            return getLinearPath(points)
        case EDGE_ALGORITHM.Step:
            return getStepPath({ points, initialStepPoints })
        case EDGE_ALGORITHM.CatmullRom:
            return getCatmullRomPath(points)
        case EDGE_ALGORITHM.BezierCatmullRom:
            return getCatmullRomPath(points, true, sides)
        default:
            return getCatmullRomPath(points, true, sides)
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

export { HANDLE_OFFSET }
