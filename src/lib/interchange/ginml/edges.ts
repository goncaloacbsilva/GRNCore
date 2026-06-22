import {
    type EditableRegulatoryEdge,
    type RegulatoryNodeProperties,
    InteractionType,
} from '@/lib/schema'
import type { Edge, Node } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { parseGinmlAnnotations } from './annotations'
import {
    asRecord,
    getAttribute,
    getNumberAttribute,
    type XmlRecord,
} from './xml'

export function createEdgesFromGinml(
    graphRecord: XmlRecord,
    nodesById: Map<string, Node<RegulatoryNodeProperties>>
) {
    const edgeRecords = toArray(graphRecord.edge)
    const edges: Edge<EditableRegulatoryEdge>[] = edgeRecords.map((edgeEntry) => {
        const edgeRecord = asRecord(edgeEntry) ?? {}
        const sourceId = getAttribute(edgeRecord, 'from')
        const targetId = getAttribute(edgeRecord, 'to')
        const edgeId =
            getAttribute(edgeRecord, 'id') ??
            `${sourceId ?? 'unknown'}:${targetId ?? 'unknown'}`

        if (!sourceId || !targetId) {
            throw new Error('GINML edge is missing its source or target.')
        }

        if (!nodesById.has(sourceId) || !nodesById.has(targetId)) {
            throw new Error(`GINML edge "${edgeId}" references an unknown node.`)
        }

        const levels = parseEdgeLevels(edgeRecord, edgeId)

        return {
            id: edgeId,
            source: sourceId,
            target: targetId,
            data: {
                levels: levels.map((level) => ({
                    ...level,
                    isValid: isLevelWithinRange(level.target, nodesById.get(sourceId)),
                })),
                annotations: parseGinmlAnnotations(edgeRecord.annotation),
            },
        }
    })

    return edges
}

function parseEdgeLevels(edgeRecord: XmlRecord, edgeId: string) {
    const effects = getAttribute(edgeRecord, 'effects')

    if (effects) {
        return effects
            .split(/\s+/)
            .map((token) => token.trim())
            .filter((token) => token.length > 0)
            .map((token) => {
                const [thresholdToken, signToken] = token.split(':')
                const threshold = Number(thresholdToken)

                if (!Number.isInteger(threshold)) {
                    throw new Error(
                        `GINML edge "${edgeId}" contains an invalid effects threshold.`
                    )
                }

                return {
                    id: nanoid(),
                    target: threshold,
                    type: parseInteractionType(signToken, edgeId),
                }
            })
    }

    const threshold = getNumberAttribute(edgeRecord, 'minvalue')
    const sign = getAttribute(edgeRecord, 'sign')

    if (threshold === undefined || !sign) {
        throw new Error(
            `GINML edge "${edgeId}" must define either effects or minvalue/sign.`
        )
    }

    return [
        {
            id: nanoid(),
            target: threshold,
            type: parseInteractionType(sign, edgeId),
        },
    ]
}

function parseInteractionType(value: string, edgeId: string) {
    if (value === 'positive') {
        return InteractionType.Activation
    }

    if (value === 'negative') {
        return InteractionType.Inhibition
    }

    throw new Error(`GINML edge "${edgeId}" contains an unsupported sign.`)
}

function isLevelWithinRange(
    threshold: number,
    sourceNode: Node<RegulatoryNodeProperties> | undefined
): boolean {
    return threshold <= (sourceNode?.data.activityLevels ?? 0)
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
    if (value === undefined || value === null) {
        return []
    }

    return Array.isArray(value) ? value : [value]
}
