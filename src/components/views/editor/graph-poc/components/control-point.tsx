import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useReactFlow, useStore, type XYPosition } from '@xyflow/react'
import type { ControlPoint } from '../types'

type ControlPointProps = {
    id: string
    index: number
    x: number
    y: number
    color: string
    active: boolean
    setControlPoints: (updater: (points: ControlPoint[]) => ControlPoint[]) => void
}

export function ControlPointHandle({
    id,
    index,
    x,
    y,
    color,
    active,
    setControlPoints,
}: ControlPointProps) {
    const domNode = useStore((state) => state.domNode)
    const { screenToFlowPosition } = useReactFlow()
    const [dragging, setDragging] = useState(false)
    const circleRef = useRef<SVGCircleElement>(null)

    const updatePoint = useCallback(
        (next: XYPosition) => {
            setControlPoints((points) =>
                active
                    ? points.map((point) =>
                          point.id === id
                              ? {
                                    ...point,
                                    ...next,
                                }
                              : point
                      )
                    : index !== 0
                      ? points.flatMap((point, currentIndex) =>
                            currentIndex === index * 0.5 - 1
                                ? [
                                      point,
                                      {
                                          ...next,
                                          id,
                                          active: true,
                                      },
                                  ]
                                : point
                        )
                      : [
                            {
                                ...next,
                                id,
                                active: true,
                            },
                            ...points,
                        ]
            )
        },
        [active, id, index, setControlPoints]
    )

    const removePoint = useCallback(() => {
        setControlPoints((points) => points.filter((point) => point.id !== id))

        const maybePrevious = circleRef.current?.previousElementSibling?.previousElementSibling

        if (maybePrevious?.tagName === 'circle' && maybePrevious.classList.contains('active')) {
            window.requestAnimationFrame(() => {
                ;(maybePrevious as SVGCircleElement).focus()
            })
        }
    }, [id, setControlPoints])

    const onKeyDown = useCallback(
        (event: KeyboardEvent<SVGCircleElement>) => {
            switch (event.key) {
                case 'Enter':
                case ' ':
                case 'Space':
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
        },
        [active, removePoint, updatePoint, x, y]
    )

    useEffect(() => {
        if (!domNode || !active || !dragging) {
            return
        }

        const onPointerMove = (event: PointerEvent) => {
            updatePoint(
                screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                })
            )
        }

        const onPointerUp = (event: PointerEvent) => {
            domNode.removeEventListener('pointermove', onPointerMove)
            if (!active) {
                event.preventDefault()
            }
            setDragging(false)

            updatePoint(
                screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                })
            )
        }

        domNode.addEventListener('pointermove', onPointerMove)
        domNode.addEventListener('pointerup', onPointerUp, { once: true })
        domNode.addEventListener('pointerleave', onPointerUp, { once: true })

        return () => {
            domNode.removeEventListener('pointermove', onPointerMove)
            domNode.removeEventListener('pointerup', onPointerUp)
            domNode.removeEventListener('pointerleave', onPointerUp)
            setDragging(false)
        }
    }, [active, domNode, dragging, screenToFlowPosition, updatePoint])

    return (
        <circle
            ref={circleRef}
            tabIndex={0}
            id={id}
            className={`nopan nodrag${active ? ' active' : ''}`}
            cx={x}
            cy={y}
            r={active ? 4 : 3}
            strokeOpacity={active ? 1 : 0.3}
            stroke={color}
            fill={active ? color : 'white'}
            style={{
                pointerEvents: 'all',
            }}
            onContextMenu={(event) => {
                event.preventDefault()
                if (active) {
                    removePoint()
                }
            }}
            onPointerDown={(event) => {
                if (event.button !== 2) {
                    updatePoint({ x, y })
                    setDragging(true)
                }
            }}
            onKeyDown={onKeyDown}
            onPointerUp={() => setDragging(false)}
        />
    )
}
