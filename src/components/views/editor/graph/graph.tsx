import { Graph as G6Graph, type EdgeData, type GraphData } from '@antv/g6'

import { type RefObject, useEffect, useRef } from 'react'
import {
    createGraphConfig,
    createGraphResizeController,
    registerExtensions,
    unbindGraphListeners,
} from './utils'
import {
    bindGraphListeners,
    bindWindowListeners,
    createEdgeSnapshotStore,
    createEndpointController,
    createInteractionController,
    type InteractionState,
    unbindWindowListeners,
} from './utils'
import type { RegulatoryEdgeProperties } from '@/lib/schema'
import {
    DEFAULT_INTERACTION_TYPE,
    EDGE_DRAG_CURSOR_LOCK_CLASS,
    REGULATORY_EDGE_STYLES,
} from './constants'
import { useEditorStore } from '@/store/editor'

type ControlPoint = [number, number]

export interface GraphProps {
    data: GraphData
    onRender?: (graph: G6Graph) => void
    onDestroy?: () => void
}

function initializeGraphInstance(params: {
    containerRef: RefObject<HTMLDivElement | null>
    graphRef: RefObject<G6Graph | undefined>
    setGraphRef: (ref: RefObject<G6Graph>) => void
    isUnmountedRef: RefObject<boolean>
    isGraphReadyRef: RefObject<boolean>
    onDestroyRef: RefObject<(() => void) | undefined>
}) {
    const {
        containerRef,
        graphRef,
        setGraphRef,
        isUnmountedRef,
        isGraphReadyRef,
        onDestroyRef,
    } = params

    isUnmountedRef.current = false
    graphRef.current = new G6Graph({ container: containerRef.current! })

    if (graphRef.current) {
        setGraphRef(graphRef as RefObject<G6Graph>)
    }

    // Register all custom extensions
    registerExtensions()

    return () => {
        isUnmountedRef.current = true
        isGraphReadyRef.current = false
        const currentGraph = graphRef.current
        if (currentGraph) {
            currentGraph.destroy()
            onDestroyRef.current?.()
            graphRef.current = undefined
        }
    }
}

