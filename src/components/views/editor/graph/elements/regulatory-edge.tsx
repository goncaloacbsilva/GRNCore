import {
    BaseEdge,
    getStraightPath,
    useInternalNode,
    type Edge,
    type EdgeProps,
} from '@xyflow/react'
import { getEdgeParams } from '../utils'
import type { RegulatoryEdgeProperties } from '@/lib/schema'

export function RegulatoryEdge({
    id,
    source,
    target,
    markerEnd,
    style,
}: EdgeProps<Edge<RegulatoryEdgeProperties>>) {
    const sourceNode = useInternalNode(source)
    const targetNode = useInternalNode(target)

    if (!sourceNode || !targetNode) {
        return null
    }

    const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode)

    const [path] = getStraightPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    })

    return (
        <BaseEdge
            id={id}
            className="react-flow__edge-path"
            path={path}
            markerEnd={markerEnd}
            style={style}
        />
    )
}
