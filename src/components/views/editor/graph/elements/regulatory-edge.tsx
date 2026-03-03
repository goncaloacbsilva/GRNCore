import { useEffect, useRef } from 'react'
import {
    BaseEdge,
    Position,
    type Edge,
    type EdgeProps,
    useInternalNode,
    useReactFlow,
    useStore,
    type XYPosition,
} from '@xyflow/react'
import type { EditableRegulatoryEdge, InteractionType } from '@/lib/schema'
import {
    DEFAULT_ALGORITHM,
    EDGE_ALGORITHM,
    type ControlPoint,
} from '@/lib/types'
import {
    convertPathToStepPoints,
    compressHorizontalRuns,
    getEditableControlPoints,
    getEditablePath,
    getSmoothStepPoints,
    HANDLE_OFFSET,
    normalizeStepControlPoints,
    pointsEqual,
    shouldPromoteCatmullToLinear,
} from '../utils/geometry'
import { createId } from '../utils/id'
import { getEdgeParams, getParallelEdgeMeta } from '../utils'
import { useStableControlPointIds } from '../utils/use-stable-control-point-ids'
import { REGULATORY_EDGE_STYLES } from '../config'
import { RegulatoryEdgeMarker } from './regulatory-edge-marker'

const PARALLEL_EDGE_SPACING = 19
const AUTO_PARALLEL_CATMULL_BEND = PARALLEL_EDGE_SPACING * 0.6
const AUTO_PARALLEL_ANCHOR_OFFSET = PARALLEL_EDGE_SPACING * 0.3
const REGULATORY_EDGE_STROKE_WIDTH = 1.8
const MARKER_TIP_GAP = 5
const INHIBITION_MARKER_EXTRA_GAP = 0.8
const SELF_LOOP_MIN_LIFT = 18
const SELF_LOOP_INSET_MIN = 28
const SELF_LOOP_INSET_RATIO = 0.3
const SELF_LOOP_LIFT_MULTIPLIER = 0.18

const TARGET_GAP_BY_POSITION: Record<
    EdgeProps<RegulatoryGraphEdge>['targetPosition'],
    XYPosition
> = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    top: { x: 0, y: -1 },
    bottom: { x: 0, y: 1 },
}

type RegulatoryGraphEdge = Edge<EditableRegulatoryEdge>

type ControlPointProps = {
    id: string
    index: number
    x: number
    y: number
    color: string
    active: boolean
    selected: boolean
    setControlPoints: (
        updater: (points: ControlPoint[]) => ControlPoint[]
    ) => void
    selectEdge: () => void
}

