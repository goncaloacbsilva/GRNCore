import {
    formatRuleIdentifier,
    parseRuleIdentifierToken,
} from '@/lib/regulatory-rules/identifiers'
import { isRegulatoryRuleExpressionValid } from '@/lib/regulatory-rules'
import {
    InteractionType,
    type EditableRegulatoryEdge,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Edge, Node } from '@xyflow/react'
import { nanoid } from 'nanoid'

interface RawExpressionRule {
    kind: 'expression'
    target: number
    expression: string
}

interface RawConstitutiveRule {
    kind: 'constitutive'
    target: number
}

interface RawInteractionRule {
    kind: 'active-interactions'
    target: number
    interactionIds: string[]
}

export type RawGinmlRule =
    | RawExpressionRule
    | RawConstitutiveRule
    | RawInteractionRule

export function normalizeGinmlExpressionSyntax(expression: string): string {
    return expression
        .replaceAll('&&', '\u0000GINML_AND\u0000')
        .replaceAll('||', '\u0000GINML_OR\u0000')
        .replaceAll('&', '&&')
        .replaceAll('|', '||')
        .replaceAll('\u0000GINML_AND\u0000', '&&')
        .replaceAll('\u0000GINML_OR\u0000', '||')
        .trim()
}

export function toGinmlExpressionSyntax(expression: string): string {
    return expression.replaceAll('&&', '&').replaceAll('||', '|').trim()
}

export function rewriteExpressionIdentifiers(
    expression: string,
    identifierMap: Map<string, string>
): string {
    return expression.replaceAll(
        /"(?:\\.|[^"])*"|[A-Za-z_][A-Za-z0-9_]*/g,
        (identifierToken) => {
            const identifier = parseRuleIdentifierToken(identifierToken)
            return identifierMap.get(identifier) ?? identifierToken
        }
    )
}

export function materializeGinmlRules({
    rawRules,
    targetNode,
    nodes,
    edges,
}: {
    rawRules: RawGinmlRule[]
    targetNode: Node<RegulatoryNodeProperties>
    nodes: Node<RegulatoryNodeProperties>[]
    edges: Edge<EditableRegulatoryEdge>[]
}) {
    const nodeById = new Map(nodes.map((node) => [node.id, node]))
    const formattedNameById = new Map(
        nodes.map((node) => [node.id, formatRuleIdentifier(node.data.name)])
    )
    const edgeByInteractionKey = buildInteractionEdgeLookup(edges)
    const rules = materializeRuleSet(
        rawRules,
        targetNode,
        nodeById,
        formattedNameById,
        edgeByInteractionKey
    )

    const incomingEdges = edges.filter((edge) => edge.target === targetNode.id)
    const incomingNodes = incomingEdges
        .map((edge) => nodeById.get(edge.source))
        .filter((node): node is Node<RegulatoryNodeProperties> => !!node)

    return rules.map((rule) => ({
        ...rule,
        isValid: isRegulatoryRuleExpressionValid(
            rule.expression,
            incomingNodes,
            incomingEdges
        ),
    }))
}

function materializeRuleSet(
    rawRules: RawGinmlRule[],
    targetNode: Node<RegulatoryNodeProperties>,
    nodeById: Map<string, Node<RegulatoryNodeProperties>>,
    formattedNameById: Map<string, string>,
    edgeByInteractionKey: Map<string, Edge<EditableRegulatoryEdge>>
) {
    const rules: {
        id: string
        target: number
        expression: string
        isValid: boolean
    }[] = []
    const activeInteractionExpressionsByTarget = new Map<number, string[]>()

    for (const rawRule of rawRules) {
        if (rawRule.kind === 'active-interactions') {
            const expression = materializeRuleExpression(
                rawRule,
                targetNode,
                nodeById,
                formattedNameById,
                edgeByInteractionKey
            )
            const expressions =
                activeInteractionExpressionsByTarget.get(rawRule.target) ?? []
            expressions.push(expression)
            activeInteractionExpressionsByTarget.set(
                rawRule.target,
                expressions
            )
            continue
        }

        rules.push({
            id: nanoid(),
            target: rawRule.target,
            expression: materializeRuleExpression(
                rawRule,
                targetNode,
                nodeById,
                formattedNameById,
                edgeByInteractionKey
            ),
            isValid: false,
        })
    }

    for (const [target, expressions] of activeInteractionExpressionsByTarget) {
        rules.push({
            id: nanoid(),
            target,
            expression: expressions
                .map((expression) =>
                    expression.includes('&&') ? `(${expression})` : expression
                )
                .join(' || '),
            isValid: false,
        })
    }

    return rules
}

