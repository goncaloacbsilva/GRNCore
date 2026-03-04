import {
    type Node,
    type ConnectionLineComponent,
    type EdgeTypes,
    type FitViewOptions,
    type NodeTypes,
} from '@xyflow/react'
import {
    CustomConnectionLine,
    RegulatoryEdge,
    RegulatoryNode,
} from './elements'
import type { InteractionType, RegulatoryNodeProperties } from '@/lib/schema'

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
export const DEFAULT_NODE_WIDTH = 100
export const DEFAULT_NODE_HEIGHT = 35

export const EDGE_TYPES: EdgeTypes = { RegulatoryEdge }
export const DEFAULT_EDGE_TYPE = 'RegulatoryEdge'

export const CONNECTION_LINE_COMPONENT: ConnectionLineComponent<
    Node<RegulatoryNodeProperties>
> = CustomConnectionLine

export interface RegulatoryEdgeStyle {
    stroke: string
    endArrowType?: 'vee' | 'rect' | 'triangleRect'
    endArrowFill?: string
    endArrowStroke?: string
}

export const REGULATORY_EDGE_STYLES: Record<
    InteractionType,
    RegulatoryEdgeStyle
> = {
    activation: {
        stroke: '#00C800',
        endArrowType: 'vee',
        endArrowFill: '#00C800',
        endArrowStroke: '#00C800',
    },
    inhibition: {
        stroke: '#c80000',
        endArrowType: 'rect',
        endArrowFill: '#c80000',
        endArrowStroke: '#c80000',
    },
    dual: {
        stroke: '#0000c8',
        endArrowType: 'triangleRect',
    },
}
