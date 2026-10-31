import type { InternalGRNModel } from '@/lib/schema'
import {
    applySnapshotMutations,
    serializeSnapshot,
} from './snapshot-serialization'
import type {
    SerializerRequest,
    SerializationResponse,
} from './snapshot-serializer'

interface SnapshotSerializerWorkerScope {
    onmessage: ((event: MessageEvent<SerializerRequest>) => void) | null
    postMessage: (
        message: SerializationResponse,
        transfer: Transferable[]
    ) => void
}

const workerScope = globalThis as unknown as SnapshotSerializerWorkerScope
const snapshots = new Map<string, InternalGRNModel>()

workerScope.onmessage = ({ data }) => {
    if (data.type === 'initialize') {
        try {
            const serialized = new TextDecoder().decode(data.bytes)
            const snapshot = JSON.parse(serialized) as InternalGRNModel
            snapshots.set(data.modelId, snapshot)
            workerScope.postMessage(
                { type: 'initialized', id: data.id, snapshot },
                []
            )
        } catch (error) {
            workerScope.postMessage(
                {
                    type: 'error',
                    id: data.id,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Could not parse the model snapshot.',
                },
                []
            )
        }
        return
    }

    try {
        let snapshot = snapshots.get(data.modelId)
        if (data.snapshot) {
            snapshot = data.snapshot
            snapshots.set(data.modelId, snapshot)
        } else if (snapshot && data.mutations) {
            applySnapshotMutations(snapshot, data.mutations)
        } else {
            throw new Error('The snapshot serializer is not initialized.')
        }

        const bytes = serializeSnapshot(snapshot)
        workerScope.postMessage({ type: 'serialized', id: data.id, bytes }, [
            bytes.buffer,
        ])
    } catch (error) {
        workerScope.postMessage(
            {
                type: 'error',
                id: data.id,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Could not serialize the model snapshot.',
            },
            []
        )
    }
}
