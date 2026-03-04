import {
    Position,
    type Edge,
    type InternalNode,
    type XYPosition,
} from '@xyflow/react'
import {
    EDGE_ALGORITHM,
    type ControlPoint,
    type EdgeAlgorithm,
} from '@/lib/types'
import { getEdgeParams } from './edges'
import {
    getLeastConnectedLoopSide,
    getMarkerGapPoint,
    projectToNodePerimeter,
} from './edge-routing'

const PARALLEL_EDGE_SPACING = 19
const AUTO_PARALLEL_CATMULL_BEND = PARALLEL_EDGE_SPACING * 0.6
const AUTO_PARALLEL_ANCHOR_OFFSET = PARALLEL_EDGE_SPACING * 0.3
const MARKER_TIP_GAP = 2
const INHIBITION_MARKER_EXTRA_GAP = 0.8
const SELF_LOOP_MIN_LIFT = 18
const SELF_LOOP_INSET_MIN = 28
const SELF_LOOP_INSET_RATIO = 0.3
const SELF_LOOP_LIFT_MULTIPLIER = 0.18

const TARGET_GAP_BY_POSITION: Record<Position, XYPosition> = {
    [Position.Left]: { x: -1, y: 0 },
    [Position.Right]: { x: 1, y: 0 },
    [Position.Top]: { x: 0, y: -1 },
    [Position.Bottom]: { x: 0, y: 1 },
}

interface LayoutArgs {
    id: string
    source: string
    target: string
    algorithm: EdgeAlgorithm
    storedPoints: ControlPoint[]
    centeredIndex: number
    sourceNode: InternalNode
    targetNode: InternalNode
    edges: Edge[]
    nodeLookup: ReadonlyMap<string, InternalNode>
    endArrowType?: 'vee' | 'rect' | 'triangleRect'
}

export interface RegulatoryEdgeLayout {
    startHandleId: string
    endHandleId: string
    startAnchorHint?: ControlPoint
    endAnchorHint?: ControlPoint
    geometryStoredPoints: ControlPoint[]
    isSelfLoop: boolean
    sourcePos: Position
    targetPos: Position
    sourcePoint: XYPosition
    targetPoint: XYPosition
    targetTipPoint: XYPosition
    allPoints: XYPosition[]
}

