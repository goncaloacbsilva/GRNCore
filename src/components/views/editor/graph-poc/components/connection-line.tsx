import { useEffect, useMemo, useState } from 'react'
import {
    MarkerType,
    type ConnectionLineComponentProps,
    Position,
} from '@xyflow/react'
import { connectionLineStore, useConnectionLineStore } from '../connection-line-store'
import { DEFAULT_ALGORITHM, EDGE_COLORS } from '../types'
import {
    getEditablePath,
    getSmoothStepPoints,
    HANDLE_OFFSET,
} from '../utils/geometry'

const APPEND_DISTANCE = DEFAULT_ALGORITHM === 'Bezier Catmull-Rom' ? 50 : 25

export function EditableConnectionLine({
    fromX,
    fromY,
    toX,
    toY,
    fromPosition,
    toPosition,
    connectionStatus,
}: ConnectionLineComponentProps) {
    const { connectionLinePath } = useConnectionLineStore()
    const [isSpaceDown, setIsSpaceDown] = useState(false)

    const lastPoint = connectionLinePath[connectionLinePath.length - 1] ?? {
        x: fromX,
        y: fromY,
    }

    const distance = Math.hypot(lastPoint.x - toX, lastPoint.y - toY)
    const shouldAppend = isSpaceDown && distance > APPEND_DISTANCE

    useEffect(() => {
        if (shouldAppend) {
            connectionLineStore.setState({
                connectionLinePath: [
                    ...connectionLinePath,
                    {
                        x: toX,
                        y: toY,
                    },
                ],
            })
        }
    }, [connectionLinePath, shouldAppend, toX, toY])

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent): void {
            if (event.key === ' ') {
                setIsSpaceDown(true)
            }
        }

        function onKeyUp(event: KeyboardEvent): void {
            if (event.key === ' ') {
                setIsSpaceDown(false)
            }
        }

        connectionLineStore.setState({ connectionLinePath: [] })

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            setIsSpaceDown(false)
        }
    }, [])

    const initialStepPoints = useMemo(
        () =>
            getSmoothStepPoints({
                source: { x: fromX, y: fromY },
                target: { x: toX, y: toY },
                offset: HANDLE_OFFSET,
                sourcePosition: fromPosition ?? Position.Bottom,
                targetPosition: toPosition ?? Position.Top,
            }).map((point, index) => ({
                ...point,
                id: `${index}`,
            })),
        [fromPosition, fromX, fromY, toPosition, toX, toY]
    )

    const path = getEditablePath({
        points: [
            { x: fromX, y: fromY },
            ...connectionLinePath,
            { x: toX, y: toY },
        ],
        algorithm: DEFAULT_ALGORITHM,
        sides: {
            fromSide: fromPosition ?? Position.Bottom,
            toSide: toPosition ?? Position.Top,
        },
        initialStepPoints,
    })

    return (
        <g>
            <path
                fill="none"
                stroke={EDGE_COLORS[DEFAULT_ALGORITHM]}
                strokeWidth={2}
                className={connectionStatus === 'valid' ? '' : 'animated'}
                d={path}
                markerStart={MarkerType.ArrowClosed}
                markerEnd={MarkerType.ArrowClosed}
            />
        </g>
    )
}
