import { useCallback, useEffect } from 'react'
import type { Edge, InternalNode, XYPosition } from '@xyflow/react'
import type { EditableRegulatoryEdge } from '@/lib/schema'
import {
    DEFAULT_ALGORITHM,
    EDGE_ALGORITHM,
    type ControlPoint,
} from '@/lib/types'
import { shouldPromoteCatmullToLinear } from './geometry'
import { isSingleControlPointOrthogonal, projectToNodePerimeter } from '.'

type SetEdges = (updater: (currentEdges: Edge[]) => Edge[]) => void

interface SelectionRect {
    x: number
    y: number
    width: number
    height: number
}

interface UseRegulatoryEdgeSelectionArgs {
    controlPoints: ControlPoint[]
    id: string
    selected: boolean
    setEdges: SetEdges
    transform: [number, number, number]
    userSelectionActive: boolean
    userSelectionRect: SelectionRect | null
}

export function useRegulatoryEdgeSelection({
    controlPoints,
    id,
    selected,
    setEdges,
    transform,
    userSelectionActive,
    userSelectionRect,
}: UseRegulatoryEdgeSelectionArgs) {
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
}

interface UseRegulatoryEdgeActionsArgs {
    id: string
    setEdges: SetEdges
    startHandleId: string
    endHandleId: string
    fallbackGeometryStoredPoints: ControlPoint[]
    sourcePoint: XYPosition
    targetPoint: XYPosition
    sourceNode: InternalNode
    targetNode: InternalNode
}

export function useRegulatoryEdgeActions({
    id,
    setEdges,
    startHandleId,
    endHandleId,
    fallbackGeometryStoredPoints,
    sourcePoint,
    targetPoint,
    sourceNode,
    targetNode,
}: UseRegulatoryEdgeActionsArgs) {
    const selectEdge = useCallback(() => {
        setEdges((currentEdges) =>
            currentEdges.map((edge) => ({
                ...edge,
                selected: edge.id === id,
            }))
        )
    }, [id, setEdges])

    const setControlPoints = useCallback(
        (updater: (points: ControlPoint[]) => ControlPoint[]) => {
            setEdges((currentEdges) =>
                currentEdges.map((edge) => {
                    if (edge.id !== id) {
                        return edge
                    }

                    const edgeData = (edge.data ?? {}) as EditableRegulatoryEdge
                    const edgePoints = edgeData.points ?? []
                    const existingStartAnchor = edgePoints.find(
                        (point) => point.id === startHandleId
                    )
                    const existingEndAnchor = edgePoints.find(
                        (point) => point.id === endHandleId
                    )
                    const geometryEdgePoints = edgePoints.filter(
                        (point) =>
                            point.id !== startHandleId &&
                            point.id !== endHandleId
                    )

                    const basePoints =
                        geometryEdgePoints.length > 0
                            ? geometryEdgePoints
                            : fallbackGeometryStoredPoints

                    const nextPoints = updater(basePoints)
                    const nextActivePoints = nextPoints.filter(
                        (point) => point.active
                    )
                    const currentAlgorithm =
                        edgeData.algorithm ?? DEFAULT_ALGORITHM
                    const singlePointOrthogonal =
                        nextActivePoints.length === 1 &&
                        isSingleControlPointOrthogonal({
                            source: sourcePoint,
                            pivot: nextActivePoints[0] as XYPosition,
                            target: targetPoint,
                        })
                    const looksLinear =
                        singlePointOrthogonal ||
                        (nextActivePoints.length >= 2 &&
                            shouldPromoteCatmullToLinear(nextActivePoints))
                    const nextAlgorithm =
                        currentAlgorithm === EDGE_ALGORITHM.CatmullRom
                            ? looksLinear
                                ? EDGE_ALGORITHM.Linear
                                : EDGE_ALGORITHM.CatmullRom
                            : currentAlgorithm === EDGE_ALGORITHM.Linear
                              ? looksLinear
                                  ? EDGE_ALGORITHM.Linear
                                  : EDGE_ALGORITHM.CatmullRom
                              : currentAlgorithm
                    const nextStoredPoints = [
                        ...(existingStartAnchor ? [existingStartAnchor] : []),
                        ...nextPoints,
                        ...(existingEndAnchor ? [existingEndAnchor] : []),
                    ]

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
        },
        [
            endHandleId,
            fallbackGeometryStoredPoints,
            id,
            setEdges,
            sourcePoint,
            startHandleId,
            targetPoint,
        ]
    )

    const setAnchorHint = useCallback(
        (anchorId: string, next: XYPosition) => {
            const constrained =
                anchorId === startHandleId
                    ? projectToNodePerimeter(sourceNode, next)
                    : projectToNodePerimeter(targetNode, next)

            setEdges((currentEdges) =>
                currentEdges.map((edge) => {
                    if (edge.id !== id) {
                        return edge
                    }

                    const edgeData = (edge.data ?? {}) as EditableRegulatoryEdge
                    const edgePoints = edgeData.points ?? []
                    const geometryPoints = edgePoints.filter(
                        (point) =>
                            point.id !== startHandleId &&
                            point.id !== endHandleId
                    )
                    const currentStart = edgePoints.find(
                        (point) => point.id === startHandleId
                    )
                    const currentEnd = edgePoints.find(
                        (point) => point.id === endHandleId
                    )

                    const nextStart =
                        anchorId === startHandleId
                            ? {
                                  ...(currentStart ?? {
                                      id: startHandleId,
                                      active: false,
                                  }),
                                  x: constrained.x,
                                  y: constrained.y,
                              }
                            : currentStart
                    const nextEnd =
                        anchorId === endHandleId
                            ? {
                                  ...(currentEnd ?? {
                                      id: endHandleId,
                                      active: false,
                                  }),
                                  x: constrained.x,
                                  y: constrained.y,
                              }
                            : currentEnd

                    return {
                        ...edge,
                        data: {
                            ...edgeData,
                            points: [
                                ...(nextStart ? [nextStart] : []),
                                ...geometryPoints,
                                ...(nextEnd ? [nextEnd] : []),
                            ],
                        },
                    }
                })
            )
        },
        [endHandleId, id, setEdges, sourceNode, startHandleId, targetNode]
    )

    return {
        selectEdge,
        setControlPoints,
        setAnchorHint,
    }
}
