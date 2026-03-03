import { useRef } from 'react'
import type { ControlPoint } from '@/lib/types'
import { createId } from './id'

export function useStableControlPointIds(points: ControlPoint[]): ControlPoint[] {
    const idsRef = useRef<string[]>([])

    if (idsRef.current.length === points.length) {
        return points.map((point, index) => {
            if (point.id) {
                return point
            }

            return {
                ...point,
                id: idsRef.current[index],
            }
        })
    }

    idsRef.current = []

    return points.map((point, index) => {
        if (point.id) {
            idsRef.current[index] = point.id
            return point
        }

        const generatedId = createId('control')
        idsRef.current[index] = generatedId

        return {
            ...point,
            id: generatedId,
        }
    })
}
