import type { PathArray, Point } from '@antv/g6'
import type { ControlPointTuple } from './regulatory-edge-control-point'

interface BuildPathFromControlPointsOptions {
    sourcePoint: Point
    targetPoint: Point
    additionalPoints: ControlPointTuple[]
    axisAlignmentTolerance: number
    sourceAligned: boolean
    targetAligned: boolean
}

/**
 * Computes a quadratic Bezier control point that forces the curve through a midpoint.
 */
function getQuadraticControlFromMidpoint(
    sourcePoint: Point,
    targetPoint: Point,
    midpoint: Point
): Point {
    return [
        2 * midpoint[0] - (sourcePoint[0] + targetPoint[0]) / 2,
        2 * midpoint[1] - (sourcePoint[1] + targetPoint[1]) / 2,
    ]
}

/**
 * Builds a polyline path and orthogonalizes start/end-adjacent segments when requested.
 */
function getOrthogonalPath(
    anchors: ControlPointTuple[],
    axisAlignmentTolerance: number,
    orthogonalStart: boolean,
    orthogonalEnd: boolean
): PathArray {
    const path: PathArray = [['M', anchors[0][0], anchors[0][1]]]
    let lastPoint: ControlPointTuple = [anchors[0][0], anchors[0][1]]

    const pushLine = (point: ControlPointTuple) => {
        if (
            Math.abs(point[0] - lastPoint[0]) <= axisAlignmentTolerance &&
            Math.abs(point[1] - lastPoint[1]) <= axisAlignmentTolerance
        ) {
            return
        }

        path.push(['L', point[0], point[1]])
        lastPoint = point
    }

    for (let index = 1; index < anchors.length; index += 1) {
        const from = anchors[index - 1]
        const to = anchors[index]

        const dx = Math.abs(to[0] - from[0])
        const dy = Math.abs(to[1] - from[1])
        const shouldOrthogonalizeSegment =
            (orthogonalStart && index === 1) ||
            (orthogonalEnd && index === anchors.length - 1)

        if (
            !shouldOrthogonalizeSegment ||
            dx <= axisAlignmentTolerance ||
            dy <= axisAlignmentTolerance
        ) {
            pushLine([to[0], to[1]])
            continue
        }

        const elbowA: ControlPointTuple = [to[0], from[1]]
        const elbowB: ControlPointTuple = [from[0], to[1]]
        const preferHorizontalFirst = dx >= dy
        const elbow = preferHorizontalFirst ? elbowA : elbowB

        pushLine(elbow)
        pushLine([to[0], to[1]])
    }

    return path
}

/**
 * Converts Catmull-Rom anchors to a cubic Bezier path.
 */
function getCatmullRomPath(anchors: ControlPointTuple[]): PathArray {
    const path: PathArray = [['M', anchors[0][0], anchors[0][1]]]

    for (let index = 0; index < anchors.length - 1; index += 1) {
        const p0 = index === 0 ? anchors[index] : anchors[index - 1]
        const p1 = anchors[index]
        const p2 = anchors[index + 1]
        const p3 =
            index + 2 < anchors.length ? anchors[index + 2] : anchors[index + 1]

        const c1: ControlPointTuple = [
            p1[0] + (p2[0] - p0[0]) / 6,
            p1[1] + (p2[1] - p0[1]) / 6,
        ]
        const c2: ControlPointTuple = [
            p2[0] - (p3[0] - p1[0]) / 6,
            p2[1] - (p3[1] - p1[1]) / 6,
        ]

        path.push(['C', c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]])
    }

    return path
}

/**
 * Computes the default quadratic control point used for non-custom edges.
 */
export function getDefaultControlPoint(
    sourcePoint: Point,
    targetPoint: Point,
    curvePosition: number,
    curveOffset: number
): Point {
    const dx = targetPoint[0] - sourcePoint[0]
    const dy = targetPoint[1] - sourcePoint[1]
    const length = Math.hypot(dx, dy)

    if (!length) return [sourcePoint[0], sourcePoint[1]]

    const baseX = sourcePoint[0] + curvePosition * dx
    const baseY = sourcePoint[1] + curvePosition * dy
    const perpX = dy / length
    const perpY = -dx / length

    return [baseX + curveOffset * perpX, baseY + curveOffset * perpY]
}

/**
 * Computes the control point for a self-loop quadratic path.
 */
export function getSelfLoopControlPoint(
    sourcePoint: Point,
    targetPoint: Point,
    center: Point
): Point {
    const midX = (sourcePoint[0] + targetPoint[0]) / 2
    const midY = (sourcePoint[1] + targetPoint[1]) / 2

    let dx = midX - center[0]
    let dy = midY - center[1]
    const length = Math.hypot(dx, dy)

    if (length < 1e-6) {
        dx = 0
        dy = -1
    } else {
        dx /= length
        dy /= length
    }

    const sourceDist = Math.hypot(
        sourcePoint[0] - center[0],
        sourcePoint[1] - center[1]
    )
    const targetDist = Math.hypot(
        targetPoint[0] - center[0],
        targetPoint[1] - center[1]
    )
    const offset = Math.max(sourceDist, targetDist) + 36

    return [midX + dx * offset, midY + dy * offset]
}

/**
 * Builds the edge path from additional control points using orthogonal, quadratic,
 * or Catmull-Rom strategies depending on point count and alignment.
 */
export function buildPathFromControlPoints({
    sourcePoint,
    targetPoint,
    additionalPoints,
    axisAlignmentTolerance,
    sourceAligned,
    targetAligned,
}: BuildPathFromControlPointsOptions): PathArray {
    const anchors: ControlPointTuple[] = [
        [sourcePoint[0], sourcePoint[1]],
        ...additionalPoints,
        [targetPoint[0], targetPoint[1]],
    ]

    if (sourceAligned || targetAligned) {
        return getOrthogonalPath(
            anchors,
            axisAlignmentTolerance,
            sourceAligned,
            targetAligned
        )
    }

    if (additionalPoints.length === 1) {
        const controlPoint = getQuadraticControlFromMidpoint(
            sourcePoint,
            targetPoint,
            additionalPoints[0] as Point
        )

        return [
            ['M', sourcePoint[0], sourcePoint[1]],
            [
                'Q',
                controlPoint[0],
                controlPoint[1],
                targetPoint[0],
                targetPoint[1],
            ],
        ]
    }

    return getCatmullRomPath(anchors)
}
