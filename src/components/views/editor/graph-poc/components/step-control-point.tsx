import { useCallback, useMemo, useRef, type KeyboardEvent } from 'react'
import { useReactFlow, useStore, type XYPosition } from '@xyflow/react'
import type { ControlPoint, StepDirection } from '../types'
import {
    compressHorizontalRuns,
    pointsEqual,
} from '../utils/geometry'
import { createId } from '../utils/id'

type StepControlPointProps = {
    id: string
    index: number
    x: number
    y: number
    color: string
    active: boolean
    direction?: StepDirection
    initialStepPoints: ControlPoint[]
    setControlPoints: (updater: (points: ControlPoint[]) => ControlPoint[]) => void
}

function isSegmentActive(nextPoint: ControlPoint): boolean {
    return nextPoint.active
}

export function StepControlPointHandle({
    id,
    index,
    x,
    y,
    color,
    active,
    direction = 'horizontal',
    initialStepPoints,
    setControlPoints,
}: StepControlPointProps) {
    const domNode = useStore((state) => state.domNode)
    const { screenToFlowPosition } = useReactFlow()
    const circleRef = useRef<SVGCircleElement>(null)

    const projectPoint = useCallback(
        ({ 
            previous,
            position,
        }: {
            previous?: XYPosition
            position: XYPosition
        }): XYPosition => {
            const projected: XYPosition = {
                x: previous?.x ?? position.x,
                y: previous?.y ?? position.y,
            }

            if (direction === 'vertical') {
                projected.y = position.y
            }

            if (direction === 'horizontal') {
                projected.x = position.x
            }

            return projected
        },
        [direction]
    )

    const fallbackControlPoints = useMemo(
        () => initialStepPoints.slice(1, initialStepPoints.length - 1),
        [initialStepPoints]
    )

    const updatePoint = useCallback(
        (nextPosition: XYPosition) => {
            setControlPoints((points) => {
                const current = points.length === 0 ? fallbackControlPoints : points

                const start = current[0]
                const end = current[current.length - 1]
                const next = [...current]

                const point = next[index]
                const afterPoint = next[index + 1]

                const updated = {
                    ...point,
                    ...projectPoint({
                        previous: point,
                        position: nextPosition,
                    }),
                }

                const updatedAfter = {
                    ...afterPoint,
                    ...projectPoint({
                        previous: afterPoint,
                        position: nextPosition,
                    }),
                    active: true,
                }

                next[index] = updated
                next[index + 1] = updatedAfter

                const touchedEnd = pointsEqual(afterPoint, end) && !active && Boolean(end)
                const touchedStart = pointsEqual(point, start) && !active && Boolean(start)

                if (touchedEnd) {
                    next.push({
                        ...(end as ControlPoint),
                        id: createId('spline'),
                    })
                }

                if (touchedStart) {
                    next.unshift({
                        ...(start as ControlPoint),
                        id: createId('spline'),
                    })
                }

                return next as ControlPoint[]
            })
        },
        [active, fallbackControlPoints, index, projectPoint, setControlPoints]
    )

    const removePoint = useCallback(() => {
        setControlPoints((points) => {
            if (!points.length) {
                return points
            }

            const first = points[index]
            const second = points[index + 1]

            if ((!first && !second) || !second || !isSegmentActive(second)) {
                return points
            }

            let next = [...points]
            const isHorizontalSegment = first.y === second.y

            if (isHorizontalSegment) {
                const after = next[index + 2]

                next[index] = {
                    ...next[index],
                    y: after?.y,
                }

                next[index + 1] = {
                    ...next[index + 1],
                    y: after?.y,
                }
            } else {
                const previous = next[index]

                next[index + 1] = {
                    ...next[index + 1],
                    y: previous?.y,
                }

                next[index + 2] = {
                    ...next[index + 2],
                    y: previous?.y,
                }
            }

            next = compressHorizontalRuns(next)

            next[1] = {
                ...next[1],
                active: false,
            }

            next[next.length - 1] = {
                ...next[next.length - 1],
                active: false,
            }

            return next.length < fallbackControlPoints.length ? [] : next
        })
    }, [fallbackControlPoints.length, index, setControlPoints])

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
                    if (direction === 'horizontal') {
                        updatePoint({ x: x - 5, y })
                    }
                    break
                case 'ArrowRight':
                    if (direction === 'horizontal') {
                        updatePoint({ x: x + 5, y })
                    }
                    break
                case 'ArrowUp':
                    if (direction === 'vertical') {
                        updatePoint({ x, y: y - 5 })
                    }
                    break
                case 'ArrowDown':
                    if (direction === 'vertical') {
                        updatePoint({ x, y: y + 5 })
                    }
                    break
            }
        },
        [active, direction, removePoint, updatePoint, x, y]
    )

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
                if (event.button === 2) {
                    return
                }

                updatePoint({ x, y })

                const target = domNode ?? window

                const onPointerMove = (moveEvent: Event) => {
                    if (!(moveEvent instanceof PointerEvent)) {
                        return
                    }

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
            onKeyDown={onKeyDown}
        />
    )
}
