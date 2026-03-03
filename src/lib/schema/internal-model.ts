import { type Edge, type Node } from '@xyflow/react'
import type { RegulatoryNodeProperties } from './regulatory-node-properties'
import type { RegulatoryEdgeProperties } from './regulatory-edge-properties'
import type { EditableEdgeData } from '../types'

export interface EditableRegulatoryEdge
    extends
        RegulatoryEdgeProperties,
        EditableEdgeData,
        Record<string, unknown> {}

export interface InternalGRNModel {
    nodes: Node<RegulatoryNodeProperties>[]
    edges: Edge<EditableRegulatoryEdge>[]
}
