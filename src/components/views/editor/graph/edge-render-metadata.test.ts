import { describe, expect, it, vi } from 'vitest'
import type { ParallelEdgeMeta } from './utils'
import { createEdgeRenderMetadataStore } from './edge-render-metadata'

const metadata = (
    entries: [string, ParallelEdgeMeta][]
): ReadonlyMap<string, ParallelEdgeMeta> => new Map(entries)

describe('edge render metadata store', () => {
    it('preserves snapshots and skips notifications when metadata is unchanged', () => {
        const store = createEdgeRenderMetadataStore(
            metadata([
                ['first', { index: 0, total: 2, centeredIndex: -0.5 }],
                ['second', { index: 1, total: 2, centeredIndex: 0.5 }],
            ])
        )
        const listener = vi.fn()
        store.subscribe(listener)
        const firstSnapshot = store.getSnapshot('first')

        store.update(
            metadata([
                ['first', { index: 0, total: 2, centeredIndex: -0.5 }],
                ['second', { index: 1, total: 2, centeredIndex: 0.5 }],
            ])
        )

        expect(store.getSnapshot('first')).toBe(firstSnapshot)
        expect(listener).not.toHaveBeenCalled()
    })

    it('changes only the snapshots whose parallel grouping changed', () => {
        const store = createEdgeRenderMetadataStore(
            metadata([
                ['first', { index: 0, total: 1, centeredIndex: 0 }],
                ['unchanged', { index: 0, total: 1, centeredIndex: 0 }],
            ])
        )
        const listener = vi.fn()
        store.subscribe(listener)
        const firstSnapshot = store.getSnapshot('first')
        const unchangedSnapshot = store.getSnapshot('unchanged')

        store.update(
            metadata([
                ['first', { index: 0, total: 2, centeredIndex: -0.5 }],
                ['unchanged', { index: 0, total: 1, centeredIndex: 0 }],
            ])
        )

        expect(store.getSnapshot('first')).not.toBe(firstSnapshot)
        expect(store.getSnapshot('unchanged')).toBe(unchangedSnapshot)
        expect(listener).toHaveBeenCalledOnce()
    })
})