function renderGraphOnMount(params: {
    data: GraphData
    containerRef: RefObject<HTMLDivElement | null>
    graphRef: RefObject<G6Graph | undefined>
    isUnmountedRef: RefObject<boolean>
    isGraphReadyRef: RefObject<boolean>
    onRenderRef: RefObject<((graph: G6Graph) => void) | undefined>
    isIgnorableGraphError: (error: unknown) => boolean
}) {
    const {
        data,
        containerRef,
        graphRef,
        isUnmountedRef,
        isGraphReadyRef,
        onRenderRef,
        isIgnorableGraphError,
    } = params

    const container = containerRef.current
    const graph = graphRef.current

    if (!container || !graph || graph.destroyed) return

    const resizeController = createGraphResizeController({
        graph,
        isUnmountedRef,
        isGraphReadyRef,
        isIgnorableGraphError,
    })

    const interactionState: InteractionState = {
        activeControlPoint: undefined,
        selectedEdgeId: undefined,
        shouldSkipEdgeClick: false,
        draggingNodeLastPosition: new Map<string, ControlPoint>(),
    }

    const handleGraphError = (error: unknown) => {
        if (isIgnorableGraphError(error)) return
        console.error(error)
    }
    const { snapshotEdge, getEdgeDatum } = createEdgeSnapshotStore(
        graph,
        data.edges ?? []
    )

    const getEdgeProperties = (
        edgeId: string
    ): Partial<RegulatoryEdgeProperties> | undefined => {
        const edgeData = getEdgeDatum(edgeId)
        return edgeData?.data as Partial<RegulatoryEdgeProperties> | undefined
    }

    const getControlPoints = (edgeId: string): ControlPoint[] => {
        const points = getEdgeProperties(edgeId)?.controlPoints
        if (!Array.isArray(points)) return []

        return points.filter(
            (point): point is ControlPoint =>
                Array.isArray(point) &&
                point.length === 2 &&
                Number.isFinite(point[0]) &&
                Number.isFinite(point[1])
        )
    }
    const endpointController = createEndpointController({
        graph,
        containerRef,
        cursorLockClass: EDGE_DRAG_CURSOR_LOCK_CLASS,
        getSelectedEdgeId: () => interactionState.selectedEdgeId,
        getEdgeDatum,
        getEdgeProperties,
        getControlPoints,
        onError: handleGraphError,
    })
    const {
        createEndpointHandle,
        hideEndpointHandles,
        setDraggingCursorLock,
        getEndpointGuidePoint,
        getEdgeEndpointsFromPath,
        getSelfLoopGuides,
        getSelfLoopDefaultMiddlePoint,
        renderEndpointHandles,
        setEndpointHandleCanvasPosition,
        updateEndpointHandlesFromControlPoints,
        scheduleEndpointHandleRender,
        cleanup: cleanupEndpointController,
    } = endpointController

    const updateEdgeDataProperties = (
        edgeId: string,
        patch: Partial<RegulatoryEdgeProperties>
    ) => {
        const edgeData = getEdgeDatum(edgeId)
        if (!edgeData) return
        const currentData =
            (edgeData.data as Partial<RegulatoryEdgeProperties> | undefined) ??
            {}
        const mergedData: Partial<RegulatoryEdgeProperties> = {
            ...currentData,
            ...patch,
        }

        const interactionType =
            mergedData.type && mergedData.type in REGULATORY_EDGE_STYLES
                ? mergedData.type
                : DEFAULT_INTERACTION_TYPE

        const nextStyle = {
            ...(edgeData.style ?? {}),
            ...REGULATORY_EDGE_STYLES[interactionType],
            lineWidth: 2,
        }

        snapshotEdge({
            ...edgeData,
            data: mergedData,
            style: nextStyle,
        } as EdgeData)

        // Apply immediately so drag interactions (especially self-loop edits)
        // update geometry without waiting for the batched control-point flush.
        graph.updateEdgeData([
            {
                id: edgeId,
                source: edgeData.source,
                target: edgeData.target,
                data: {
                    ...mergedData,
                },
                style: nextStyle,
            },
        ])
        graph
            .draw()
            .then(() => {
                if (interactionState.activeControlPoint) {
                    // Keep endpoint handles visually locked to the edge while dragging.
                    renderEndpointHandles()
                }
            })
            .catch(handleGraphError)
    }

    const enqueueEdgeSelection = (edgeId: string, selected: boolean) => {
        const edgeData = getEdgeDatum(edgeId)
        if (!edgeData) return
        const edgeProperties =
            (edgeData.data as Partial<RegulatoryEdgeProperties> | undefined) ??
            {}

        updateEdgeDataProperties(edgeId, {
            ...edgeProperties,
            selected,
        })

        if (selected) {
            void graph.frontElement(edgeId)
        }
    }

    const { graphListeners, windowListeners, onEndpointHandlePointerDown } =
        createInteractionController({
            graph,
            state: interactionState,
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
            onError: handleGraphError,
        })

    graph.setOptions(createGraphConfig(data, resizeController.handleNodeResize))
    bindGraphListeners(graph, graphListeners)
    createEndpointHandle('source').addEventListener(
        'pointerdown',
        onEndpointHandlePointerDown('source')
    )
    createEndpointHandle('target').addEventListener(
        'pointerdown',
        onEndpointHandlePointerDown('target')
    )
    bindWindowListeners(windowListeners)

    graph
        .render()
        .then(() => {
            if (graph.destroyed || isUnmountedRef.current) return
            graph.getEdgeData().forEach((edge) => snapshotEdge(edge))
            isGraphReadyRef.current = true
            resizeController.onGraphRendered()
            renderEndpointHandles()
            onRenderRef.current?.(graph)
        })
        .catch((error) => {
            if (
                isUnmountedRef.current ||
                graph.destroyed ||
                isIgnorableGraphError(error)
            )
                return
            console.error(error)
        })

    return () => {
        isGraphReadyRef.current = false
        resizeController.cleanup()
        unbindGraphListeners(graph, graphListeners)
        cleanupEndpointController()
        unbindWindowListeners(windowListeners)
    }
}

export const Graph = (props: GraphProps) => {
    const { data, onRender, onDestroy } = props
    const setGraphRef = useEditorStore((state) => state.setGraphRef)
    const graphRef = useRef<G6Graph>(undefined)
    const containerRef = useRef<HTMLDivElement>(null)
    const isGraphReadyRef = useRef(false)
    const isUnmountedRef = useRef(false)
    const onRenderRef = useRef(onRender)
    const onDestroyRef = useRef(onDestroy)
    const isIgnorableGraphError = (error: unknown) =>
        error instanceof Error &&
        error.message.includes('this.context.element.draw')

    useEffect(() => {
        onRenderRef.current = onRender
        onDestroyRef.current = onDestroy
    }, [onDestroy, onRender])

    useEffect(() => {
        return initializeGraphInstance({
            containerRef,
            graphRef,
            setGraphRef,
            isUnmountedRef,
            isGraphReadyRef,
            onDestroyRef,
        })
    }, [])

    useEffect(() => {
        return renderGraphOnMount({
            data,
            containerRef,
            graphRef,
            isUnmountedRef,
            isGraphReadyRef,
            onRenderRef,
            isIgnorableGraphError,
        })
    })

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>
    )
}
