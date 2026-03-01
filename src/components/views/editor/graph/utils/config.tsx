import {
    ExtensionCategory,
    register,
    type GraphData,
    type GraphOptions,
    type NodeData,
} from '@antv/g6'
import { separateParallelEdges } from './separate-parallel-edges'
import { RegulatoryEdge, RegulatoryNode } from '../elements'
import { DotsGrid } from '../extensions/dots-grid'
import { ReactNode } from '@antv/g6-extension-react'
import { EDGE_DRAG_CURSOR_LOCK_CLASS } from '../constants'

/**
 * Registers all custom extensions used in the graph, including custom nodes, edges, and plugins.
 * This function should be called once during the application's initialization to ensure that all extensions are available when rendering the graph.
 *
 * IMPORTANT: Any extension that is used in the graph configuration must be included here, otherwise the graph will not render correctly.
 */
export const registerExtensions = () => {
    register(ExtensionCategory.PLUGIN, 'dots-grid', DotsGrid)
    register(ExtensionCategory.NODE, 'react-node', ReactNode)
    register(ExtensionCategory.EDGE, 'regulatory-edge', RegulatoryEdge)
}

/**
 * Creates the configuration object for initializing the G6 graph instance.
 * Receives the graph data and a callback for handling node resize events.
 *
 * All the graph options, node and edge styles, behaviors, and plugins, are defined here.
 * @param data The graph data containing nodes and edges to be rendered.
 * @param onNodeResize Callback function that gets called when a node is resized, receiving the node ID and new dimensions.
 * @returns GraphOptions object that can be used to initialize the G6 graph instance with the desired configuration.
 */
export const createGraphConfig = (
    data: GraphData,
    onNodeResize: (id: string, width: number, height: number) => void
): GraphOptions => ({
    // Preprocess graph data to separate parallel edges and set initial states.
    data: separateParallelEdges(initialRendering(data)),

    // Custom edge (RegulatoryEdge)
    edge: {
        type: 'regulatory-edge',
        state: {
            // Used to dim non-hovered edges during hover-activate behavior.
            dim: { opacity: 0.2 },

            // Used to hide edges on initial rendering.
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
        },
        animation: {
            // Animate opacity changes for edges when their state changes.
            state: [{ fields: ['opacity'], shape: 'key' }],
        },
    },

    // Custom React Node (RegulatoryNode)
    node: {
        type: 'react-node',
        style: {
            component: (data: NodeData) => (
                <RegulatoryNode
                    data={data}
                    onResize={(width, height) =>
                        onNodeResize(String(data.id), width, height)
                    }
                />
            ),
        },
        state: {
            dim: {},
        },
    },

    // Configure allowed zoom range
    zoomRange: [0.8, 2.5],

    behaviors: [
        // Enable dragging the canvas to pan around the graph.
        'drag-canvas',

        // Custom zoom behavior that allows both Ctrl+wheel and native pinch events for zooming.
        {
            key: 'custom-zoom-canvas',
            type: 'zoom-canvas',
            enable: (event: { ctrlKey?: boolean; scale?: number }) => {
                // Allow both trackpad Ctrl+wheel and native pinch events.
                return !!event.ctrlKey || typeof event.scale === 'number'
            },
        },

        // Enable dragging nodes to reposition them.
        'drag-element',

        // Enable scroll to pan the canvas
        'scroll-canvas',

        // Custom hover behavior that activates neighboring edges and dims non-hovered edges.
        {
            type: 'hover-activate',
            degree: 1,
            inactiveState: 'dim',
            onHover: (event: {
                view?: { setCursor: (cursor: string) => void }
            }) => {
                if (
                    document.body.classList.contains(
                        EDGE_DRAG_CURSOR_LOCK_CLASS
                    )
                ) {
                    return
                }
                event.view?.setCursor('pointer')
            },
            onHoverEnd: (event: {
                view?: { setCursor: (cursor: string) => void }
            }) => {
                if (
                    document.body.classList.contains(
                        EDGE_DRAG_CURSOR_LOCK_CLASS
                    )
                ) {
                    return
                }
                event.view?.setCursor('default')
            },
        },

        // Custom click-select behavior that allows selecting nodes and their neighbors with Shift+Click
        {
            type: 'click-select',
            degree: 1,
            state: 'selected',
            neighborState: 'active',

            multiple: true,
            trigger: ['shift'],
        },
    ],
    plugins: [
        // Add a grid of dots in the background to help users orient themselves when moving around the graph.
        {
            key: 'dots-grid',
            type: 'dots-grid',
            size: 20,
            dotColor: '#ebebeb',
            dotRadius: 1.5,
            follow: true,
        },
    ],
})

const initialRendering = (graph: GraphData): GraphData => {
    // Hide all edges initially.

    if (!graph.edges) return graph

    return {
        ...graph,
        edges: graph.edges.map((edge) => ({
            ...edge,
            states: [...(edge.states ?? []), 'hidden'],
        })),
    }
}
