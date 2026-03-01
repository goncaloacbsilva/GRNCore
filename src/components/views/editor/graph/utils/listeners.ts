import type { Graph as G6Graph, IPointerEvent } from '@antv/g6'

export type GraphListener = [string, (event: IPointerEvent) => void]
export type WindowListener = [string, EventListenerOrEventListenerObject]

/**
 * Registers multiple G6 event listeners in a single pass.
 */
export const bindGraphListeners = (
    graph: G6Graph,
    listeners: GraphListener[]
) => {
    for (const [eventName, handler] of listeners) {
        graph.on(eventName, handler)
    }
}

/**
 * Removes previously registered G6 event listeners.
 */
export const unbindGraphListeners = (
    graph: G6Graph,
    listeners: GraphListener[]
) => {
    for (const [eventName, handler] of listeners) {
        graph.off(eventName, handler)
    }
}

/**
 * Registers global browser listeners used by graph interaction controllers.
 */
export const bindWindowListeners = (listeners: WindowListener[]) => {
    for (const [eventName, handler] of listeners) {
        window.addEventListener(eventName, handler)
    }
}

/**
 * Removes global browser listeners added by {@link bindWindowListeners}.
 */
export const unbindWindowListeners = (listeners: WindowListener[]) => {
    for (const [eventName, handler] of listeners) {
        window.removeEventListener(eventName, handler)
    }
}
