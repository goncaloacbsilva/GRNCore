import type { Edge, XYPosition } from '@xyflow/react'

export const EDGE_ALGORITHM = {
    CatmullRom: 'Catmull-Rom',
    BezierCatmullRom: 'Bezier Catmull-Rom',
    Step: 'Step',
    Linear: 'Linear',
} as const

export type EdgeAlgorithm =
    (typeof EDGE_ALGORITHM)[keyof typeof EDGE_ALGORITHM]

export const EDGE_COLORS: Record<EdgeAlgorithm, string> = {
    Linear: '#0375ff',
    'Bezier Catmull-Rom': '#68D391',
    'Catmull-Rom': '#FF0072',
    Step: '#FF5733',
}

export const DEFAULT_ALGORITHM: EdgeAlgorithm = EDGE_ALGORITHM.Step

export type StepDirection = 'horizontal' | 'vertical'

export type ControlPoint = XYPosition & {
    id?: string
    prev?: string
    active: boolean
    direction?: StepDirection
}

export type EditableEdgeData = {
    algorithm?: EdgeAlgorithm
    points: ControlPoint[]
}

export type EditableEdge = Edge<EditableEdgeData, 'editable-edge'>