export function computeRegulatoryEdgeLayout({
    id,
    source,
    target,
    algorithm,
    storedPoints,
    centeredIndex,
    sourceNode,
    targetNode,
    edges,
    nodeLookup,
    endArrowType,
}: LayoutArgs): RegulatoryEdgeLayout {
    const startHandleId = `${id}-start-control`
    const endHandleId = `${id}-end-control`
    const startAnchorHint = storedPoints.find(
        (point) => point.id === startHandleId
    )
    const endAnchorHint = storedPoints.find((point) => point.id === endHandleId)
    const projectedStartAnchorHint = startAnchorHint
        ? projectToNodePerimeter(sourceNode, startAnchorHint)
        : undefined
    const projectedEndAnchorHint = endAnchorHint
        ? projectToNodePerimeter(targetNode, endAnchorHint)
        : undefined
    const geometryStoredPoints = storedPoints.filter(
        (point) => point.id !== startHandleId && point.id !== endHandleId
    )

    const isSelfLoop = source === target
    const sourceHint = projectedStartAnchorHint ?? geometryStoredPoints[0]
    const targetHint = projectedEndAnchorHint ?? geometryStoredPoints.at(-1)

    const markerTipGap =
        MARKER_TIP_GAP +
        (endArrowType === 'rect' ? INHIBITION_MARKER_EXTRA_GAP : 0)

    let sourcePos = Position.Top
    let targetPos = Position.Top
    let sourcePoint: XYPosition
    let targetPoint: XYPosition
    let targetTipPoint: XYPosition
    let normalX = 0
    let normalY = 0

    if (isSelfLoop) {
        const nodeX = sourceNode.internals.positionAbsolute.x
        const nodeY = sourceNode.internals.positionAbsolute.y
        const nodeWidth = sourceNode.measured.width ?? 0
        const nodeHeight = sourceNode.measured.height ?? 0
        const loopSide = getLeastConnectedLoopSide({
            nodeId: source,
            node: sourceNode,
            edges,
            nodeLookup,
        })

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
            const defaultSourcePoint = { x: nodeX + loopInset, y: nodeY }
            const defaultTargetTipPoint = {
                x: nodeX + nodeWidth - loopInset,
                y: nodeY,
            }
            sourcePoint = projectedStartAnchorHint ?? defaultSourcePoint
            targetTipPoint = projectedEndAnchorHint ?? defaultTargetTipPoint
            normalX = 0
            normalY = -1
        } else if (loopSide === Position.Bottom) {
            const defaultSourcePoint = {
                x: nodeX + loopInset,
                y: nodeY + nodeHeight,
            }
            const defaultTargetTipPoint = {
                x: nodeX + nodeWidth - loopInset,
                y: nodeY + nodeHeight,
            }
            sourcePoint = projectedStartAnchorHint ?? defaultSourcePoint
            targetTipPoint = projectedEndAnchorHint ?? defaultTargetTipPoint
            normalX = 0
            normalY = 1
        } else if (loopSide === Position.Left) {
            const defaultSourcePoint = { x: nodeX, y: nodeY + loopInset }
            const defaultTargetTipPoint = {
                x: nodeX,
                y: nodeY + nodeHeight - loopInset,
            }
            sourcePoint = projectedStartAnchorHint ?? defaultSourcePoint
            targetTipPoint = projectedEndAnchorHint ?? defaultTargetTipPoint
            normalX = -1
            normalY = 0
        } else {
            const defaultSourcePoint = {
                x: nodeX + nodeWidth,
                y: nodeY + loopInset,
            }
            const defaultTargetTipPoint = {
                x: nodeX + nodeWidth,
                y: nodeY + nodeHeight - loopInset,
            }
            sourcePoint = projectedStartAnchorHint ?? defaultSourcePoint
            targetTipPoint = projectedEndAnchorHint ?? defaultTargetTipPoint
            normalX = 1
            normalY = 0
        }

        targetPoint = getMarkerGapPoint({
            tip: targetTipPoint,
            from: sourcePoint,
            markerTipGap,
            fallbackNormal: { x: normalX, y: normalY },
        })
    } else {
        const baseParams = getEdgeParams(
            sourceNode,
            targetNode,
            sourceHint,
            targetHint
        )
        const useParallelAnchorModeForCatmull =
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

        sourcePoint = projectedStartAnchorHint ?? { x: params.sx, y: params.sy }
        targetTipPoint = projectedEndAnchorHint ?? {
            x: params.tx + normalX * endAnchorOffset,
            y: params.ty + normalY * endAnchorOffset,
        }

        const endReferencePoint =
            geometryStoredPoints.at(-1) ??
            projectedStartAnchorHint ??
            sourcePoint
        targetPoint = getMarkerGapPoint({
            tip: targetTipPoint,
            from: endReferencePoint,
            markerTipGap,
            fallbackNormal: TARGET_GAP_BY_POSITION[targetPos],
        })
    }

    const normalizedPoints = geometryStoredPoints

    const useAutoParallelCatmullBend =
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
    const renderPoints = autoParallelControlPoint
        ? [autoParallelControlPoint]
        : isSelfLoop && normalizedPoints.length === 0
          ? [
                {
                    id: `${id}-self-loop-main`,
                    active: true,
                    x:
                        (sourcePoint.x + targetPoint.x) / 2 +
                        normalX * selfLoopLift,
                    y:
                        (sourcePoint.y + targetPoint.y) / 2 +
                        normalY * selfLoopLift,
                } as ControlPoint,
            ]
          : normalizedPoints

    if (isSelfLoop) {
        const selfLoopEndReference = renderPoints.at(-1) ?? sourcePoint
        targetPoint = getMarkerGapPoint({
            tip: targetTipPoint,
            from: selfLoopEndReference,
            markerTipGap,
            fallbackNormal: { x: normalX, y: normalY },
        })
    }

    const allPoints = [sourcePoint, ...renderPoints, targetPoint]

    return {
        startHandleId,
        endHandleId,
        startAnchorHint,
        endAnchorHint,
        geometryStoredPoints,
        isSelfLoop,
        sourcePos,
        targetPos,
        sourcePoint,
        targetPoint,
        targetTipPoint,
        allPoints,
    }
}
