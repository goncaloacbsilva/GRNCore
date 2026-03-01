import type { RegulatoryEdgeProperties } from '@/lib/schema'
import type { Graph as G6Graph, EdgeData } from '@antv/g6'
import type { RefObject } from 'react'
import {
    getEdgeEndpointsFromPathData,
    getNearestPoint,
    type ControlPoint,
} from './interaction-helpers'

type EndpointKind = 'source' | 'target'

interface EndpointControllerParams {
    graph: G6Graph
    containerRef: RefObject<HTMLDivElement | null>
    cursorLockClass: string
    getSelectedEdgeId: () => string | undefined
    getEdgeDatum: (edgeId: string) => EdgeData | undefined
    getEdgeProperties: (
        edgeId: string
    ) => Partial<RegulatoryEdgeProperties> | undefined
    getControlPoints: (edgeId: string) => ControlPoint[]
    onError: (error: unknown) => void
}

/**
 * Builds the endpoint-handle controller used to render and update draggable
 * source/target edge handles in screen space.
 */
export const createEndpointController = (params: EndpointControllerParams) => {
    const {
        graph,
        containerRef,
        cursorLockClass,
        getSelectedEdgeId,
        getEdgeDatum,
        getEdgeProperties,
        getControlPoints,
        onError,
    } = params

    let endpointRenderRafId: number | null = null
    const endpointHandles: Partial<Record<EndpointKind, HTMLDivElement>> = {}

    /**
     * Lazily creates and returns the endpoint handle DOM element for a given side.
     */
    const createEndpointHandle = (kind: EndpointKind) => {
        if (endpointHandles[kind]) return endpointHandles[kind]
        const wrapper = containerRef.current?.parentElement
        if (!wrapper) {
            throw new Error('Graph wrapper is not mounted')
        }

        const element = document.createElement('div')
        element.className = `edge-endpoint-handle-${kind}`
        element.style.position = 'absolute'
        element.style.width = '10px'
        element.style.height = '10px'
        element.style.transform = 'translate(-50%, -50%)'
        element.style.borderRadius = '9999px'
        element.style.background = '#ffffff'
        element.style.border = '1.5px solid #0f172a'
        element.style.pointerEvents = 'auto'
        element.style.cursor = 'move'
        element.style.display = 'none'
        element.style.zIndex = '999'
        wrapper.appendChild(element)
        endpointHandles[kind] = element
        return element
    }

    /**
     * Hides both endpoint handle elements.
     */
    const hideEndpointHandles = () => {
        endpointHandles.source?.style.setProperty('display', 'none')
        endpointHandles.target?.style.setProperty('display', 'none')
    }

    /**
     * Toggles global cursor lock while endpoint/control-point dragging is active.
     */
    const setDraggingCursorLock = (isDragging: boolean) => {
        const canvas = graph.getCanvas?.()
        if (isDragging) {
            document.body.classList.add(cursorLockClass)
            canvas?.setCursor('grabbing')
            if (endpointHandles.source)
                endpointHandles.source.style.cursor = 'grabbing'
            if (endpointHandles.target)
                endpointHandles.target.style.cursor = 'grabbing'
            return
        }

        document.body.classList.remove(cursorLockClass)
        canvas?.setCursor('default')
        if (endpointHandles.source) endpointHandles.source.style.cursor = 'move'
        if (endpointHandles.target) endpointHandles.target.style.cursor = 'move'
    }

    /**
     * Resolves a node center and size-derived bounds used for endpoint snapping.
     */
    const getNodeCenterAndRadius = (nodeId: string) => {
        const fallbackNode = graph.getNodeData(nodeId) as
            | { style?: { x?: number; y?: number } }
            | undefined
        let centerX = Number(fallbackNode?.style?.x ?? 0)
        let centerY = Number(fallbackNode?.style?.y ?? 0)
        let radius = 20
        let halfWidth = 20
        let halfHeight = 20

        try {
            const bounds = graph.getElementRenderBounds(nodeId)
            const center = bounds?.center as
                | [number, number, number]
                | undefined
            if (
                center &&
                Number.isFinite(center[0]) &&
                Number.isFinite(center[1])
            ) {
                centerX = center[0]
                centerY = center[1]
            } else {
                const position = graph.getElementPosition(nodeId)
                centerX = Number(position[0] ?? centerX)
                centerY = Number(position[1] ?? centerY)
            }

            const halfExtents = bounds?.halfExtents as
                | [number, number, number]
                | undefined
            if (
                halfExtents &&
                Number.isFinite(halfExtents[0]) &&
                Number.isFinite(halfExtents[1])
            ) {
                radius = Math.max(halfExtents[0], halfExtents[1])
                halfWidth = Math.max(halfExtents[0], 1)
                halfHeight = Math.max(halfExtents[1], 1)
            }
        } catch {
            // Keep fallback values when render bounds are temporarily unavailable.
        }

        return {
            center: [centerX, centerY] as ControlPoint,
            radius:
                Number.isFinite(radius) && radius > 0
                    ? Math.min(Math.max(radius, 8), 120)
                    : 20,
            halfWidth,
            halfHeight,
        }
    }

    /**
     * Projects a pointer onto the source/target node boundary for endpoint placement.
     */
    const getEndpointGuidePoint = (
        edgeId: string,
        kind: EndpointKind,
        pointer: ControlPoint
    ): ControlPoint => {
        const edgeData = getEdgeDatum(edgeId)
        if (!edgeData) return pointer

        const nodeId =
            kind === 'source'
                ? String(edgeData.source)
                : String(edgeData.target)
        const { center, radius, halfWidth, halfHeight } =
            getNodeCenterAndRadius(nodeId)
        const edgeProperties = getEdgeProperties(edgeId) ?? {}
        const storedPoint =
            kind === 'source'
                ? edgeProperties.sourceControlPoint
                : edgeProperties.targetControlPoint

        let dx = pointer[0] - center[0]
        let dy = pointer[1] - center[1]

        if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
            dx = 0
            dy = 0
        }

        if (Math.hypot(dx, dy) < 1e-6 && Array.isArray(storedPoint)) {
            const [storedX, storedY] = storedPoint
            if (Number.isFinite(storedX) && Number.isFinite(storedY)) {
                dx = storedX - center[0]
                dy = storedY - center[1]
            }
        }

        if (Math.hypot(dx, dy) < 1e-6) {
            dx = 1
            dy = 0
        }

        const length = Math.hypot(dx, dy)
        const unitX = dx / length
        const unitY = dy / length

        const eps = 1e-6
        const tx =
            Math.abs(unitX) > eps ? halfWidth / Math.abs(unitX) : Infinity
        const ty =
            Math.abs(unitY) > eps ? halfHeight / Math.abs(unitY) : Infinity
        const tRect = Math.min(tx, ty)

        if (Number.isFinite(tRect) && tRect > eps) {
            return [center[0] + unitX * tRect, center[1] + unitY * tRect]
        }

        return [center[0] + unitX * radius, center[1] + unitY * radius]
    }

    /**
     * Reads rendered edge path and extracts current source/target endpoints.
     */
    const getEdgeEndpointsFromPath = (
        edgeId: string
    ): { source: ControlPoint; target: ControlPoint } | undefined => {
        const style = graph.getElementRenderStyle(edgeId)
        return getEdgeEndpointsFromPathData(style?.d)
    }

    /**
     * Returns guide endpoints for self-loops, preferring persisted controls.
     */
    const getSelfLoopGuides = (
        edgeId: string
    ): { source: ControlPoint; target: ControlPoint } | undefined => {
        const edgeData = getEdgeDatum(edgeId)
        if (!edgeData) return undefined
        if (String(edgeData.source) !== String(edgeData.target))
            return undefined

        const edgeProperties = getEdgeProperties(edgeId) ?? {}
        if (
            edgeProperties.sourceControlPoint &&
            edgeProperties.targetControlPoint
        ) {
            return {
                source: edgeProperties.sourceControlPoint,
                target: edgeProperties.targetControlPoint,
            }
        }

        const pathEndpoints = getEdgeEndpointsFromPath(edgeId)
        if (pathEndpoints) {
            const distance = Math.hypot(
                pathEndpoints.target[0] - pathEndpoints.source[0],
                pathEndpoints.target[1] - pathEndpoints.source[1]
            )
            if (distance > 6) {
                return pathEndpoints
            }
        }

        const { center } = getNodeCenterAndRadius(String(edgeData.source))
        const fallbackGuideOffset = 56
        const sourceGuide = getEndpointGuidePoint(edgeId, 'source', [
            center[0] - fallbackGuideOffset,
            center[1] - fallbackGuideOffset,
        ])
        const targetGuide = getEndpointGuidePoint(edgeId, 'target', [
            center[0] + fallbackGuideOffset,
            center[1] - fallbackGuideOffset,
        ])

        return {
            source: sourceGuide,
            target: targetGuide,
        }
    }

    /**
     * Computes best-effort edge endpoints from data for non-render-path flows.
     */
    const getDataDrivenEdgeEndpoints = (
        edgeId: string
    ): { source: ControlPoint; target: ControlPoint } | undefined => {
        const edgeData = getEdgeDatum(edgeId)
        if (!edgeData) return undefined

        const isSelfLoop = String(edgeData.source) === String(edgeData.target)
        if (isSelfLoop) return getSelfLoopGuides(edgeId)

        const edgeProperties = getEdgeProperties(edgeId) ?? {}
        const controlPoints = getControlPoints(edgeId)
        const sourceCenter = getNodeCenterAndRadius(
            String(edgeData.source)
        ).center
        const targetCenter = getNodeCenterAndRadius(
            String(edgeData.target)
        ).center

        const sourceGuideCandidate = getNearestPoint(
            controlPoints,
            sourceCenter,
            targetCenter
        )
        const targetGuideCandidate = getNearestPoint(
            controlPoints,
            targetCenter,
            sourceCenter
        )

        const source =
            edgeProperties.sourceControlPoint ??
            getEndpointGuidePoint(edgeId, 'source', sourceGuideCandidate)
        const target =
            edgeProperties.targetControlPoint ??
            getEndpointGuidePoint(edgeId, 'target', targetGuideCandidate)

        return { source, target }
    }

    /**
     * Renders endpoint handles at the selected edge's current endpoint positions.
     */
    const renderEndpointHandles = () => {
        const selectedEdgeId = getSelectedEdgeId()
        if (!selectedEdgeId) {
            hideEndpointHandles()
            return
        }

        const endpoints =
            getSelfLoopGuides(selectedEdgeId) ??
            getEdgeEndpointsFromPath(selectedEdgeId) ??
            getDataDrivenEdgeEndpoints(selectedEdgeId)
        if (!endpoints) {
            hideEndpointHandles()
            return
        }

        const sourceHandle = createEndpointHandle('source')
        const targetHandle = createEndpointHandle('target')
        const sourceViewport = graph.getViewportByCanvas(endpoints.source)
        const targetViewport = graph.getViewportByCanvas(endpoints.target)

        sourceHandle.style.left = `${sourceViewport[0]}px`
        sourceHandle.style.top = `${sourceViewport[1]}px`
        sourceHandle.style.display = 'block'

        targetHandle.style.left = `${targetViewport[0]}px`
        targetHandle.style.top = `${targetViewport[1]}px`
        targetHandle.style.display = 'block'
    }

    /**
     * Places a handle in viewport coordinates derived from a canvas point.
     */
    const setEndpointHandleCanvasPosition = (
        kind: EndpointKind,
        canvasPoint: ControlPoint
    ) => {
        const handle = endpointHandles[kind]
        if (!handle) return
        const [vx, vy] = graph.getViewportByCanvas(canvasPoint)
        handle.style.left = `${vx}px`
        handle.style.top = `${vy}px`
        handle.style.display = 'block'
    }

    /**
     * Repositions endpoint handles after control-point edits.
     */
    const updateEndpointHandlesFromControlPoints = (
        edgeId: string,
        controlPoints: ControlPoint[],
        edgeProperties: Partial<RegulatoryEdgeProperties>
    ) => {
        const edgeData = getEdgeDatum(edgeId)
        if (!edgeData) return

        const isSelfLoop = String(edgeData.source) === String(edgeData.target)
        if (isSelfLoop) {
            const guides = getSelfLoopGuides(edgeId)
            if (!guides) return
            setEndpointHandleCanvasPosition(
                'source',
                edgeProperties.sourceControlPoint ?? guides.source
            )
            setEndpointHandleCanvasPosition(
                'target',
                edgeProperties.targetControlPoint ?? guides.target
            )
            return
        }

        const sourceNodeId = String(edgeData.source)
        const targetNodeId = String(edgeData.target)
        const sourceCenter = getNodeCenterAndRadius(sourceNodeId).center
        const targetCenter = getNodeCenterAndRadius(targetNodeId).center

        const sourceGuideCandidate = getNearestPoint(
            controlPoints,
            sourceCenter,
            targetCenter
        )
        const targetGuideCandidate = getNearestPoint(
            controlPoints,
            targetCenter,
            sourceCenter
        )

        const sourcePoint =
            edgeProperties.sourceControlPoint ??
            getEndpointGuidePoint(edgeId, 'source', sourceGuideCandidate)
        const targetPoint =
            edgeProperties.targetControlPoint ??
            getEndpointGuidePoint(edgeId, 'target', targetGuideCandidate)

        setEndpointHandleCanvasPosition('source', sourcePoint)
        setEndpointHandleCanvasPosition('target', targetPoint)
    }

    /**
     * Schedules a single-frame handle render pass.
     */
    const scheduleEndpointHandleRender = () => {
        if (endpointRenderRafId !== null) return
        endpointRenderRafId = requestAnimationFrame(() => {
            endpointRenderRafId = null
            renderEndpointHandles()
        })
    }

    /**
     * Disposes DOM handles and pending animation work.
     */
    const cleanup = () => {
        if (endpointRenderRafId !== null) {
            cancelAnimationFrame(endpointRenderRafId)
            endpointRenderRafId = null
        }
        endpointHandles.source?.remove()
        endpointHandles.target?.remove()
        setDraggingCursorLock(false)
    }

    return {
        createEndpointHandle,
        hideEndpointHandles,
        setDraggingCursorLock,
        getNodeCenterAndRadius,
        getEndpointGuidePoint,
        getEdgeEndpointsFromPath,
        getSelfLoopGuides,
        getSelfLoopDefaultMiddlePoint: (
            edgeId: string,
            source: ControlPoint,
            target: ControlPoint
        ): ControlPoint | undefined => {
            const edgeData = getEdgeDatum(edgeId)
            if (!edgeData) return undefined
            if (String(edgeData.source) !== String(edgeData.target)) {
                return undefined
            }

            const { center } = getNodeCenterAndRadius(String(edgeData.source))
            const midX = (source[0] + target[0]) / 2
            const midY = (source[1] + target[1]) / 2

            let dx = midX - center[0]
            let dy = midY - center[1]
            const length = Math.hypot(dx, dy)
            if (length < 1e-6) {
                dx = 0
                dy = -1
            } else {
                dx /= length
                dy /= length
            }

            const sourceDist = Math.hypot(
                source[0] - center[0],
                source[1] - center[1]
            )
            const targetDist = Math.hypot(
                target[0] - center[0],
                target[1] - center[1]
            )
            const offset = Math.max(sourceDist, targetDist) + 36
            const controlPoint: ControlPoint = [
                midX + dx * offset,
                midY + dy * offset,
            ]

            return [
                source[0] * 0.25 + controlPoint[0] * 0.5 + target[0] * 0.25,
                source[1] * 0.25 + controlPoint[1] * 0.5 + target[1] * 0.25,
            ]
        },
        renderEndpointHandles,
        setEndpointHandleCanvasPosition,
        updateEndpointHandlesFromControlPoints,
        scheduleEndpointHandleRender,
        cleanup,
        onError,
    }
}
