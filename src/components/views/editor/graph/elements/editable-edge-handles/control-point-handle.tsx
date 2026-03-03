import { useReactFlow, useStore, type XYPosition } from '@xyflow/react'
import { type ControlPointHandleProps } from './types'

export function ControlPointHandle({
    id,
    index,
    x,
    y,
    color,
    active,
    selected,
    setControlPoints,
    selectEdge,
    insertMode = 'auto',
    allowCreate = true,
}: ControlPointHandleProps) {
    const domNode = useStore((state) => state.domNode)
    const { screenToFlowPosition } = useReactFlow()

    const updatePoint = (next: XYPosition) => {
        setControlPoints((points) => {
            const existingIndex = points.findIndex((point) => point.id === id)

            if (existingIndex >= 0) {
                return points.map((point) =>
                    point.id === id
                        ? {
                              ...point,
                              ...next,
                              active: true,
                          }
                        : point
                )
            }

            if (!allowCreate) {
                return points
            }

            if (insertMode === 'start') {
                return [
                    {
                        ...next,
                        id,
                        active: true,
                    },
                    ...points,
                ]
            }

            if (insertMode === 'end') {
                return [
                    ...points,
                    {
                        ...next,
                        id,
                        active: true,
                    },
                ]
            }

            if (index !== 0) {
                if (points.length === 0) {
                    return [
                        {
                            ...next,
                            id,
                            active: true,
                        },
                    ]
                }

                const insertionAnchor = Math.max(0, Math.floor((index - 1) / 2))
                const insertAt = Math.min(insertionAnchor + 1, points.length)

                return [
                    ...points.slice(0, insertAt),
                    {
                        ...next,
                        id,
                        active: true,
                    },
                    ...points.slice(insertAt),
                ]
            }

            return [
                {
                    ...next,
                    id,
                    active: true,
                },
                ...points,
            ]
        })
    }

    const removePoint = () => {
        setControlPoints((points) => points.filter((point) => point.id !== id))
    }

    return (
        <circle
            tabIndex={0}
            id={id}
            className={`nopan nodrag${active ? ' active' : ''}`}
            cx={x}
            cy={y}
            r={active ? 4 : 3}
            strokeOpacity={active ? 1 : 0.3}
            stroke={color}
            fill={active ? color : 'white'}
            aria-selected={selected}
            style={{ pointerEvents: 'all' }}
            onContextMenu={(event) => {
                event.preventDefault()
                if (active) {
                    removePoint()
                }
            }}
            onPointerDown={(event) => {
                if (event.button === 2) {
                    return
                }
                selectEdge()
                event.preventDefault()
                event.stopPropagation()
                event.nativeEvent.stopImmediatePropagation()

                updatePoint({ x, y })

                const target = domNode ?? window

                const onPointerMove = (moveEvent: Event) => {
                    if (!(moveEvent instanceof PointerEvent)) {
                        return
                    }
                    moveEvent.preventDefault()

                    updatePoint(
                        screenToFlowPosition({
                            x: moveEvent.clientX,
                            y: moveEvent.clientY,
                        })
                    )
                }

                const onPointerEnd = (endEvent: Event) => {
                    if (!(endEvent instanceof PointerEvent)) {
                        return
                    }
                    endEvent.preventDefault()

                    if (!active) {
                        endEvent.preventDefault()
                    }

                    target.removeEventListener('pointermove', onPointerMove)
                    target.removeEventListener('pointerup', onPointerEnd)
                    target.removeEventListener('pointerleave', onPointerEnd)

                    updatePoint(
                        screenToFlowPosition({
                            x: endEvent.clientX,
                            y: endEvent.clientY,
                        })
                    )
                }

                target.addEventListener('pointermove', onPointerMove)
                target.addEventListener('pointerup', onPointerEnd)
                target.addEventListener('pointerleave', onPointerEnd)
            }}
            onKeyDown={(event) => {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                    case 'Space':
                        selectEdge()
                        if (!active) {
                            event.preventDefault()
                        }
                        updatePoint({ x, y })
                        break
                    case 'Backspace':
                    case 'Delete':
                        event.stopPropagation()
                        removePoint()
                        break
                    case 'ArrowLeft':
                        updatePoint({ x: x - 5, y })
                        break
                    case 'ArrowRight':
                        updatePoint({ x: x + 5, y })
                        break
                    case 'ArrowUp':
                        updatePoint({ x, y: y - 5 })
                        break
                    case 'ArrowDown':
                        updatePoint({ x, y: y + 5 })
                        break
                }
            }}
        />
    )
}