function ControlPointHandle({
    id,
    index,
    x,
    y,
    color,
    active,
    selected,
    setControlPoints,
    selectEdge,
}: ControlPointProps) {
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

type StepControlPointProps = ControlPointProps & {
    direction?: 'horizontal' | 'vertical'
    initialStepPoints: ControlPoint[]
}

function StepControlPointHandle({
    id,
    index,
    x,
    y,
    color,
    active,
    selected,
    direction = 'horizontal',
    initialStepPoints,
    setControlPoints,
    selectEdge,
}: StepControlPointProps) {
    const domNode = useStore((state) => state.domNode)
    const { screenToFlowPosition } = useReactFlow()

    const projectPoint = ({
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
    }

    const fallbackControlPoints = initialStepPoints.slice(
        1,
        initialStepPoints.length - 1
    )

    const updatePoint = (nextPosition: XYPosition) => {
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

            const touchedEnd =
                pointsEqual(afterPoint, end) && !active && Boolean(end)
            const touchedStart =
                pointsEqual(point, start) && !active && Boolean(start)

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
    }

    const removePoint = () => {
        setControlPoints((points) => {
            if (!points.length) {
                return points
            }

            const first = points[index]
            const second = points[index + 1]

            if ((!first && !second) || !second || !second.active) {
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
            }}
        />
    )
}

export function RegulatoryEdge({
    id,
    source,
    target,
    selected,
    markerStart,
    style,
    data,
}: EdgeProps<RegulatoryGraphEdge>) {
    const sourceNode = useInternalNode(source)
    const targetNode = useInternalNode(target)
    const edges = useStore((state) => state.edges)
    const nodeLookup = useStore((state) => state.nodeLookup)
    const userSelectionActive = useStore((state) => state.userSelectionActive)
    const userSelectionRect = useStore((state) => state.userSelectionRect)
    const transform = useStore((state) => state.transform)
    const { setEdges } = useReactFlow()

    if (!sourceNode || !targetNode) {
        return null
    }

    const algorithm = data?.algorithm ?? DEFAULT_ALGORITHM
    const storedPoints = data?.points ?? []
    const isStep = algorithm === EDGE_ALGORITHM.Step
    const isSelfLoop = source === target
    const sourceHint = storedPoints[0]
    const targetHint = storedPoints[storedPoints.length - 1]
    const { centeredIndex } = getParallelEdgeMeta(edges, id, source, target)

    const interactionType: InteractionType =
        (data?.type as InteractionType | undefined) ?? 'activation'
    const regulatoryStyle = REGULATORY_EDGE_STYLES[interactionType]
    const markerTipGap =
        MARKER_TIP_GAP +
        (regulatoryStyle.endArrowType === 'rect'
            ? INHIBITION_MARKER_EXTRA_GAP
            : 0)

    let sourcePos = Position.Top
    let targetPos = Position.Top
    let sourcePoint: XYPosition
    let targetPoint: XYPosition
    let normalX = 0
    let normalY = 0

    if (isSelfLoop) {
        const nodeX = sourceNode.internals.positionAbsolute.x
        const nodeY = sourceNode.internals.positionAbsolute.y
        const nodeWidth = sourceNode.measured.width ?? 0
        const nodeHeight = sourceNode.measured.height ?? 0
        const nodeCenter = {
            x: nodeX + nodeWidth / 2,
            y: nodeY + nodeHeight / 2,
        }
        const connectivityBySide: Record<Position, number> = {
            [Position.Top]: 0,
            [Position.Right]: 0,
            [Position.Bottom]: 0,
            [Position.Left]: 0,
        }

        for (const edge of edges) {
            const edgeSource = String(edge.source)
            const edgeTarget = String(edge.target)
            if (edgeSource === source && edgeTarget === source) {
                continue
            }

            if (edgeSource !== source && edgeTarget !== source) {
                continue
            }

            const otherNodeId = edgeSource === source ? edgeTarget : edgeSource
            const otherNode = nodeLookup.get(otherNodeId)
            if (!otherNode) {
                continue
            }

            const otherWidth = otherNode.measured.width ?? 0
            const otherHeight = otherNode.measured.height ?? 0
            const otherCenter = {
                x: otherNode.internals.positionAbsolute.x + otherWidth / 2,
                y: otherNode.internals.positionAbsolute.y + otherHeight / 2,
            }

            const dx = otherCenter.x - nodeCenter.x
            const dy = otherCenter.y - nodeCenter.y
            const side =
                Math.abs(dx) >= Math.abs(dy)
                    ? dx >= 0
                        ? Position.Right
                        : Position.Left
                    : dy >= 0
                      ? Position.Bottom
                      : Position.Top

            connectivityBySide[side] += 1
        }

        const preferredSideOrder = [
            Position.Top,
            Position.Right,
            Position.Bottom,
            Position.Left,
        ]
        const loopSide = preferredSideOrder.reduce((best, candidate) =>
            connectivityBySide[candidate] < connectivityBySide[best]
                ? candidate
                : best
        )

        const sideLength =
            loopSide === Position.Top || loopSide === Position.Bottom
                ? nodeWidth
                : nodeHeight
        const loopInset = Math.max(
            sideLength * SELF_LOOP_INSET_RATIO,
            SELF_LOOP_INSET_MIN
        )
        sourcePos = loopSide
        targetPos = loopSide

        if (loopSide === Position.Top) {
            sourcePoint = { x: nodeX + loopInset, y: nodeY }
            targetPoint = {
                x: nodeX + nodeWidth - loopInset,
                y: nodeY - markerTipGap * 0.6,
            }
            normalX = 0
            normalY = -1
        } else if (loopSide === Position.Bottom) {
            sourcePoint = { x: nodeX + loopInset, y: nodeY + nodeHeight }
            targetPoint = {
                x: nodeX + nodeWidth - loopInset,
                y: nodeY + nodeHeight + markerTipGap * 0.6,
            }
            normalX = 0
            normalY = 1
        } else if (loopSide === Position.Left) {
            sourcePoint = { x: nodeX, y: nodeY + loopInset }
            targetPoint = {
                x: nodeX - markerTipGap * 0.6,
                y: nodeY + nodeHeight - loopInset,
            }
            normalX = -1
            normalY = 0
        } else {
            sourcePoint = { x: nodeX + nodeWidth, y: nodeY + loopInset }
            targetPoint = {
                x: nodeX + nodeWidth + markerTipGap * 0.6,
                y: nodeY + nodeHeight - loopInset,
            }
            normalX = 1
            normalY = 0
        }
    } else {
        const baseParams = getEdgeParams(
            sourceNode,
            targetNode,
            sourceHint,
            targetHint
        )
        const useParallelAnchorModeForCatmull =
            !isStep &&
            !isSelfLoop &&
            algorithm === EDGE_ALGORITHM.CatmullRom &&
            Math.abs(centeredIndex) > 1e-6

        const rawDx = baseParams.tx - baseParams.sx
        const rawDy = baseParams.ty - baseParams.sy
        const pairDx = source <= target ? rawDx : -rawDx
        const pairDy = source <= target ? rawDy : -rawDy
        const pairLength = Math.hypot(pairDx, pairDy)

        normalX = pairLength > 1e-6 ? -pairDy / pairLength : 0
        normalY = pairLength > 1e-6 ? pairDx / pairLength : 0

        const offset = useParallelAnchorModeForCatmull
            ? centeredIndex * AUTO_PARALLEL_ANCHOR_OFFSET
            : centeredIndex * PARALLEL_EDGE_SPACING
        const parallelSourceHint =
            Math.abs(offset) > 1e-6
                ? {
                      x: baseParams.tx + normalX * offset,
                      y: baseParams.ty + normalY * offset,
                  }
                : undefined
        const parallelTargetHint =
            Math.abs(offset) > 1e-6
                ? {
                      x: baseParams.sx + normalX * offset,
                      y: baseParams.sy + normalY * offset,
                  }
                : undefined
        const params =
            parallelSourceHint && parallelTargetHint
                ? getEdgeParams(
                      sourceNode,
                      targetNode,
                      parallelSourceHint,
                      parallelTargetHint
                  )
                : baseParams

        sourcePos = params.sourcePos
        targetPos = params.targetPos

        const endAnchorOffset = useParallelAnchorModeForCatmull
            ? centeredIndex * AUTO_PARALLEL_ANCHOR_OFFSET
            : 0
        const targetGapVector = TARGET_GAP_BY_POSITION[targetPos]

        sourcePoint = {
            x: params.sx,
            y: params.sy,
        }
        targetPoint = {
            x:
                params.tx +
                targetGapVector.x * markerTipGap +
                normalX * endAnchorOffset,
            y:
                params.ty +
                targetGapVector.y * markerTipGap +
                normalY * endAnchorOffset,
        }
    }

    const normalizedPoints =
        isStep && storedPoints.length > 2
            ? normalizeStepControlPoints({
                  points: storedPoints,
                  source: sourcePoint,
                  target: targetPoint,
                  sides: {
                      fromSide: sourcePos,
                      toSide: targetPos,
                  },
              })
            : storedPoints

    const latestStoredPointsRef = useRef<ControlPoint[]>(storedPoints)
    const latestNormalizedPointsRef = useRef<ControlPoint[]>(normalizedPoints)
    latestStoredPointsRef.current = storedPoints
    latestNormalizedPointsRef.current = normalizedPoints

    const initialStepPoints = getSmoothStepPoints({
        source: sourcePoint,
        sourcePosition: sourcePos,
        target: targetPoint,
        targetPosition: targetPos,
        offset: HANDLE_OFFSET,
    }).map((point, index) => ({
        ...point,
        id: `${index}`,
        active: false,
    }))

    const seedMainStepPoint: ControlPoint = {
        id: `${id}-step-main`,
        active: true,
        x: (sourcePoint.x + targetPoint.x) / 2,
        y: (sourcePoint.y + targetPoint.y) / 2,
    }
    const stepPointsForInteraction =
        isStep && normalizedPoints.length === 0
            ? [seedMainStepPoint]
            : normalizedPoints
    const hasSingleMainStepPoint =
        isStep && stepPointsForInteraction.length === 1
    const stepRenderPoints = hasSingleMainStepPoint
        ? convertPathToStepPoints([
              sourcePoint,
              stepPointsForInteraction[0] as ControlPoint,
              targetPoint,
          ])
        : stepPointsForInteraction
    const useAutoParallelCatmullBend =
        !isStep &&
        !isSelfLoop &&
        algorithm === EDGE_ALGORITHM.CatmullRom &&
        normalizedPoints.length === 0 &&
        Math.abs(centeredIndex) > 1e-6
    const autoParallelControlPoint: ControlPoint | null =
        useAutoParallelCatmullBend
            ? {
                  id: `${id}-auto-parallel`,
                  active: false,
                  x:
                      (sourcePoint.x + targetPoint.x) / 2 +
                      normalX *
                          AUTO_PARALLEL_CATMULL_BEND *
                          Math.sign(centeredIndex),
                  y:
                      (sourcePoint.y + targetPoint.y) / 2 +
                      normalY *
                          AUTO_PARALLEL_CATMULL_BEND *
                          Math.sign(centeredIndex),
              }
            : null
    const selfLoopLift = Math.max(
        (sourceNode.measured.height ?? 0) * SELF_LOOP_LIFT_MULTIPLIER,
        SELF_LOOP_MIN_LIFT
    )
    const renderPoints = isStep
        ? stepRenderPoints
        : autoParallelControlPoint
          ? [autoParallelControlPoint]
          : isSelfLoop && normalizedPoints.length === 0
            ? [
                  {
                      id: `${id}-self-loop-main`,
                      active: true,
                      x: (sourcePoint.x + targetPoint.x) / 2 + normalX * selfLoopLift,
                      y: (sourcePoint.y + targetPoint.y) / 2 + normalY * selfLoopLift,
                  } as ControlPoint,
              ]
            : normalizedPoints
    const allPoints = [sourcePoint, ...renderPoints, targetPoint]

    const controlPoints = useStableControlPointIds(
        getEditableControlPoints({
            points: allPoints,
            algorithm,
            sides: {
                fromSide: sourcePos,
                toSide: targetPos,
            },
            initialStepPoints,
        })
    )

    useEffect(() => {
        if (!userSelectionActive || !userSelectionRect || selected) {
            return
        }

        const [txTransform, tyTransform, zoom] = transform
        const minX = userSelectionRect.x
        const minY = userSelectionRect.y
        const maxX = minX + userSelectionRect.width
        const maxY = minY + userSelectionRect.height
        const hitPadding = 6

        const hitsControlPoint = controlPoints.some((point) => {
            const sx = point.x * zoom + txTransform
            const sy = point.y * zoom + tyTransform

            return (
                sx >= minX - hitPadding &&
                sx <= maxX + hitPadding &&
                sy >= minY - hitPadding &&
                sy <= maxY + hitPadding
            )
        })

        if (!hitsControlPoint) {
            return
        }

        setEdges((currentEdges) =>
            currentEdges.map((edge) =>
                edge.id === id ? { ...edge, selected: true } : edge
            )
        )
    }, [
        controlPoints,
        id,
        selected,
        setEdges,
        transform,
        userSelectionActive,
        userSelectionRect,
    ])

    const path = getEditablePath({
        points: allPoints,
        algorithm,
        sides: {
            fromSide: sourcePos,
            toSide: targetPos,
        },
        initialStepPoints,
    })

    const showControlPoints = Boolean(selected)
    const edgeColor =
        typeof style?.stroke === 'string'
            ? style.stroke
            : (regulatoryStyle.stroke ?? '#b1b1b7')
    const markerId = `${id}-marker-${interactionType}`
    const selectEdge = () => {
        setEdges((currentEdges) =>
            currentEdges.map((edge) => ({
                ...edge,
                selected: edge.id === id,
            }))
        )
    }

    const setControlPoints = (
        updater: (points: ControlPoint[]) => ControlPoint[]
    ) => {
        setEdges((currentEdges) =>
            currentEdges.map((edge) => {
                if (edge.id !== id) {
                    return edge
                }

                const edgeData = (edge.data ?? {}) as EditableRegulatoryEdge
                const edgePoints = (edgeData.points ?? []) as ControlPoint[]
                const basePoints = isStep
                    ? edgePoints.length > 0
                        ? edgePoints
                        : stepPointsForInteraction
                    : edgePoints.length > 0
                      ? edgePoints
                      : latestStoredPointsRef.current
                const nextPoints = updater(basePoints)
                const nextActivePoints = nextPoints.filter(
                    (point) => point.active
                )
                const currentAlgorithm = edgeData.algorithm ?? DEFAULT_ALGORITHM
                const looksLinear =
                    nextActivePoints.length >= 2 &&
                    shouldPromoteCatmullToLinear(nextActivePoints)
                const nextAlgorithm =
                    currentAlgorithm === EDGE_ALGORITHM.Step
                        ? EDGE_ALGORITHM.Step
                        : currentAlgorithm === EDGE_ALGORITHM.CatmullRom
                          ? looksLinear
                              ? EDGE_ALGORITHM.Linear
                              : EDGE_ALGORITHM.CatmullRom
                          : currentAlgorithm === EDGE_ALGORITHM.Linear
                            ? looksLinear
                                ? EDGE_ALGORITHM.Linear
                                : EDGE_ALGORITHM.CatmullRom
                            : currentAlgorithm
                const promotedToStep =
                    nextAlgorithm === EDGE_ALGORITHM.Step &&
                    currentAlgorithm !== EDGE_ALGORITHM.Step
                const basePointsById = new Map(
                    basePoints
                        .filter((point) => point.id)
                        .map((point) => [point.id as string, point])
                )
                const createdPoints = nextPoints.filter(
                    (point) => point.id && !basePointsById.has(point.id)
                )
                const movedPoints = nextPoints.filter((point) => {
                    if (!point.id) {
                        return false
                    }

                    const previous = basePointsById.get(point.id)
                    if (!previous) {
                        return false
                    }

                    return (
                        Math.abs(point.x - previous.x) > 0.5 ||
                        Math.abs(point.y - previous.y) > 0.5
                    )
                })
                const latestInteractionPoint =
                    createdPoints[createdPoints.length - 1] ??
                    movedPoints[movedPoints.length - 1] ??
                    nextPoints.filter((point) => point.active).at(-1)
                const stepPromotionSeedPoints = promotedToStep
                    ? latestInteractionPoint
                        ? [latestInteractionPoint]
                        : []
                    : nextPoints
                const stepSeedPoints = promotedToStep
                    ? stepPromotionSeedPoints
                    : nextPoints
                const nextStoredPoints = stepSeedPoints

                return {
                    ...edge,
                    data: {
                        ...edgeData,
                        algorithm: nextAlgorithm,
                        points: nextStoredPoints,
                    },
                }
            })
        )
    }

    return (
        <>
            <RegulatoryEdgeMarker
                markerId={markerId}
                interactionType={interactionType}
                color={edgeColor}
            />
            <BaseEdge
                id={id}
                className="react-flow__edge-path"
                path={path}
                markerStart={markerStart}
                markerEnd={`url(#${markerId})`}
                style={{
                    ...style,
                    stroke: edgeColor,
                    strokeWidth: REGULATORY_EDGE_STROKE_WIDTH,
                }}
            />
            {showControlPoints &&
                !isStep &&
                controlPoints.map((point, index) => (
                    <ControlPointHandle
                        key={point.id}
                        id={point.id ?? `${index}`}
                        index={index}
                        x={point.x}
                        y={point.y}
                        color={edgeColor}
                        active={point.active}
                        selected={Boolean(selected)}
                        setControlPoints={setControlPoints}
                        selectEdge={selectEdge}
                    />
                ))}
            {showControlPoints &&
                isStep &&
                hasSingleMainStepPoint &&
                stepPointsForInteraction[0] && (
                    <ControlPointHandle
                        id={stepPointsForInteraction[0].id ?? 'step-main'}
                        index={0}
                        x={stepPointsForInteraction[0].x}
                        y={stepPointsForInteraction[0].y}
                        color={edgeColor}
                        active={true}
                        selected={Boolean(selected)}
                        setControlPoints={setControlPoints}
                        selectEdge={selectEdge}
                    />
                )}
            {showControlPoints &&
                isStep &&
                !hasSingleMainStepPoint &&
                controlPoints.map((point, index) => (
                    <StepControlPointHandle
                        key={point.id}
                        id={point.id ?? `${index}`}
                        index={index}
                        x={point.x}
                        y={point.y}
                        color={edgeColor}
                        active={point.active}
                        selected={Boolean(selected)}
                        direction={point.direction}
                        initialStepPoints={initialStepPoints}
                        setControlPoints={setControlPoints}
                        selectEdge={selectEdge}
                    />
                ))}
        </>
    )
}
