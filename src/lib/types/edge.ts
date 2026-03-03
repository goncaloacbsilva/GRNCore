import type { XYPosition } from '@xyflow/react'

export const EDGE_ALGORITHM = {
    CatmullRom: 'Catmull-Rom',
    BezierCatmullRom: 'Bezier Catmull-Rom',
    Step: 'Step',
    Linear: 'Linear',
} as const

export type EdgeAlgorithm = (typeof EDGE_ALGORITHM)[keyof typeof EDGE_ALGORITHM]
export const DEFAULT_ALGORITHM: EdgeAlgorithm = EDGE_ALGORITHM.CatmullRom

export type StepDirection = 'horizontal' | 'vertical'

export type ControlPoint = XYPosition & {
    id?: string
    prev?: string
    active: boolean
    direction?: StepDirection
}

export interface EditableEdgeData {
    algorithm?: EdgeAlgorithm
    points?: ControlPoint[]
}
