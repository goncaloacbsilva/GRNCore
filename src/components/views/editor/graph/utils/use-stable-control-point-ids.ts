import { useMemo } from 'react'
import type { ControlPoint } from '@/lib/types'

function toStableCoord(value: number): string {
    return Math.round(value * 100).toString(36)
}

export function useStableControlPointIds(
    points: ControlPoint[]
): ControlPoint[] {
    return useMemo(
        () =>
            points.map((point, index) => {
                if (point.id) {
                    return point
                }

                return {
                    ...point,
                    id: `control-${point.prev ?? 'root'}-${index}-${toStableCoord(point.x)}-${toStableCoord(point.y)}`,
                }
            }),
        [points]
    )
}
