import { Graph as G6Graph, type GraphData } from '@antv/g6'
import { type RefObject, useEffect, useRef } from 'react'
import {
    createGraphConfig,
    createGraphResizeController,
    registerExtensions,
} from './utils'

export interface GraphProps {
    data: GraphData
    onRender?: (graph: G6Graph) => void
    onDestroy?: () => void
}

function initializeGraphInstance(params: {
    containerRef: RefObject<HTMLDivElement | null>
    graphRef: RefObject<G6Graph | undefined>
    isUnmountedRef: RefObject<boolean>
    isGraphReadyRef: RefObject<boolean>
    onDestroyRef: RefObject<(() => void) | undefined>
}) {
    const {
        containerRef,
        graphRef,
        isUnmountedRef,
        isGraphReadyRef,
        onDestroyRef,
    } = params

    isUnmountedRef.current = false
    graphRef.current = new G6Graph({ container: containerRef.current! })

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

    graph.setOptions(createGraphConfig(data, resizeController.handleNodeResize))

    graph
        .render()
        .then(() => {
            if (graph.destroyed || isUnmountedRef.current) return
            isGraphReadyRef.current = true
            resizeController.onGraphRendered()
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
    }
}

export const Graph = (props: GraphProps) => {
    const { data, onRender, onDestroy } = props
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
    }, [])

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
            }}
        />
    )
}
