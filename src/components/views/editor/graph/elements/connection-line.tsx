import {
    getStraightPath,
    type ConnectionLineComponentProps,
} from '@xyflow/react'

export function CustomConnectionLine({
    fromX,
    fromY,
    toX,
    toY,
}: ConnectionLineComponentProps) {
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
