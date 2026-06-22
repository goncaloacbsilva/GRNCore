import type { InternalGRNModel } from '@/lib/schema'
import { describe, expect, it } from 'vitest'
import { SAMPLE_BNET } from './__fixtures__/sample-bnet'
import { exportBNetModel, importBNetModel } from './format'
import { BooleanNetworkInterchanger } from './bnet'

function toArrayBuffer(value: string): ArrayBuffer {
    return new TextEncoder().encode(value).buffer
}

function summarizeModel(model: InternalGRNModel) {
    return {
        nodes: [...model.nodes]
            .sort((left, right) => left.id.localeCompare(right.id))
            .map((node) => ({
                id: node.id,
                name: node.data.name,
                activityLevels: node.data.activityLevels,
                isInputNode: node.data.isInputNode,
                rules: node.data.rules.map((rule) => ({
                    target: rule.target,
                    expression: rule.expression,
                    isValid: rule.isValid,
                })),
            })),
        edges: [...model.edges]
            .sort((left, right) => left.id.localeCompare(right.id))
            .map((edge) => ({
                source: edge.source,
                target: edge.target,
                levels: [...(edge.data?.levels ?? [])]
                    .sort((left, right) => left.type.localeCompare(right.type))
                    .map((level) => ({
                        type: level.type,
                        target: level.target,
                    })),
            })),
    }
}

describe('BooleanNetworkInterchanger', () => {
    it('imports nodes and expressions from BNet text', async () => {
        const interchanger = new BooleanNetworkInterchanger()
        const model = await interchanger.import(toArrayBuffer(SAMPLE_BNET))

        expect(model.nodes).toHaveLength(7)
        expect(model.edges).not.toHaveLength(0)

        const gal80 = model.nodes.find((node) => node.id === 'Gal80')

        expect(gal80?.data.rules[0]?.expression).toBe('!gal')
        expect(
            model.nodes.every((node) => node.data.activityLevels === 1)
        ).toBe(true)
        expect(
            model.nodes.every((node) => node.data.annotations === undefined)
        ).toBe(true)
        expect(
            model.nodes.every(
                (node) =>
                    Number.isFinite(node.position.x) &&
                    Number.isFinite(node.position.y)
            )
        ).toBe(true)
    })

    it('synthesizes activation and inhibition edges from expressions', () => {
        const model = importBNetModel(SAMPLE_BNET)

        const ash1Edge = model.edges.find(
            (edge) => edge.source === 'gal' && edge.target === 'Ash1'
        )
        const gal80Edge = model.edges.find(
            (edge) => edge.source === 'gal' && edge.target === 'Gal80'
        )
        const mixedEdge = model.edges.find(
            (edge) => edge.source === 'gal' && edge.target === 'Mixed'
        )

        expect(ash1Edge?.data?.levels).toEqual([
            expect.objectContaining({
                type: 'activation',
                target: 1,
            }),
        ])
        expect(gal80Edge?.data?.levels).toEqual([
            expect.objectContaining({
                type: 'inhibition',
                target: 1,
            }),
        ])
        expect(mixedEdge?.data?.levels).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'activation',
                    target: 1,
                }),
                expect.objectContaining({
                    type: 'inhibition',
                    target: 1,
                }),
            ])
        )
    })

    it('exports canonical BNet text', () => {
        const text = exportBNetModel(importBNetModel(SAMPLE_BNET))

        expect(text).toContain('targets, factors')
        expect(text).toContain('Ash1, gal & Cbf1')
        expect(text).toContain('Gal80, !gal')
    })

    it('round-trips the supported subset', async () => {
        const interchanger = new BooleanNetworkInterchanger()
        const exported = await interchanger.export(importBNetModel(SAMPLE_BNET))
        const reimported = await interchanger.import(exported)

        expect(summarizeModel(reimported)).toEqual(
            summarizeModel(importBNetModel(SAMPLE_BNET))
        )
    })

    it('rejects malformed rows and duplicates', () => {
        expect(() => importBNetModel('targets, factors\nA')).toThrow(
            /Malformed BNet row/
        )
        expect(() => importBNetModel('targets, factors\nA, B\nA, !B')).toThrow(
            /Duplicate BNet target/
        )
    })

    it('ignores hash-prefixed comment lines', () => {
        const model = importBNetModel(`# Model 2
# Exported from GRN Core
# the header targets, factors is mandatory to be importable in the R package BoolNet

targets, factors
G3, G4
G4, (G4 & !G3)`)

        expect(model.nodes.map((node) => node.id).sort()).toEqual(['G3', 'G4'])
        expect(model.nodes.find((node) => node.id === 'G4')?.data.rules).toEqual([
            expect.objectContaining({
                target: 1,
                expression: '(G4 & !G3)',
            }),
        ])
    })

    it('keeps invalid expressions and missing references without generating edges', () => {
        const invalidSyntax = importBNetModel('targets, factors\nA, !')
        const missingReference = importBNetModel('targets, factors\nA, B')

        expect(invalidSyntax.nodes[0]?.data.rules[0]?.isValid).toBe(false)
        expect(missingReference.nodes[0]?.data.rules[0]?.isValid).toBe(false)
        expect(missingReference.edges).toHaveLength(0)
    })

    it('rejects unsupported export cases', () => {
        const multilevelModel = importBNetModel('targets, factors\nA, A')
        const multilevelNode = multilevelModel.nodes[0]
        if (!multilevelNode) {
            throw new Error('Expected imported BNet model to contain node A.')
        }
        multilevelNode.data.activityLevels = 2

        const wrongTargetModel = importBNetModel('targets, factors\nA, A')
        const wrongTargetNode = wrongTargetModel.nodes[0]
        const wrongTargetRule = wrongTargetNode?.data.rules[0]
        if (!wrongTargetNode || !wrongTargetRule) {
            throw new Error('Expected imported BNet model to contain rule A.')
        }
        wrongTargetRule.target = 2

        expect(() => exportBNetModel(multilevelModel)).toThrow(/multi-level/)
        expect(() => exportBNetModel(wrongTargetModel)).toThrow(
            /targeting level 1/
        )
    })
})
