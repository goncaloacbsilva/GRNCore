import {
    type EdgeTypes,
    type FitViewOptions,
    type NodeTypes,
} from '@xyflow/react'
import { RegulatoryEdge, RegulatoryNode } from './elements'
import type { InteractionType } from '@/lib/schema'

export const PAN_ON_DRAG = false
export const PAN_ON_SCROLL = true
export const SELECTION_ON_DRAG = true

export const FIT_VIEW_OPTIONS: FitViewOptions = {
    maxZoom: 1.5,
}

export const BACKGROUND_COLOR = '#e5e7eb'
export const BACKGROUND_DOTS_RADIUS = 2.5

export const MINIMAP_NODE_COLOR = '#e5e7eb'

export const NODE_TYPES: NodeTypes = { RegulatoryNode }
export const DEFAULT_NODE_TYPE = 'RegulatoryNode'

export const EDGE_TYPES: EdgeTypes = { RegulatoryEdge }
export const DEFAULT_EDGE_TYPE = 'RegulatoryEdge'

export type RegulatoryEdgeStyle = {
    stroke: string
    endArrow?: boolean
    endArrowType?: 'vee' | 'rect' | 'triangleRect'
    endArrowSize?: number | [number, number]
    endArrowOffset?: number
    endArrowFill?: string
    endArrowStroke?: string
}

export const REGULATORY_EDGE_STYLES: Record<InteractionType, RegulatoryEdgeStyle> = {
    activation: {
        stroke: '#00C800',
        endArrow: true,
        endArrowType: 'vee',
        endArrowSize: 10,
        endArrowFill: '#00C800',
        endArrowStroke: '#00C800',
    },
    inhibition: {
        stroke: '#c80000',
        endArrow: true,
        endArrowType: 'rect',
        endArrowSize: [2, 14],
        endArrowOffset: 8,
        endArrowFill: '#c80000',
        endArrowStroke: '#c80000',
    },
    dual: {
        stroke: '#0000c8',
        endArrow: true,
        endArrowType: 'triangleRect',
    },
}
