import { type Edge, type Node } from '@xyflow/react'
import type { RegulatoryNodeProperties } from './regulatory-node-properties'
import type { RegulatoryEdgeProperties } from './regulatory-edge-properties'

export interface InternalGRNModel {
    nodes: Node<RegulatoryNodeProperties>[]
    edges: Edge<RegulatoryEdgeProperties>[]
}
