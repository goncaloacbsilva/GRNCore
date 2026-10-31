import type { InternalGRNModel } from '@/lib/schema'
import {
    serializeSnapshot,
    type SnapshotMutation,
} from './snapshot-serialization'

interface InitializeRequest {
    type: 'initialize'
    id: number
    modelId: string
    bytes: ArrayBuffer
}

interface SerializationRequest {
    type: 'serialize'
    id: number
    modelId: string
    mutations?: SnapshotMutation[]
    snapshot?: InternalGRNModel
}

interface SerializationSuccess {
    type: 'serialized'
    id: number
    bytes: Uint8Array<ArrayBuffer>
}

interface InitializationSuccess {
    type: 'initialized'
    id: number
    snapshot: InternalGRNModel
}

interface SerializationFailure {
    type: 'error'
    id: number
    error: string
}

export type SerializerRequest = InitializeRequest | SerializationRequest
export type SerializationResponse =
    | InitializationSuccess
    | SerializationSuccess
    | SerializationFailure

interface PendingSerialization {
    resolve: (bytes: Uint8Array<ArrayBuffer>) => void
    reject: (error: Error) => void
}

interface PendingInitialization {
    resolve: (snapshot: InternalGRNModel) => void
    reject: (error: Error) => void
}

let serializerWorker: Worker | null = null
let nextRequestId = 0
const initializedModelIds = new Set<string>()
const pendingSerializations = new Map<number, PendingSerialization>()
const pendingInitializations = new Map<number, PendingInitialization>()

const rejectPendingSerializations = (message: string) => {
    const error = new Error(message)
    pendingSerializations.forEach(({ reject }) => reject(error))
    pendingSerializations.clear()
    pendingInitializations.forEach(({ reject }) => reject(error))
    pendingInitializations.clear()
    initializedModelIds.clear()
}

const getSerializerWorker = (): Worker | null => {
    if (serializerWorker) return serializerWorker
    if (typeof Worker === 'undefined') return null

    try {
        serializerWorker = new Worker(
            new URL('./snapshot-serializer.worker.ts', import.meta.url),
            {
                type: 'module',
                name: 'snapshot-serializer',
            }
        )
        serializerWorker.onmessage = (
            event: MessageEvent<SerializationResponse>
        ) => {
            if (event.data.type === 'initialized') {
                const pending = pendingInitializations.get(event.data.id)
                if (!pending) return

                pendingInitializations.delete(event.data.id)
                pending.resolve(event.data.snapshot)
                return
            }

            if (event.data.type === 'error') {
                const pendingInitialization = pendingInitializations.get(
                    event.data.id
                )
                if (pendingInitialization) {
                    pendingInitializations.delete(event.data.id)
                    pendingInitialization.reject(new Error(event.data.error))
                    return
                }
            }

            const pending = pendingSerializations.get(event.data.id)
            if (!pending) return

            pendingSerializations.delete(event.data.id)
            if (event.data.type === 'error') {
                pending.reject(new Error(event.data.error))
            } else if (event.data.type === 'serialized') {
                pending.resolve(event.data.bytes)
            }
        }
        serializerWorker.onerror = (event) => {
            rejectPendingSerializations(
                event.message || 'The snapshot serializer worker failed.'
            )
            serializerWorker?.terminate()
            serializerWorker = null
        }
    } catch {
        serializerWorker = null
    }

    return serializerWorker
}

export const loadSnapshotOffMainThread = (
    modelId: string,
    bytes: ArrayBuffer
): Promise<InternalGRNModel | null> => {
    const worker = getSerializerWorker()
    if (!worker) {
        try {
            return Promise.resolve(
                JSON.parse(new TextDecoder().decode(bytes)) as InternalGRNModel
            )
        } catch {
            return Promise.resolve(null)
        }
    }

    const id = nextRequestId++
    initializedModelIds.add(modelId)
    const request: InitializeRequest = {
        type: 'initialize',
        id,
        modelId,
        bytes,
    }
    return new Promise<InternalGRNModel | null>((resolve, reject) => {
        pendingInitializations.set(id, { resolve, reject })
        worker.postMessage(request, [bytes])
    }).catch(() => null)
}

export const serializeSnapshotOffMainThread = (
    modelId: string,
    snapshot: InternalGRNModel,
    mutations?: SnapshotMutation[]
): Promise<Uint8Array<ArrayBuffer>> => {
    const worker = getSerializerWorker()
    if (!worker) {
        return Promise.resolve(serializeSnapshot(snapshot))
    }

    const canPatch =
        initializedModelIds.has(modelId) && mutations && mutations.length > 0
    const id = nextRequestId++
    const request: SerializationRequest = canPatch
        ? { type: 'serialize', id, modelId, mutations }
        : { type: 'serialize', id, modelId, snapshot }

    initializedModelIds.add(modelId)
    return new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => {
        pendingSerializations.set(id, { resolve, reject })
        worker.postMessage(request)
    })
}
