import { regulatoryRuleGrammar } from '@/lib/regulatory-rules/grammar'
import { getExpressionReferences } from '@/lib/regulatory-rules/semantics'
import { isRegulatoryRuleExpressionValid } from '@/lib/regulatory-rules/validation'
import {
    InteractionType,
    RegulatoryNodeNameSchema,
    type EditableRegulatoryEdge,
    type InternalGRNModel,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Edge, Node } from '@xyflow/react'
import { nanoid } from 'nanoid'

interface ParsedBNetRow {
    target: string
    expression: string
}

export function parseBNetModel(
    content: string
): Omit<InternalGRNModel, 'title'> {
    const rows = parseRows(content)
    const nodeMap = new Map<string, Node<RegulatoryNodeProperties>>()

    for (const row of rows) {
        if (nodeMap.has(row.target)) {
            throw new Error(`Duplicate BNet target "${row.target}".`)
        }

        const nameValidation = RegulatoryNodeNameSchema.safeParse(row.target)

        if (!nameValidation.success) {
            throw new Error(`Invalid BNet target "${row.target}".`)
        }

        nodeMap.set(row.target, {
            id: row.target,
            position: { x: 0, y: 0 },
            data: {
                name: row.target,
                activityLevels: 1,
                isInputNode: false,
                isValid: true,
                annotations: undefined,
                rules:
                    row.expression.length > 0
                        ? [
                              {
                                  id: nanoid(),
                                  target: 1,
                                  expression: row.expression,
                                  isValid: false,
                              },
                          ]
                        : [],
            },
        })
    }

    const nodes = Array.from(nodeMap.values())
    const edges = synthesizeEdges(nodes)
    const validatedNodes = validateNodes(nodes, edges)

    return {
        annotations: undefined,
        nodes: validatedNodes,
        edges,
    }
}

function parseRows(content: string): ParsedBNetRow[] {
    const lines = content
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

    if (lines.length === 0) {
        return []
    }

    const [firstLine, ...remainingLines] = lines
    const dataLines = isHeaderLine(firstLine) ? remainingLines : lines

    return dataLines.map(parseRow)
}

function isHeaderLine(line: string): boolean {
    const normalized = line
        .split(',')
        .map((value) => value.trim().toLowerCase())

    return (
        normalized.length === 2 &&
        normalized[0] === 'targets' &&
        normalized[1] === 'factors'
    )
}

function parseRow(line: string): ParsedBNetRow {
    const separatorIndex = line.indexOf(',')

    if (separatorIndex === -1) {
        throw new Error(`Malformed BNet row "${line}".`)
    }

    const target = line.slice(0, separatorIndex).trim()
    const expression = line.slice(separatorIndex + 1).trim()

    if (target.length === 0) {
        throw new Error(`Malformed BNet row "${line}".`)
    }

    return {
        target,
        expression,
    }
}

function synthesizeEdges(
    nodes: Node<RegulatoryNodeProperties>[]
): Edge<EditableRegulatoryEdge>[] {
    const nodeByName = new Map(nodes.map((node) => [node.data.name, node]))
    const edgesByKey = new Map<string, Edge<EditableRegulatoryEdge>>()

    for (const targetNode of nodes) {
        for (const rule of targetNode.data.rules) {
            const trimmedExpression = rule.expression.trim()

            if (trimmedExpression.length === 0) {
                continue
            }

            const matchResult = regulatoryRuleGrammar.match(
                trimmedExpression,
                'RuleExpr'
            )

            if (matchResult.failed()) {
                continue
            }

            const references = getExpressionReferences(matchResult)

            for (const reference of references) {
                const sourceNode = nodeByName.get(reference.name)

                if (!sourceNode) {
                    continue
                }

                const edgeKey = `${sourceNode.id}->${targetNode.id}`
                const interactionType = reference.negated
                    ? InteractionType.Inhibition
                    : InteractionType.Activation
                const existingEdge = edgesByKey.get(edgeKey)

                if (!existingEdge) {
                    edgesByKey.set(edgeKey, {
                        id: edgeKey,
                        source: sourceNode.id,
                        target: targetNode.id,
                        data: {
                            levels: [
                                {
                                    id: nanoid(),
                                    type: interactionType,
                                    target: 1,
                                    isValid: true,
                                },
                            ],
                            annotations: undefined,
                        },
                    })
                    continue
                }

                const hasLevel = existingEdge.data.levels.some(
                    (level) =>
                        level.type === interactionType && level.target === 1
                )

                if (!hasLevel) {
                    existingEdge.data.levels.push({
                        id: nanoid(),
                        type: interactionType,
                        target: 1,
                        isValid: true,
                    })
                }
            }
        }
    }

    return Array.from(edgesByKey.values())
}

function validateNodes(
    nodes: Node<RegulatoryNodeProperties>[],
    edges: Edge<EditableRegulatoryEdge>[]
): Node<RegulatoryNodeProperties>[] {
    return nodes.map((node) => {
        const incomingEdges = edges.filter((edge) => edge.target === node.id)
        const incomingNodes = incomingEdges
            .map((edge) =>
                nodes.find((candidate) => candidate.id === edge.source)
            )
            .filter((candidate): candidate is Node<RegulatoryNodeProperties> =>
                Boolean(candidate)
            )

        return {
            ...node,
            data: {
                ...node.data,
                rules: node.data.rules.map((rule) => ({
                    ...rule,
                    isValid: isRegulatoryRuleExpressionValid(
                        rule.expression,
                        incomingNodes,
                        incomingEdges
                    ),
                })),
            },
        }
    })
}
