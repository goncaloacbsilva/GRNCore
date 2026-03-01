import type { InteractionType } from '@/lib/schema'

/**
 * Constants related to edge rendering and interaction in the graph editor.
 */

// CSS class name used to lock the cursor during edge control point dragging.
export const EDGE_DRAG_CURSOR_LOCK_CLASS = 'edge-control-point-dragging'

// How strict or forgiving the orthogonal snapping should be when dragging edges.
export const AXIS_ALIGNMENT_TOLERANCE = 8

// Default interaction type for new edges created in the editor.
export const DEFAULT_INTERACTION_TYPE: InteractionType = 'activation'

// Styles for different types of regulatory edges.
export const REGULATORY_EDGE_STYLES: Record<
    InteractionType,
    Record<string, unknown>
> = {
    activation: {
        stroke: '#00C800',
        endArrow: true,
        endArrowType: 'vee',
        endArrowSize: 10,
        endArrowFill: '#00C800',
        endArrowStroke: '#00C800',
    },
    inhibition: {
        stroke: '#c80000',
        endArrow: true,
        endArrowType: 'rect',
        endArrowSize: [2, 14],
        endArrowOffset: 8,
        endArrowFill: '#c80000',
        endArrowStroke: '#c80000',
    },
    dual: {
        stroke: '#0000c8',
        endArrow: true,
        endArrowType: 'triangleRect',
    },
}
