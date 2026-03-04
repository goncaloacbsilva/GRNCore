import {
    getStraightPath,
    type Node,
    type ConnectionLineComponentProps,
} from '@xyflow/react'
import type { RegulatoryNodeProperties } from '@/lib/schema'

export function CustomConnectionLine({
    fromX,
    fromY,
    toX,
    toY,
}: ConnectionLineComponentProps<Node<RegulatoryNodeProperties>>) {
    const [edgePath] = getStraightPath({
        sourceX: fromX,
        sourceY: fromY,
        targetX: toX,
        targetY: toY,
    })

    return (
        <g>
            <path
                style={{
                    stroke: '#b1b1b7',
                }}
                fill="none"
                d={edgePath}
            />
        </g>
    )
}
