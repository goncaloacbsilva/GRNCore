import { type CircleStyleProps } from '@antv/g'
import type { Point } from '@antv/g6'
import {
    CONTROL_POINT_FILL,
    CONTROL_POINT_RADIUS,
    CONTROL_POINT_STROKE,
} from '../constants'

export type ControlPointTuple = [number, number]

export function toControlPointTuple(
    value: unknown
): ControlPointTuple | undefined {
    if (
        !Array.isArray(value) ||
        value.length !== 2 ||
        !Number.isFinite(value[0]) ||
        !Number.isFinite(value[1])
    ) {
        return undefined
    }

    return value as ControlPointTuple
}

export function toControlPointTuples(value: unknown): ControlPointTuple[] {
    if (!Array.isArray(value)) return []

    return value.filter(
        (point): point is ControlPointTuple =>
            Array.isArray(point) &&
            point.length === 2 &&
            Number.isFinite(point[0]) &&
            Number.isFinite(point[1])
    )
}

export function getControlPointStyle(
    point: ControlPointTuple
): CircleStyleProps {
    return {
        cx: point[0],
        cy: point[1],
        r: CONTROL_POINT_RADIUS,
        fill: CONTROL_POINT_FILL,
        stroke: CONTROL_POINT_STROKE,
        lineWidth: 1.5,
        cursor: 'move',
        zIndex: 1,
    }
}

export function getNearestControlPoint(
    reference: Point,
    points: ControlPointTuple[]
): ControlPointTuple | undefined {
    if (points.length === 0) return undefined

    let nearest = points[0]
    let nearestDistance = Math.hypot(
        nearest[0] - reference[0],
        nearest[1] - reference[1]
    )

    for (let index = 1; index < points.length; index += 1) {
        const point = points[index]
        const distance = Math.hypot(
            point[0] - reference[0],
            point[1] - reference[1]
        )

        if (distance < nearestDistance) {
            nearest = point
            nearestDistance = distance
        }
    }

    return nearest
}

export function isAxisAligned(a: Point, b: Point, tolerance: number): boolean {
    return (
        Math.abs(a[0] - b[0]) <= tolerance || Math.abs(a[1] - b[1]) <= tolerance
    )
}
