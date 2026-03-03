import { Fragment, useCallback, useMemo, useRef } from 'react'
import {
    BaseEdge,
    type Edge,
    type EdgeProps,
    Position,
    useReactFlow,
    useStore,
} from '@xyflow/react'
import { ControlPointHandle } from './control-point'
import { StepControlPointHandle } from './step-control-point'
import {
    EDGE_ALGORITHM,
    EDGE_COLORS,
    type ControlPoint,
    type EditableEdge,
    type EditableEdgeData,
} from '../types'
import {
    getEditableControlPoints,
    getEditablePath,
    getSmoothStepPoints,
    HANDLE_OFFSET,
    normalizeStepControlPoints,
} from '../utils/geometry'
import { useStableControlPointIds } from '../utils/use-stable-control-point-ids'

function isEditableEdge(edge: Edge | undefined): edge is EditableEdge {
    return Boolean(edge && edge.type === 'editable-edge')
}

function getPositionFromHandleId(handleId?: string): Position | undefined {
    const normalized = handleId?.toLowerCase()

    switch (normalized) {
        case 'left':
            return Position.Left
        case 'right':
            return Position.Right
        case 'top':
            return Position.Top
        case 'bottom':
            return Position.Bottom
        default:
            return undefined
    }
}

export function EditableEdgeComponent({
    id,
    selected,
    source,
    sourceX,
    sourceY,
    sourcePosition,
    target,
    targetX,
    targetY,
    targetPosition,
    markerEnd,
    markerStart,
    style,
    data = { points: [] },
    ...rest
}: EdgeProps<EditableEdge>) {
    const edgeHandleIds = useStore((state) => {
        const edge = state.edgeLookup.get(id)

        return {
            sourceHandleId: edge?.sourceHandle,
            targetHandleId: edge?.targetHandle,
        }
    })
    const sourceHandleId = edgeHandleIds.sourceHandleId ?? undefined
    const targetHandleId = edgeHandleIds.targetHandleId ?? undefined

    const sourcePoint = { x: sourceX, y: sourceY }
    const targetPoint = { x: targetX, y: targetY }
    const fromSide =
        getPositionFromHandleId(sourceHandleId) ??
        sourcePosition ??
        Position.Bottom
    const toSide =
        getPositionFromHandleId(targetHandleId) ??
        targetPosition ??
        Position.Top
    const algorithm = data.algorithm ?? EDGE_ALGORITHM.BezierCatmullRom
    const color = EDGE_COLORS[algorithm]

    const { setEdges } = useReactFlow()

    const showControlPoints = useStore((state) => {
        const sourceNode = state.nodeLookup.get(source)
        const targetNode = state.nodeLookup.get(target)

        return selected ?? sourceNode?.selected ?? targetNode?.selected
    })

    const initialStepPoints = useMemo(
        () =>
            getSmoothStepPoints({
                source: sourcePoint,
                target: targetPoint,
                offset: HANDLE_OFFSET,
                sourcePosition: fromSide,
                targetPosition: toSide,
            }).map((point, index) => ({
                ...point,
                id: `${index}`,
                active: false,
            })),
        [fromSide, sourcePoint, targetPoint, toSide]
    )

    const isStep = algorithm === EDGE_ALGORITHM.Step

    const normalizedPoints = useMemo(
        () =>
            isStep
                ? normalizeStepControlPoints({
                      points: data.points,
                      source: sourcePoint,
                      target: targetPoint,
                      sides: {
                          fromSide,
                          toSide,
                      },
                  })
                : data.points,
        [data.points, fromSide, isStep, sourcePoint, targetPoint, toSide]
    )

    const latestNormalizedPoints = useRef<ControlPoint[]>([])
    latestNormalizedPoints.current = normalizedPoints

    const updateControlPoints = useCallback(
        (updater: (points: ControlPoint[]) => ControlPoint[]) => {
            setEdges((edges) =>
                edges.map((edge) => {
                    if (edge.id !== id || !isEditableEdge(edge)) {
                        return edge
                    }

                    const currentPoints = isStep
                        ? latestNormalizedPoints.current
                        : (edge.data?.points ?? [])

                    const nextData: EditableEdgeData = {
                        ...edge.data,
                        points: updater(currentPoints),
                    }

                    return {
                        ...edge,
                        data: nextData,
                    }
                })
            )
        },
        [id, isStep, setEdges]
    )

    const allPoints = [sourcePoint, ...normalizedPoints, targetPoint]

    const visualControlPoints = getEditableControlPoints({
        points: allPoints,
        algorithm,
        sides: {
            fromSide,
            toSide,
        },
        initialStepPoints,
    })

    const path = getEditablePath({
        points: allPoints,
        algorithm,
        sides: {
            fromSide,
            toSide,
        },
        initialStepPoints,
    })

    const controlPointsWithIds = useStableControlPointIds(visualControlPoints)

    return (
        <Fragment>
            <BaseEdge
                id={id}
                path={path}
                {...rest}
                markerStart={markerStart}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 2,
                    stroke: color,
                }}
            />
            {showControlPoints &&
                !isStep &&
                controlPointsWithIds.map((point, index) => (
                    <ControlPointHandle
                        key={point.id}
                        index={index}
                        setControlPoints={updateControlPoints}
                        color={color}
                        {...point}
                        id={point.id!}
                    />
                ))}
            {showControlPoints &&
                isStep &&
                controlPointsWithIds.map((point, index) => (
                    <StepControlPointHandle
                        key={point.id}
                        index={index}
                        setControlPoints={updateControlPoints}
                        color={color}
                        initialStepPoints={initialStepPoints}
                        {...point}
                        id={point.id!}
                    />
                ))}
        </Fragment>
    )
}

export const edgeTypes = {
    'editable-edge': EditableEdgeComponent,
}
