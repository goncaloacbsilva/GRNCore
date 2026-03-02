import {
    MarkerType,
    type DefaultEdgeOptions,
    type EdgeTypes,
    type FitViewOptions,
    type NodeTypes,
} from '@xyflow/react'
import { RegulatoryEdge, RegulatoryNode } from './elements'

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
export const DEFAULT_EDGE_OPTIONS: DefaultEdgeOptions = {
    type: 'RegulatoryEdge',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#b1b1b7',
    },
}
