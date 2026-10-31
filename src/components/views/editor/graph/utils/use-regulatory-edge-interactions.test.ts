import { describe, expect, it } from 'vitest'
import type { Edge } from '@xyflow/react'
import { selectEdgePreservingIdentity } from './use-regulatory-edge-interactions'

describe('edge selection updates', () => {
    it('preserves unrelated edge identity', () => {
        const first: Edge = { id: 'first', source: 'a', target: 'b' }
        const second: Edge = { id: 'second', source: 'b', target: 'c' }
        const third: Edge = { id: 'third', source: 'c', target: 'd' }
        const result = selectEdgePreservingIdentity(
            [first, second, third],
            'second'
        )

        expect(result[1]?.selected).toBe(true)
        expect(result[0]).toBe(first)
        expect(result[2]).toBe(third)
    })
})
