import {
    BaseEdge,
    getStraightPath,
    useStore,
    useInternalNode,
    type Edge,
    type EdgeProps,
} from '@xyflow/react'
import { getEdgeParams, getParallelEdgeMeta } from '../utils'
import type { RegulatoryEdgeProperties } from '@/lib/schema'

const PARALLEL_EDGE_SPACING = 14

export function RegulatoryEdge({
    id,
    source,
    target,
    markerEnd,
    style,
}: EdgeProps<Edge<RegulatoryEdgeProperties>>) {
    const sourceNode = useInternalNode(source)
    const targetNode = useInternalNode(target)
    const edges = useStore((state) => state.edges)

    if (!sourceNode || !targetNode) {
        return null
    }

    const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode)
    const { centeredIndex } = getParallelEdgeMeta(edges, id, source, target)
    const dx = tx - sx
    const dy = ty - sy
    const length = Math.hypot(dx, dy)
    const canonicalDirection = source <= target ? 1 : -1
    const normalX =
        length > 1e-6 ? ((-dy / length) * canonicalDirection) : 0
    const normalY =
        length > 1e-6 ? ((dx / length) * canonicalDirection) : 0
    const offset = centeredIndex * PARALLEL_EDGE_SPACING
    const offsetSourceX = sx + normalX * offset
    const offsetSourceY = sy + normalY * offset
    const offsetTargetX = tx + normalX * offset
    const offsetTargetY = ty + normalY * offset

    const [path] = getStraightPath({
        sourceX: offsetSourceX,
        sourceY: offsetSourceY,
        targetX: offsetTargetX,
        targetY: offsetTargetY,
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
