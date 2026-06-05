import type { InternalGRNModel } from '@/lib/schema'
import {
    DEFAULT_NODE_HEIGHT,
    DEFAULT_NODE_TYPE,
    NODE_PLACEMENT_OFFSET,
} from '@/components/views/editor/graph/config'
import {
    findNextNodePosition,
    getNodeContentMinWidth,
} from '@/components/views/editor/graph/utils'
import { Interchanger } from './base'
import { regulatoryRuleGrammar } from '@/lib/regulatory-rules/grammar'
import { getExpressionReferences } from '@/lib/regulatory-rules/semantics'
import { nanoid } from 'nanoid'
import { v4 } from 'uuid'
import type {
    EditableRegulatoryEdge,
    InteractionType,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Edge, Node } from '@xyflow/react'

const bnetHeader = (modelName: string) => [
    `# ${modelName}`,
    '# Exported from GRN Core',
    '# the header targets, factors is mandatory to be importable in the R package BoolNet',
    '',
    'targets, factors',
]

const normalizeExpression = (expression: string) =>
    expression.trim().replaceAll('&&', '&').replaceAll('||', '|')

const denormalizeExpression = (expression: string) =>
    expression.trim().replaceAll('&', '&&').replaceAll('|', '||')

const wrapExpression = (expression: string) =>
    expression.includes('&') || expression.includes('|')
        ? `(${expression})`
        : expression

const DEFAULT_IMPORTED_MODEL_TITLE = 'Imported model'
const HEADER_LINE = 'targets, factors'
const IGNORED_TITLE_COMMENTS = new Set([
    'model in BoolNet format',
    'Exported from GRN Core',
])

interface ParsedBNetRow {
    target: string
    factor: string
}

const parseBNetContent = (content: string) => {
    const comments: string[] = []
    const rows: ParsedBNetRow[] = []

    for (const rawLine of content.split(/\r?\n/u)) {
        const line = rawLine.trim()
        if (line.length === 0) {
            continue
        }

        if (line.startsWith('#')) {
            comments.push(line.slice(1).trim())
            continue
        }

        if (line.toLowerCase() === HEADER_LINE) {
            continue
        }

        const separatorIndex = line.indexOf(',')
        if (separatorIndex === -1) {
            throw new Error(`Invalid BoolNet row: "${line}"`)
        }

        const target = line.slice(0, separatorIndex).trim()
        const factor = line.slice(separatorIndex + 1).trim()

        if (!target || !factor) {
            throw new Error(`Invalid BoolNet row: "${line}"`)
        }

        rows.push({ target, factor })
    }

    if (rows.length === 0) {
        throw new Error(
            'BoolNet import requires at least one target/factor row.'
        )
    }

    const title =
        comments.find(
            (comment) =>
                comment &&
                !IGNORED_TITLE_COMMENTS.has(comment) &&
                !comment.includes('header targets, factors')
        ) ?? DEFAULT_IMPORTED_MODEL_TITLE

    return {
        title,
        rows,
    }
}

const getEdgeTypeFromReference = ({
    negated,
    value,
}: {
    negated: boolean
    value?: number
}): InteractionType => {
    const isZeroCondition = value === 0
    return negated !== isZeroCondition ? 'inhibition' : 'activation'
}

export class BooleanNetworkInterchanger extends Interchanger {
    readonly mimeType = 'text/plain'

    _export(snapshot: InternalGRNModel): Promise<string> {
        const lines = [...bnetHeader(snapshot.title)]

        for (const node of snapshot.nodes) {
            const { name, activityLevels, isInputNode, rules } = node.data

            if (activityLevels !== 1) {
                return Promise.reject(
                    new Error(`BoolNet doesn't support multi-level models.`)
                )
            }

            const nonEmptyRules = rules.filter(
                (rule) => rule.expression.trim().length > 0
            )

            if (nonEmptyRules.some((rule) => rule.target !== 1)) {
                return Promise.reject(
                    new Error(`BoolNet doesn't support multi-level models.`)
                )
            }

            let factor = '0'

            if (nonEmptyRules.length > 0) {
                factor = nonEmptyRules
                    .map((rule) =>
                        wrapExpression(normalizeExpression(rule.expression))
                    )
                    .join(' | ')
            } else if (isInputNode) {
                factor = name
            }

            lines.push(`${name}, ${factor}`)
        }

        return Promise.resolve(lines.join('\n'))
    }

    import(content: string): Promise<InternalGRNModel> {
        const { title, rows } = parseBNetContent(content)
        const nodes: Node<RegulatoryNodeProperties>[] = []
        const edges: Edge<EditableRegulatoryEdge>[] = []
        const nodesByName = new Map<string, Node<RegulatoryNodeProperties>>()
        const edgesByEndpoints = new Map<string, Edge<EditableRegulatoryEdge>>()

        for (const { target, factor } of rows) {
            const width = getNodeContentMinWidth(target)
            const position = findNextNodePosition({
                basePosition: NODE_PLACEMENT_OFFSET,
                width,
                height: DEFAULT_NODE_HEIGHT,
                nodes,
                edges,
            })

            const trimmedFactor = factor.trim()
            const isInputNode = trimmedFactor === target
            const rules =
                trimmedFactor === '0' || isInputNode
                    ? []
                    : [
                          {
                              id: nanoid(),
                              target: 1,
                              expression: denormalizeExpression(trimmedFactor),
                              isValid: true,
                          },
                      ]

            const node: Node<RegulatoryNodeProperties> = {
                id: v4(),
                position,
                type: DEFAULT_NODE_TYPE,
                data: {
                    name: target,
                    activityLevels: 1,
                    isInputNode,
                    rules,
                },
                style: {
                    width,
                    height: DEFAULT_NODE_HEIGHT,
                },
            }

            nodes.push(node)
            nodesByName.set(target, node)
        }

        for (const { target, factor } of rows) {
            const trimmedFactor = factor.trim()
            if (trimmedFactor === '0') {
                continue
            }

            const targetNode = nodesByName.get(target)
            if (!targetNode) {
                throw new Error(
                    `Missing target node "${target}" during import.`
                )
            }

            const matchResult = regulatoryRuleGrammar.match(
                trimmedFactor,
                'RuleExpr'
            )
            if (matchResult.failed()) {
                throw new Error(matchResult.message)
            }

            const references = getExpressionReferences(matchResult)

            for (const reference of references) {
                const sourceNode = nodesByName.get(reference.name)
                if (!sourceNode) {
                    throw new Error(
                        `Unknown source node "${reference.name}" in rule for "${target}".`
                    )
                }

                if (
                    sourceNode.id === targetNode.id &&
                    trimmedFactor === target
                ) {
                    continue
                }

                const edgeKey = `${sourceNode.id}:${targetNode.id}`
                let edge = edgesByEndpoints.get(edgeKey)
                if (!edge) {
                    edge = {
                        id: v4(),
                        source: sourceNode.id,
                        target: targetNode.id,
                        type: 'RegulatoryEdge',
                        data: {
                            levels: [],
                        },
                    }
                    edges.push(edge)
                    edgesByEndpoints.set(edgeKey, edge)
                }

                const edgeType = getEdgeTypeFromReference(reference)
                const hasLevel = edge.data?.levels.some(
                    (level) => level.type === edgeType && level.target === 1
                )

                if (!hasLevel) {
                    edge.data?.levels.push({
                        id: nanoid(),
                        type: edgeType,
                        target: 1,
                        isValid: true,
                    })
                }
            }
        }

        return Promise.resolve({
            title,
            nodes,
            edges,
        })
    }
}
