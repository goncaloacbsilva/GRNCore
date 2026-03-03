import { useSyncExternalStore } from 'react'
import type { XYPosition } from '@xyflow/react'

type ConnectionLineStoreState = {
    connectionLinePath: XYPosition[]
}

type Listener = () => void

const listeners = new Set<Listener>()

let state: ConnectionLineStoreState = {
    connectionLinePath: [],
}

function emit(): void {
    listeners.forEach((listener) => listener())
}

export const connectionLineStore = {
    getState(): ConnectionLineStoreState {
        return state
    },
    setState(next: Partial<ConnectionLineStoreState>): void {
        state = {
            ...state,
            ...next,
        }
        emit()
    },
    subscribe(listener: Listener): () => void {
        listeners.add(listener)

        return () => {
            listeners.delete(listener)
        }
    },
}

export function useConnectionLineStore(): ConnectionLineStoreState {
    return useSyncExternalStore(
        connectionLineStore.subscribe,
        connectionLineStore.getState,
        connectionLineStore.getState
    )
}
