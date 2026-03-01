import {
    Canvas,
    type EdgeData,
    type Graph as G6Graph,
    type IPointerEvent,
} from '@antv/g6'
import type { Cursor } from '@antv/g'
import type { RegulatoryEdgeProperties } from '@/lib/schema'
import { CONTROL_POINT_HIT_RADIUS } from '../constants'
import { getDistanceToSegment, type ControlPoint } from './interaction-helpers'

type ControlPointKind = 'source' | 'target' | 'additional'
type EndpointKind = 'source' | 'target'

export interface ActiveControlPoint {
    edgeId: string
    kind: ControlPointKind
    pointIndex: number
    points: ControlPoint[]
}

export interface InteractionState {
    activeControlPoint?: ActiveControlPoint
    selectedEdgeId?: string
    shouldSkipEdgeClick: boolean
    draggingNodeLastPosition: Map<string, ControlPoint>
}

interface InteractionControllerParams {
    graph: G6Graph
    state: InteractionState
    getEdgeDatum: (edgeId: string) => EdgeData | undefined
    getEdgeProperties: (
        edgeId: string
    ) => Partial<RegulatoryEdgeProperties> | undefined
    getControlPoints: (edgeId: string) => ControlPoint[]
    getEdgeEndpointsFromPath: (
        edgeId: string
    ) => { source: ControlPoint; target: ControlPoint } | undefined
    getSelfLoopGuides: (
        edgeId: string
    ) => { source: ControlPoint; target: ControlPoint } | undefined
    getSelfLoopDefaultMiddlePoint: (
        edgeId: string,
        source: ControlPoint,
        target: ControlPoint
    ) => ControlPoint | undefined
    getEndpointGuidePoint: (
        edgeId: string,
        kind: EndpointKind,
        pointer: ControlPoint
    ) => ControlPoint
    setEndpointHandleCanvasPosition: (
        kind: EndpointKind,
        canvasPoint: ControlPoint
    ) => void
    updateEndpointHandlesFromControlPoints: (
        edgeId: string,
        controlPoints: ControlPoint[],
        edgeProperties: Partial<RegulatoryEdgeProperties>
    ) => void
    scheduleEndpointHandleRender: () => void
    renderEndpointHandles: () => void
    hideEndpointHandles: () => void
    setDraggingCursorLock: (isDragging: boolean) => void
    updateEdgeDataProperties: (
        edgeId: string,
        patch: Partial<RegulatoryEdgeProperties>
    ) => void
    enqueueEdgeSelection: (edgeId: string, selected: boolean) => void
    onError: (error: unknown) => void
}

/**
 * Creates the interaction controller responsible for edge selection,
 * control-point editing, endpoint dragging, and related event wiring.
 */
