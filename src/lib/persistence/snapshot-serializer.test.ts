import { describe, expect, it } from 'vitest'
import type { InternalGRNModel } from '@/lib/schema'
import diff from 'microdiff'
import {
    applySnapshotMutations,
    serializeSnapshot,
} from './snapshot-serialization'
import { loadSnapshotOffMainThread } from './snapshot-serializer'

describe('serializeSnapshot', () => {
    it('loads a serialized snapshot when workers are unavailable', async () => {
        const snapshot = {
            title: 'Loaded model',
            nodes: [],
            edges: [],
        } as unknown as InternalGRNModel
        const bytes = new TextEncoder().encode(JSON.stringify(snapshot)).buffer

        await expect(
            loadSnapshotOffMainThread('model-1', bytes)
        ).resolves.toEqual(snapshot)
    })

    it('encodes the snapshot without transient React Flow fields', () => {
        const snapshot = {
            title: 'Model',
            nodes: [
                {
                    id: 'node-1',
                    position: { x: 10, y: 20 },
                    data: { name: 'Node 1', rules: [] },
                    selected: true,
                    dragging: true,
                    measured: { width: 100, height: 40 },
                    width: 100,
                    height: 40,
                },
            ],
            edges: [
                {
                    id: 'edge-1',
                    source: 'node-1',
                    target: 'node-1',
                    selected: true,
                    zIndex: 2,
                },
            ],
        } as unknown as InternalGRNModel

        const serialized = new TextDecoder().decode(serializeSnapshot(snapshot))
        const parsed = JSON.parse(serialized) as InternalGRNModel

        expect(parsed.title).toBe('Model')
        expect(parsed.nodes[0]).not.toHaveProperty('selected')
        expect(parsed.nodes[0]).not.toHaveProperty('dragging')
        expect(parsed.nodes[0]).not.toHaveProperty('measured')
        expect(parsed.nodes[0]).not.toHaveProperty('width')
        expect(parsed.nodes[0]).not.toHaveProperty('height')
        expect(parsed.edges[0]).not.toHaveProperty('selected')
        expect(parsed.edges[0]).not.toHaveProperty('zIndex')
        expect(parsed.nodes[0]?.data.name).toBe('Node 1')
    })

    it('applies coalesced graph and metadata mutations in order', () => {
        const initial = {
            title: 'Initial',
            nodes: [
                {
                    id: 'node-1',
                    position: { x: 10, y: 20 },
                    data: { name: 'Node 1', rules: [] },
                },
            ],
            edges: [],
        } as unknown as InternalGRNModel
        const moved = structuredClone(initial)
        moved.nodes[0].position = { x: 30, y: 40 }
        const renamed = structuredClone(moved)
        renamed.nodes[0].data.name = 'Renamed'

        const result = applySnapshotMutations(structuredClone(initial), [
            { type: 'apply-diffs', changes: diff(initial, moved) },
            { type: 'apply-diffs', changes: diff(moved, renamed) },
            { type: 'set-title', title: 'Updated' },
            {
                type: 'set-annotations',
                annotations: { references: [], unstructured: null },
            },
        ])

        expect(result.nodes[0].position).toEqual({ x: 30, y: 40 })
        expect(result.nodes[0].data.name).toBe('Renamed')
        expect(result.title).toBe('Updated')
        expect(result.annotations).toEqual({
            references: [],
            unstructured: null,
        })
    })
})
