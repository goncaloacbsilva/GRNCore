import { describe, expect, it } from 'vitest'
import type { Edge } from '@xyflow/react'
import {
    buildEdgeAdjacencyMap,
    buildEdgeIndexById,
    shiftDraggedEdgePoints,
} from './node-drag'

type TestEdge = Edge<{ points?: { id?: string; x: number; y: number }[] }>

const point = (id: string, x = 10, y = 20) => ({ id, x, y })

describe('shiftDraggedEdgePoints', () => {
    it('moves only incident stored points and preserves unrelated edge identity', () => {
        const edges: TestEdge[] = [
            {
                id: 'incident',
                source: 'dragged',
                target: 'other',
                data: {
                    points: [
                        point('incident-start-control'),
                        point('geometry'),
                        point('incident-end-control', 30, 40),
                    ],
                },
            },
            {
                id: 'unrelated',
                source: 'far-a',
                target: 'far-b',
                data: { points: [point('geometry')] },
            },
            { id: 'no-points', source: 'dragged', target: 'other' },
        ]

        const next = shiftDraggedEdgePoints({
            edges,
            draggedNodeIds: new Set(['dragged']),
            delta: { x: 5, y: -3 },
            adjacency: buildEdgeAdjacencyMap(edges),
        })

        expect(next).not.toBe(edges)
        expect(next[0]).not.toBe(edges[0])
        expect(next[1]).toBe(edges[1])
        expect(next[2]).toBe(edges[2])
        expect(next[0].data?.points).toEqual([
            point('incident-start-control', 15, 17),
            point('geometry'),
            point('incident-end-control', 30, 40),
        ])
    })

    it('returns the exact edge array when affected edges have no movable points', () => {
        const edges: TestEdge[] = [
            { id: 'plain', source: 'dragged', target: 'other' },
            { id: 'far', source: 'far-a', target: 'far-b' },
        ]

        expect(
            shiftDraggedEdgePoints({
                edges,
                draggedNodeIds: new Set(['dragged']),
                delta: { x: 2, y: 2 },
                adjacency: buildEdgeAdjacencyMap(edges),
            })
        ).toBe(edges)
    })

    it('moves all geometry for self-loops and both-endpoint multi-node drags', () => {
        const edges: TestEdge[] = [
            {
                id: 'loop',
                source: 'dragged',
                target: 'dragged',
                data: { points: [point('loop-start-control'), point('loop-geometry')] },
            },
            {
                id: 'between-dragged',
                source: 'dragged',
                target: 'dragged-2',
                data: { points: [point('between-geometry')] },
            },
        ]

        const next = shiftDraggedEdgePoints({
            edges,
            draggedNodeIds: new Set(['dragged', 'dragged-2']),
            delta: { x: 1, y: 4 },
            adjacency: buildEdgeAdjacencyMap(edges),
        })

        expect(next[0].data?.points).toEqual([
            point('loop-start-control', 11, 24),
            point('loop-geometry', 11, 24),
        ])
        expect(next[1].data?.points).toEqual([point('between-geometry', 11, 24)])
    })
})

describe('node drag interaction cost', () => {
    it('updates only the incident subset in a 1,000-node/1,500-edge graph', () => {
        const edges: TestEdge[] = Array.from({ length: 1500 }, (_, index) => ({
            id: `edge-${index}`,
            source: `node-${index % 1000}`,
            target: `node-${(index + 1) % 1000}`,
            data: {
                points: [
                    point(`edge-${index}-start-control`),
                    point(`edge-${index}-geometry`),
                    point(`edge-${index}-end-control`),
                ],
            },
        }))
        const adjacency = buildEdgeAdjacencyMap(edges)
        const incidentIds = adjacency.get('node-42') ?? new Set<string>()
        let changedCount = 0

        const next = shiftDraggedEdgePoints({
            edges,
            draggedNodeIds: new Set(['node-42']),
            delta: { x: 1, y: 1 },
            adjacency,
            edgeIndexById: buildEdgeIndexById(edges),
        })
        next.forEach((edge, index) => {
            if (edge !== edges[index]) changedCount += 1
        })

        expect(incidentIds.size).toBe(4)
        expect(changedCount).toBe(4)
        expect(changedCount).toBeLessThan(1500)
    })
})