export const createInteractionController = (
    params: InteractionControllerParams
) => {
    const {
        graph,
        state,
        getEdgeDatum,
        getEdgeProperties,
        getControlPoints,
        getEdgeEndpointsFromPath,
        getSelfLoopGuides,
        getSelfLoopDefaultMiddlePoint,
        getEndpointGuidePoint,
        setEndpointHandleCanvasPosition,
        updateEndpointHandlesFromControlPoints,
        scheduleEndpointHandleRender,
        renderEndpointHandles,
        hideEndpointHandles,
        setDraggingCursorLock,
        updateEdgeDataProperties,
        enqueueEdgeSelection,
        onError,
    } = params
    let animationRenderRafId: number | null = null
    let isAnimationSyncActive = false

    const stopAnimationHandleSync = () => {
        isAnimationSyncActive = false
        if (animationRenderRafId !== null) {
            cancelAnimationFrame(animationRenderRafId)
            animationRenderRafId = null
        }
    }

    const startAnimationHandleSync = () => {
        if (isAnimationSyncActive) return
        isAnimationSyncActive = true

        const tick = () => {
            if (!isAnimationSyncActive) return
            renderEndpointHandles()
            animationRenderRafId = requestAnimationFrame(tick)
        }

        tick()
    }

    /**
     * Clears transient hover/active states while preserving persistent states.
     */
    const clearHoverActivateStates = () => {
        const stripStates = new Set(['dim', 'active'])
        const nextStatesById: Record<string, string[]> = {}

        const allElements = [
            ...(graph.getNodeData() as { id?: string | number }[]),
            ...(graph.getEdgeData() as { id?: string | number }[]),
        ]

        for (const element of allElements) {
            if (element.id === undefined) continue
            const id = String(element.id)
            const currentStates = graph.getElementState(id) ?? []
            if (currentStates.length === 0) continue

            const nextStates = currentStates.filter(
                (currentState) => !stripStates.has(currentState)
            )
            if (nextStates.length !== currentStates.length) {
                nextStatesById[id] = nextStates
            }
        }

        if (Object.keys(nextStatesById).length === 0) return
        void graph.setElementState(nextStatesById, true).catch(onError)
    }

    /**
     * Starts a control-point drag session and updates cursor state.
     */
    const beginControlPointDrag = (params: {
        edgeId: string
        kind: ControlPointKind
        pointIndex: number
        points: ControlPoint[]
        setCursor?: (cursor: Cursor) => void
    }) => {
        const { edgeId, kind, pointIndex, points, setCursor } = params
        state.shouldSkipEdgeClick = true
        state.activeControlPoint = {
            edgeId,
            kind,
            pointIndex,
            points: [...points],
        }
        setDraggingCursorLock(true)
        setCursor?.('grabbing')
    }

    /**
     * Ends the active drag session, if any.
     */
    const stopControlPointDrag = () => {
        if (!state.activeControlPoint) return
        state.activeControlPoint = undefined
        setDraggingCursorLock(false)
    }

    /**
     * Extracts an edge id from a pointer event when targeting an edge.
     */
    const getEventEdgeId = (event: IPointerEvent): string | undefined => {
        if (event.targetType !== 'edge') return undefined
        const target = event.target as { id?: string | number }
        if (target.id === undefined) return undefined
        return String(target.id)
    }

    /**
     * Detects direct hits on rendered additional control point shapes.
     */
    const getControlPointHit = (
        event: IPointerEvent
    ): { kind: 'additional'; pointIndex: number } | undefined => {
        const candidates = [
            String(
                (event.originalTarget as { className?: string }).className ?? ''
            ),
            String((event.originalTarget as { id?: string | number }).id ?? ''),
            String((event.target as { className?: string }).className ?? ''),
            String((event.target as { id?: string | number }).id ?? ''),
        ]

        for (const value of candidates) {
            const match = /control-point-additional-(\d+)/.exec(value)
            if (!match) continue
            const index = Number(match[1])
            if (Number.isInteger(index) && index >= 0) {
                return { kind: 'additional', pointIndex: index }
            }
        }

        return undefined
    }

    /**
     * Finds the nearest additional control point within hit radius.
     */
    const getNearestControlPointHit = (
        edgeId: string,
        canvasPoint: ControlPoint,
        hitRadius = CONTROL_POINT_HIT_RADIUS
    ): { kind: 'additional'; pointIndex: number } | undefined => {
        const points = getControlPoints(edgeId)
        if (points.length === 0) return undefined

        let nearestIndex = -1
        let nearestDistance = Number.POSITIVE_INFINITY

        for (let index = 0; index < points.length; index += 1) {
            const point = points[index]
            const distance = Math.hypot(
                canvasPoint[0] - point[0],
                canvasPoint[1] - point[1]
            )
            if (distance < nearestDistance) {
                nearestDistance = distance
                nearestIndex = index
            }
        }

        if (nearestIndex >= 0 && nearestDistance <= hitRadius) {
            return { kind: 'additional', pointIndex: nearestIndex }
        }
        return undefined
    }

    /**
     * Computes the insertion index for a newly created additional control point.
     */
    const getControlPointInsertionIndex = (
        edgeId: string,
        point: ControlPoint,
        controlPoints: ControlPoint[]
    ): number => {
        if (controlPoints.length === 0) return 0
        const edgeData = getEdgeDatum(edgeId)
        if (edgeData && String(edgeData.source) !== String(edgeData.target)) {
            const sourcePosition = graph.getElementPosition(
                String(edgeData.source)
            )
            const targetPosition = graph.getElementPosition(
                String(edgeData.target)
            )
            const source: ControlPoint = [
                Number(sourcePosition[0] ?? 0),
                Number(sourcePosition[1] ?? 0),
            ]
            const target: ControlPoint = [
                Number(targetPosition[0] ?? 0),
                Number(targetPosition[1] ?? 0),
            ]
            const axisX = target[0] - source[0]
            const axisY = target[1] - source[1]
            const axisLengthSq = axisX * axisX + axisY * axisY

            if (axisLengthSq > 1e-6) {
                const project = (candidate: ControlPoint): number =>
                    ((candidate[0] - source[0]) * axisX +
                        (candidate[1] - source[1]) * axisY) /
                    axisLengthSq

                const pointT = project(point)
                let insertionIndex = 0
                for (const controlPoint of controlPoints) {
                    if (project(controlPoint) < pointT) {
                        insertionIndex += 1
                    }
                }

                return insertionIndex
            }
        }

        const endpoints = getEdgeEndpointsFromPath(edgeId)
        if (!endpoints) return controlPoints.length

        const anchors: ControlPoint[] = [
            endpoints.source,
            ...controlPoints,
            endpoints.target,
        ]
        let bestSegmentIndex = anchors.length - 2
        let bestDistance = Number.POSITIVE_INFINITY
        for (let index = 0; index < anchors.length - 1; index += 1) {
            const distance = getDistanceToSegment(
                point,
                anchors[index],
                anchors[index + 1]
            )
            if (distance < bestDistance) {
                bestDistance = distance
                bestSegmentIndex = index
            }
        }
        return Math.max(0, Math.min(controlPoints.length, bestSegmentIndex))
    }

    /**
     * Ensures self-loops have initialized source/target and one middle control point.
     */
    const ensureSelfLoopControlPoint = (
        edgeId: string,
        edgeProperties: Partial<RegulatoryEdgeProperties>,
        selected: boolean
    ): boolean => {
        const edgeData = getEdgeDatum(edgeId)
        if (!edgeData) return false
        if (String(edgeData.source) !== String(edgeData.target)) return false
        if ((edgeProperties.controlPoints?.length ?? 0) > 0) return false

        const guides = getSelfLoopGuides(edgeId)
        if (!guides) return false
        const middlePoint = getSelfLoopDefaultMiddlePoint(
            edgeId,
            guides.source,
            guides.target
        )
        if (!middlePoint) return false

        updateEdgeDataProperties(edgeId, {
            ...edgeProperties,
            sourceControlPoint:
                edgeProperties.sourceControlPoint ?? guides.source,
            targetControlPoint:
                edgeProperties.targetControlPoint ?? guides.target,
            controlPoints: [middlePoint],
            selected,
        })
        return true
    }

    /**
     * Applies endpoint dragging updates while preserving self-loop initialization rules.
     */
    const applyEndpointDrag = (
        kind: EndpointKind,
        edgeId: string,
        pointer: ControlPoint,
        edgeProperties: Partial<RegulatoryEdgeProperties>
    ) => {
        let nextEdgeProperties = edgeProperties
        if (ensureSelfLoopControlPoint(edgeId, nextEdgeProperties, true)) {
            nextEdgeProperties = getEdgeProperties(edgeId) ?? nextEdgeProperties
        }

        const guidePoint = getEndpointGuidePoint(edgeId, kind, pointer)
        setEndpointHandleCanvasPosition(kind, guidePoint)
        updateEdgeDataProperties(edgeId, {
            ...nextEdgeProperties,
            ...(kind === 'source'
                ? { sourceControlPoint: guidePoint }
                : { targetControlPoint: guidePoint }),
            selected: true,
        })
    }

    /**
     * Starts dragging an additional control point if a valid hit is detected.
     */
    const tryBeginAdditionalControlPointDrag = (params: {
        edgeId: string
        event: IPointerEvent
        requireExistingPointIndex: boolean
    }): boolean => {
        const { edgeId, event, requireExistingPointIndex } = params
        const hit =
            getControlPointHit(event) ??
            getNearestControlPointHit(edgeId, [event.canvas.x, event.canvas.y])
        if (!hit) return false

        const edgeProperties = getEdgeProperties(edgeId) ?? {}
        if (edgeProperties.selected !== true) return false
        const points = getControlPoints(edgeId)
        if (requireExistingPointIndex && hit.pointIndex >= points.length) {
            return false
        }

        beginControlPointDrag({
            edgeId,
            kind: hit.kind,
            pointIndex: hit.pointIndex,
            points,
            setCursor: (event.view as Canvas).setCursor.bind(event.view),
        })
        return true
    }

    /**
     * Handles edge click for select-or-insert behavior.
     */
    const onEdgeClick = (event: IPointerEvent) => {
        if (state.shouldSkipEdgeClick) {
            state.shouldSkipEdgeClick = false
            return
        }

        const edgeId = getEventEdgeId(event)
        if (!edgeId) return

        if (state.selectedEdgeId !== edgeId) {
            if (state.selectedEdgeId)
                enqueueEdgeSelection(state.selectedEdgeId, false)
            clearHoverActivateStates()
            const edgeProperties = getEdgeProperties(edgeId) ?? {}
            if (!ensureSelfLoopControlPoint(edgeId, edgeProperties, true)) {
                enqueueEdgeSelection(edgeId, true)
            }
            state.selectedEdgeId = edgeId
            scheduleEndpointHandleRender()
            return
        }

        const edgeProperties = getEdgeProperties(edgeId) ?? {}
        if (edgeProperties.selected !== true) return

        const clickPoint: ControlPoint = [event.canvas.x, event.canvas.y]
        const existingPointHit =
            getControlPointHit(event) ??
            getNearestControlPointHit(edgeId, clickPoint)
        if (existingPointHit) return

        const points = getControlPoints(edgeId)
        const insertionIndex = getControlPointInsertionIndex(
            edgeId,
            clickPoint,
            points
        )
        const nextPoints: ControlPoint[] = [
            ...points.slice(0, insertionIndex),
            clickPoint,
            ...points.slice(insertionIndex),
        ]

        updateEdgeDataProperties(edgeId, {
            ...edgeProperties,
            controlPoints: nextPoints,
            selected: true,
        })
    }

    /**
     * Deletes an additional control point when double-clicking it.
     */
    const deleteControlPointByDoubleClick = (
        edgeId: string | undefined,
        event: IPointerEvent
    ) => {
        if (!edgeId) return

        const DELETE_HIT_RADIUS = CONTROL_POINT_HIT_RADIUS * 1.8
        const hit =
            getControlPointHit(event) ??
            getNearestControlPointHit(
                edgeId,
                [event.canvas.x, event.canvas.y],
                DELETE_HIT_RADIUS
            )
        if (!hit) return

        const edgeProperties = getEdgeProperties(edgeId) ?? {}
        if (edgeProperties.selected !== true) return

        const points = getControlPoints(edgeId)
        if (hit.pointIndex < 0 || hit.pointIndex >= points.length) return

        const nextPoints: ControlPoint[] = [
            ...points.slice(0, hit.pointIndex),
            ...points.slice(hit.pointIndex + 1),
        ]
        const nextEdgeProperties: Partial<RegulatoryEdgeProperties> = {
            ...edgeProperties,
            controlPoints: nextPoints,
            selected: true,
        }

        updateEndpointHandlesFromControlPoints(
            edgeId,
            nextPoints,
            nextEdgeProperties
        )

        updateEdgeDataProperties(edgeId, {
            ...nextEdgeProperties,
        })
    }

    const onEdgeDoubleClick = (event: IPointerEvent) => {
        deleteControlPointByDoubleClick(getEventEdgeId(event), event)
    }

    /**
     * Handles edge-local pointer down for immediate control-point dragging.
     */
    const onEdgePointerDown = (event: IPointerEvent) => {
        const edgeId = getEventEdgeId(event)
        if (!edgeId) return
        if (state.selectedEdgeId !== edgeId) return
        tryBeginAdditionalControlPointDrag({
            edgeId,
            event,
            requireExistingPointIndex: false,
        })
    }

    /**
     * Handles global pointer down to start dragging existing selected points.
     */
    const onPointerDown = (event: IPointerEvent) => {
        if (!state.selectedEdgeId) return
        if (state.activeControlPoint) return
        tryBeginAdditionalControlPointDrag({
            edgeId: state.selectedEdgeId,
            event,
            requireExistingPointIndex: true,
        })
    }

    /**
     * Returns pointer-down handler for source/target endpoint handle drags.
     */
    const onEndpointHandlePointerDown =
        (kind: EndpointKind) => (event: PointerEvent) => {
            if (!state.selectedEdgeId) return
            const points = getControlPoints(state.selectedEdgeId)
            beginControlPointDrag({
                edgeId: state.selectedEdgeId,
                kind,
                pointIndex: -1,
                points,
                setCursor: graph.getCanvas().setCursor.bind(graph.getCanvas()),
            })
            event.preventDefault()
            event.stopPropagation()
        }

    /**
     * Placeholder for pointer-move interaction checks while dragging.
     */
    const onPointerMove = () => {
        if (!state.activeControlPoint) return
        const { edgeId, kind } = state.activeControlPoint
        const edgeProperties = getEdgeProperties(edgeId) ?? {}
        if (edgeProperties.selected !== true) return
        if (kind === 'source' || kind === 'target' || kind === 'additional')
            return
    }

    /**
     * Ends dragging on graph pointer-up.
     */
    const onPointerUp = () => {
        stopControlPointDrag()
    }

    /**
     * Ends dragging on global pointer-up.
     */
    const onGlobalPointerUp = () => {
        stopControlPointDrag()
    }

    /**
     * Processes global drag movement for endpoints and additional points.
     */
    const onGlobalPointerMove = (event: PointerEvent) => {
        if (!state.activeControlPoint) return
        setDraggingCursorLock(true)
        const draggingEdgeId = state.activeControlPoint.edgeId

        const [canvasX, canvasY] = graph.getCanvasByClient([
            event.clientX,
            event.clientY,
        ])
        const edgeProperties = getEdgeProperties(draggingEdgeId) ?? {}

        if (state.activeControlPoint.kind === 'source') {
            applyEndpointDrag(
                'source',
                draggingEdgeId,
                [canvasX, canvasY],
                edgeProperties
            )
            return
        }
        if (state.activeControlPoint.kind === 'target') {
            applyEndpointDrag(
                'target',
                draggingEdgeId,
                [canvasX, canvasY],
                edgeProperties
            )
            return
        }

        const points = state.activeControlPoint.points
        if (state.activeControlPoint.pointIndex >= points.length) {
            stopControlPointDrag()
            return
        }

        const nextPoints = [...points] as [number, number][]
        nextPoints[state.activeControlPoint.pointIndex] = [canvasX, canvasY]
        state.activeControlPoint.points = nextPoints

        updateEndpointHandlesFromControlPoints(draggingEdgeId, nextPoints, {
            ...edgeProperties,
            controlPoints: nextPoints,
        })
        updateEdgeDataProperties(draggingEdgeId, {
            ...edgeProperties,
            controlPoints: nextPoints,
            selected: true,
        })
    }

    /**
     * Clears edge selection when clicking on empty canvas.
     */
    const onCanvasClick = () => {
        if (state.activeControlPoint) return
        if (state.shouldSkipEdgeClick) {
            state.shouldSkipEdgeClick = false
            return
        }
        if (!state.selectedEdgeId) return
        enqueueEdgeSelection(state.selectedEdgeId, false)
        state.selectedEdgeId = undefined
        clearHoverActivateStates()
        hideEndpointHandles()
    }

    /**
     * Shifts a control point by a given delta.
     */
    const shiftPoint = (
        point: [number, number] | undefined,
        deltaX: number,
        deltaY: number
    ): [number, number] | undefined => {
        if (!point) return undefined
        return [point[0] + deltaX, point[1] + deltaY]
    }

    /**
     * Captures initial node position for drag-delta calculations.
     */
    const onNodeDragStart = (event: IPointerEvent) => {
        if (event.targetType !== 'node') return
        const target = event.target as { id?: string | number }
        if (target.id === undefined) return
        const nodeId = String(target.id)
        const position = graph.getElementPosition(nodeId)
        state.draggingNodeLastPosition.set(nodeId, [
            Number(position[0] ?? 0),
            Number(position[1] ?? 0),
        ])
    }

    /**
     * Propagates node drag deltas to endpoint control points on attached edges.
     */
    const onNodeDrag = (event: IPointerEvent) => {
        if (event.targetType !== 'node') return
        const target = event.target as { id?: string | number }
        if (target.id === undefined) return
        const nodeId = String(target.id)
        const position = graph.getElementPosition(nodeId)
        const currentPosition: ControlPoint = [
            Number(position[0] ?? 0),
            Number(position[1] ?? 0),
        ]
        const previousPosition = state.draggingNodeLastPosition.get(nodeId)
        state.draggingNodeLastPosition.set(nodeId, currentPosition)
        if (!previousPosition) return

        const deltaX = currentPosition[0] - previousPosition[0]
        const deltaY = currentPosition[1] - previousPosition[1]
        if (Math.abs(deltaX) < 1e-6 && Math.abs(deltaY) < 1e-6) return

        const edges = graph.getEdgeData()
        for (const edge of edges) {
            const edgeId = String(edge.id)
            const isSourceNode = String(edge.source) === nodeId
            const isTargetNode = String(edge.target) === nodeId
            if (!isSourceNode && !isTargetNode) continue

            const edgeProperties = getEdgeProperties(edgeId) ?? {}
            const nextSourceControlPoint = isSourceNode
                ? shiftPoint(edgeProperties.sourceControlPoint, deltaX, deltaY)
                : edgeProperties.sourceControlPoint
            const nextTargetControlPoint = isTargetNode
                ? shiftPoint(edgeProperties.targetControlPoint, deltaX, deltaY)
                : edgeProperties.targetControlPoint

            if (
                nextSourceControlPoint === edgeProperties.sourceControlPoint &&
                nextTargetControlPoint === edgeProperties.targetControlPoint
            ) {
                continue
            }

            updateEdgeDataProperties(edgeId, {
                sourceControlPoint: nextSourceControlPoint,
                targetControlPoint: nextTargetControlPoint,
            })
        }
    }

    /**
     * Clears node drag bookkeeping after drag end.
     */
    const onNodeDragEnd = (event: IPointerEvent) => {
        if (event.targetType !== 'node') return
        const target = event.target as { id?: string | number }
        if (target.id === undefined) return
        state.draggingNodeLastPosition.delete(String(target.id))
    }

    const onBeforeAnimate = () => {
        startAnimationHandleSync()
    }

    const onAfterAnimate = () => {
        stopAnimationHandleSync()
        renderEndpointHandles()
    }

    const graphListeners: [string, (event: IPointerEvent) => void][] = [
        ['edge:click', onEdgeClick],
        ['edge:dblclick', onEdgeDoubleClick],
        ['edge:pointerdown', onEdgePointerDown],
        ['pointerdown', onPointerDown],
        ['node:dragstart', onNodeDragStart],
        ['node:drag', onNodeDrag],
        ['node:dragend', onNodeDragEnd],
        ['canvas:click', onCanvasClick],
        ['pointermove', onPointerMove],
        ['pointerup', onPointerUp],
        ['afterdraw', renderEndpointHandles],
        ['aftertransform', renderEndpointHandles],
        ['beforeanimate', onBeforeAnimate as (event: IPointerEvent) => void],
        ['afteranimate', onAfterAnimate as (event: IPointerEvent) => void],
    ]

    const windowListeners: [string, EventListenerOrEventListenerObject][] = [
        ['pointerup', onGlobalPointerUp as EventListener],
        ['pointermove', onGlobalPointerMove as EventListener],
        ['blur', onGlobalPointerUp as EventListener],
    ]

    return {
        graphListeners,
        windowListeners,
        onEndpointHandlePointerDown,
    }
}
