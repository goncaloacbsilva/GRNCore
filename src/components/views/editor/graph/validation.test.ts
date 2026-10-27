import { describe, expect, it } from 'vitest'
import type { Edge, Node } from '@xyflow/react'
import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import {
    createValidationSnapshot,
    validateGraphIncrementally,
} from './validation'

function makeSyntheticGraph() {
    const nodes: Node<RegulatoryNodeProperties>[] = Array.from(
        { length: 1000 },
        (_, index) => ({
            id: `node-${index}`,
            position: { x: index, y: 0 },
            data: {
                name: `N${index}`,
                activityLevels: 1,
                isInputNode: false,
                rules: [
                    {
                        id: `rule-${index}`,
                        target: 1,
                        expression: `N${(index + 999) % 1000}`,
                        isValid: true,
                    },
                ],
                annotations: undefined,
            },
            selected: false,
        })
    )
    const edges: Edge<EditableRegulatoryEdge>[] = Array.from(
        { length: 1500 },
        (_, index) => ({
            id: `edge-${index}`,
            source: `node-${index % 1000}`,
            target: `node-${(index + 1) % 1000}`,
            data: {
                levels: [
                    {
                        id: `level-${index}`,
                        type: 'activation',
                        target: 1,
                        isValid: true,
                    },
                ],
                points: [{ x: 10, y: 20, active: true }],
            },
        })
    )

    return { nodes, edges }
}

describe('incremental graph validation', () => {
    it('does no semantic validation for position-only or selection-only changes', () => {
        const graph = makeSyntheticGraph()
        const initial = validateGraphIncrementally(graph.nodes, graph.edges, null)

        const movedNodes = graph.nodes.map((node, index) => ({
            ...node,
            position: { x: index * 3, y: index * 2 },
        }))
        const moved = validateGraphIncrementally(
            movedNodes,
            graph.edges,
            initial.snapshot
        )
        expect(moved.stats.ruleEvaluations).toBe(0)
        expect(moved.stats.edgeLevelEvaluations).toBe(0)

        const selectedNodes = graph.nodes.map((node, index) => ({
            ...node,
            selected: index === 42,
        }))
        const selected = validateGraphIncrementally(
            selectedNodes,
            graph.edges,
            initial.snapshot
        )
        expect(selected.stats.ruleEvaluations).toBe(0)
        expect(selected.stats.edgeLevelEvaluations).toBe(0)
    })

    it("validates only a changed node's incident edges and dependent rules", () => {
        const graph = makeSyntheticGraph()
        const initial = validateGraphIncrementally(graph.nodes, graph.edges, null)
        const changedNodes = graph.nodes.map((node) =>
            node.id === 'node-0'
                ? { ...node, data: { ...node.data, activityLevels: 2 } }
                : node
        )

        const changed = validateGraphIncrementally(
            changedNodes,
            graph.edges,
            initial.snapshot
        )

        expect(changed.stats.ruleEvaluations).toBe(2)
        expect(changed.stats.edgeLevelEvaluations).toBe(2)
        expect(changed.stats.ruleEvaluations).toBeLessThan(1000)
        expect(changed.stats.edgeLevelEvaluations).toBeLessThan(1500)
        expect(changed.stats.changedNodeIds).toEqual(['node-0'])
        expect(changed.stats.changedEdgeIds).toEqual([])
    })

    it('does not update state when all validity flags are already correct', () => {
        const graph = makeSyntheticGraph()
        const snapshot = createValidationSnapshot(graph.nodes, graph.edges)
        const result = validateGraphIncrementally(graph.nodes, graph.edges, snapshot)

        expect(result.nodesChanged).toBe(false)
        expect(result.edgesChanged).toBe(false)
    })

    it('revalidates the former target when an edge is deleted', () => {
        const graph = makeSyntheticGraph()
        const initial = validateGraphIncrementally(graph.nodes, graph.edges, null)
        const withoutEdge = graph.edges.filter((edge) => edge.id !== 'edge-0')

        const result = validateGraphIncrementally(
            graph.nodes,
            withoutEdge,
            initial.snapshot
        )

        expect(result.stats.ruleEvaluations).toBeGreaterThan(0)
        expect(result.stats.edgeLevelEvaluations).toBe(0)
    })

    it('revalidates dependents when a source node and its incident edge are deleted', () => {
        const graph = makeSyntheticGraph()
        const initial = validateGraphIncrementally(graph.nodes, graph.edges, null)
        const result = validateGraphIncrementally(
            graph.nodes.filter((node) => node.id !== 'node-0'),
            graph.edges.filter((edge) => edge.id !== 'edge-0'),
            initial.snapshot
        )

        expect(result.stats.ruleEvaluations).toBeGreaterThan(0)
    })
})
