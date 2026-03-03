import type { XYPosition } from '@xyflow/react'
import type { ControlPoint } from '@/lib/types'

export type SetControlPoints = (
    updater: (points: ControlPoint[]) => ControlPoint[]
) => void

export type ControlPointHandleProps = {
    id: string
    index: number
    x: number
    y: number
    color: string
    active: boolean
    selected: boolean
    setControlPoints: SetControlPoints
    selectEdge: () => void
    insertMode?: 'auto' | 'start' | 'end'
    allowCreate?: boolean
}

export type AnchorHandleProps = {
    id: string
    x: number
    y: number
    color: string
    selected: boolean
    onChange: (next: XYPosition) => void
    selectEdge: () => void
}
