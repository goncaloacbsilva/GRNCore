export type ControlPoint = [number, number]

/**
 * Computes the shortest Euclidean distance from a point to a line segment.
 */
export const getDistanceToSegment = (
    point: ControlPoint,
    start: ControlPoint,
    end: ControlPoint
): number => {
    const vx = end[0] - start[0]
    const vy = end[1] - start[1]
    const wx = point[0] - start[0]
    const wy = point[1] - start[1]
    const segmentLengthSq = vx * vx + vy * vy

    if (segmentLengthSq < 1e-6) {
        return Math.hypot(point[0] - start[0], point[1] - start[1])
    }

    const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / segmentLengthSq))
    const projectionX = start[0] + t * vx
    const projectionY = start[1] + t * vy

    return Math.hypot(point[0] - projectionX, point[1] - projectionY)
}

/**
 * Returns the nearest point to `center` from a list, with a fallback when empty.
 */
export const getNearestPoint = (
    points: ControlPoint[],
    center: ControlPoint,
    fallback: ControlPoint
): ControlPoint => {
    if (points.length === 0) return fallback

    let nearest = points[0]
    let nearestDistance = Math.hypot(
        nearest[0] - center[0],
        nearest[1] - center[1]
    )

    for (let index = 1; index < points.length; index += 1) {
        const point = points[index]
        const distance = Math.hypot(point[0] - center[0], point[1] - center[1])
        if (distance < nearestDistance) {
            nearest = point
            nearestDistance = distance
        }
    }

    return nearest
}

/**
 * Extracts start/end endpoints from a G6 path representation.
 */
export const getEdgeEndpointsFromPathData = (
    path: unknown
): { source: ControlPoint; target: ControlPoint } | undefined => {
    if (typeof path === 'string') {
        const numbers = path
            .match(/-?\d+(\.\d+)?/g)
            ?.map((value) => Number(value))
            .filter((value) => Number.isFinite(value))

        if (numbers && numbers.length >= 4) {
            return {
                source: [numbers[0], numbers[1]],
                target: [numbers[numbers.length - 2], numbers[numbers.length - 1]],
            }
        }
    }

    if (!Array.isArray(path) || path.length === 0) return undefined

    if (Array.isArray(path[0])) {
        const commands = path as (string | number)[][]
        const startCommand = commands[0]
        if (!Array.isArray(startCommand) || startCommand[0] !== 'M') {
            return undefined
        }

        const source: ControlPoint = [Number(startCommand[1]), Number(startCommand[2])]

        const endCommand = commands[commands.length - 1]
        if (!Array.isArray(endCommand)) return undefined
        const numbers = endCommand
            .slice(1)
            .map((value: string | number) => Number(value))
            .filter((value: number) => Number.isFinite(value))
        if (numbers.length < 2) return undefined

        const target: ControlPoint = [
            numbers[numbers.length - 2],
            numbers[numbers.length - 1],
        ]
        return { source, target }
    }

    const values = path as (string | number)[]
    const numbers = values
        .map((value: string | number) => Number(value))
        .filter((value: number) => Number.isFinite(value))
    if (numbers.length < 4) return undefined

    return {
        source: [numbers[0], numbers[1]],
        target: [numbers[numbers.length - 2], numbers[numbers.length - 1]],
    }
}