export function collectRawRulesFromNode(nodeRecord: Record<string, unknown>) {
    const rawRules: RawGinmlRule[] = []

    const values = toArray(nodeRecord.value)
    for (const valueEntry of values) {
        const valueRecord = asRecord(valueEntry)
        const target = parseRequiredInteger(
            valueRecord?.['@_val'],
            'GINML value rule is missing its target level.'
        )

        for (const expEntry of toArray(valueRecord?.exp)) {
            const expRecord = asRecord(expEntry)
            const rawExpression = expRecord?.['@_str']
            const expression =
                typeof rawExpression === 'string' ? rawExpression.trim() : ''

            if (expression.length === 0) {
                continue
            }

            rawRules.push({
                kind: 'expression',
                target,
                expression,
            })
        }
    }

    const parameters = toArray(nodeRecord.parameter)
    for (const parameterEntry of parameters) {
        const parameterRecord = asRecord(parameterEntry)
        const target = parseRequiredInteger(
            parameterRecord?.['@_val'],
            'GINML parameter rule is missing its target level.'
        )
        const rawActiveInteractions =
            parameterRecord?.['@_idActiveInteractions']
        const activeInteractions =
            typeof rawActiveInteractions === 'string'
                ? rawActiveInteractions.trim()
                : ''

        if (activeInteractions.length > 0) {
            rawRules.push({
                kind: 'active-interactions',
                target,
                interactionIds: activeInteractions
                    .split(/\s+/)
                    .map((token) => token.trim())
                    .filter((token) => token.length > 0),
            })
            continue
        }

        rawRules.push({
            kind: 'constitutive',
            target,
        })
    }

    return rawRules
}

function materializeRuleExpression(
    rawRule: RawGinmlRule,
    targetNode: Node<RegulatoryNodeProperties>,
    nodeById: Map<string, Node<RegulatoryNodeProperties>>,
    formattedNameById: Map<string, string>,
    edgeByInteractionKey: Map<string, Edge<EditableRegulatoryEdge>>
): string {
    switch (rawRule.kind) {
        case 'expression':
            return rewriteExpressionIdentifiers(
                normalizeGinmlExpressionSyntax(rawRule.expression),
                formattedNameById
            )
        case 'constitutive':
            return String(rawRule.target)
        case 'active-interactions': {
            const parts = rawRule.interactionIds.map((interactionId) =>
                materializeInteractionReference(
                    interactionId,
                    targetNode,
                    nodeById,
                    formattedNameById,
                    edgeByInteractionKey
                )
            )

            return parts.join(' && ')
        }
    }
}

function materializeInteractionReference(
    interactionId: string,
    targetNode: Node<RegulatoryNodeProperties>,
    nodeById: Map<string, Node<RegulatoryNodeProperties>>,
    formattedNameById: Map<string, string>,
    edgeByInteractionKey: Map<string, Edge<EditableRegulatoryEdge>>
): string {
    const [sourceId, resolvedTargetId, thresholdToken] =
        interactionId.split(':')
    const threshold = Number(thresholdToken)

    if (
        !sourceId ||
        !resolvedTargetId ||
        !Number.isInteger(threshold) ||
        resolvedTargetId !== targetNode.id
    ) {
        throw new Error(
            `Unable to resolve GINML active interaction "${interactionId}".`
        )
    }

    const sourceNode = nodeById.get(sourceId)
    const edge = edgeByInteractionKey.get(
        `${sourceId}:${resolvedTargetId}:${threshold}`
    )

    if (!sourceNode || !edge) {
        throw new Error(
            `Unable to resolve GINML active interaction "${interactionId}".`
        )
    }

    const edgeData = edge.data

    if (!edgeData) {
        throw new Error(
            `Unable to resolve GINML active interaction "${interactionId}".`
        )
    }

    const level = edgeData.levels.find(
        (candidate) => candidate.target === threshold
    )

    if (!level) {
        throw new Error(
            `Unable to resolve GINML active interaction "${interactionId}".`
        )
    }

    const formattedName =
        formattedNameById.get(sourceNode.id) ??
        formatRuleIdentifier(sourceNode.data.name)

    if (level.type === InteractionType.Activation) {
        return `${formattedName}:${threshold}`
    }

    if (sourceNode.data.activityLevels === 1 && threshold === 1) {
        return `!${formattedName}`
    }

    return `!${formattedName}:${threshold}`
}

function buildInteractionEdgeLookup(
    edges: Edge<EditableRegulatoryEdge>[]
): Map<string, Edge<EditableRegulatoryEdge>> {
    const lookup = new Map<string, Edge<EditableRegulatoryEdge>>()

    for (const edge of edges) {
        const edgeData = edge.data
        if (!edgeData) {
            continue
        }

        for (const level of edgeData.levels) {
            lookup.set(`${edge.source}:${edge.target}:${level.target}`, edge)
        }
    }

    return lookup
}

function parseRequiredInteger(value: unknown, errorMessage: string): number {
    const parsedValue = Number(value)

    if (!Number.isInteger(parsedValue)) {
        throw new Error(errorMessage)
    }

    return parsedValue
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>
    }

    return undefined
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
    if (value === undefined || value === null) {
        return []
    }

    return Array.isArray(value) ? value : [value]
}
