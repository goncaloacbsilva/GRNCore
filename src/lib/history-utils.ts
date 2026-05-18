import type { InternalGRNModel } from '@/lib/schema'
import type { Difference } from 'microdiff'
import { toast } from 'sonner'

interface DisplayHistoryActionToastInput {
    changes: Difference[]
    snapshot?: InternalGRNModel
}

type PathSegment = string | number
type PathMatcher = PathSegment | ((segment: PathSegment) => boolean)

interface MutationSummary {
    addedNodes: number
    removedNodes: number
    addedEdges: number
    removedEdges: number
    addedEdgePaths: string[]
    removedEdgePaths: string[]
    renamedNodes: string[]
    inputNodeChanges: string[]
    nodeStyleChanges: string[]
    activityLevelChanges: string[]
    addedNodeExpressions: string[]
    changedNodeExpressions: string[]
    changedNodeExpressionTargets: string[]
    removedNodeExpressions: string[]
    addedEdgeRules: string[]
    changedEdgeRules: string[]
    removedEdgeRules: string[]
    uncategorizedChanges: number
}

interface HistoryChangeRule {
    applies: (change: Difference) => boolean
    apply: (
        summary: MutationSummary,
        change: Difference,
        snapshot?: InternalGRNModel
    ) => void
}

const createSummary = (): MutationSummary => ({
    addedNodes: 0,
    removedNodes: 0,
    addedEdges: 0,
    removedEdges: 0,
    addedEdgePaths: [],
    removedEdgePaths: [],
    renamedNodes: [],
    inputNodeChanges: [],
    nodeStyleChanges: [],
    activityLevelChanges: [],
    addedNodeExpressions: [],
    changedNodeExpressions: [],
    changedNodeExpressionTargets: [],
    removedNodeExpressions: [],
    addedEdgeRules: [],
    changedEdgeRules: [],
    removedEdgeRules: [],
    uncategorizedChanges: 0,
})

const formatCountLabel = (verb: string, count: number, noun: string) =>
    `${verb} ${count} ${noun}${count === 1 ? '' : 's'}`

const isNumber = (value: PathSegment | undefined): value is number =>
    typeof value === 'number'

const isString = (value: unknown): value is string => typeof value === 'string'

const rulePathShape = (path: PathSegment[], ...shape: PathMatcher[]) =>
    path.length === shape.length &&
    path.every((segment, index) => {
        const expected = shape[index]
        if (typeof expected === 'function') {
            return expected(segment)
        }

        return expected === segment
    })

const startsWithPath = (path: PathSegment[], prefix: PathSegment[]) =>
    path.length >= prefix.length &&
    prefix.every((segment, index) => path[index] === segment)

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null

const getChangeValue = (change: Difference): unknown =>
    'value' in change ? (change.value as unknown) : undefined

const getChangeOldValue = (change: Difference): unknown =>
    'oldValue' in change ? (change.oldValue as unknown) : undefined

const getNodeNameById = (
    snapshot: InternalGRNModel | undefined,
    nodeId: string
): string => snapshot?.nodes.find((node) => node.id === nodeId)?.data.name ?? nodeId

const getNodeNameFromChange = (
    snapshot: InternalGRNModel | undefined,
    nodeIndex: number,
    fallbackChange?: Difference
): string => {
    const snapshotName = snapshot?.nodes[nodeIndex]?.data?.name
    if (snapshotName && snapshotName.trim().length > 0) {
        return snapshotName
    }

    const fallbackValue = fallbackChange
        ? (getChangeOldValue(fallbackChange) ?? getChangeValue(fallbackChange))
        : null

    if (isRecord(fallbackValue) && isRecord(fallbackValue.data)) {
        const fallbackName = fallbackValue.data.name
        if (typeof fallbackName === 'string' && fallbackName.trim().length > 0) {
            return fallbackName
        }
    }

    return 'Unknown node'
}

const getEdgeEndpoints = (
    value: unknown
): { source: string; target: string } | null => {
    if (!isRecord(value)) {
        return null
    }

    const { source, target } = value
    if (typeof source !== 'string' || typeof target !== 'string') {
        return null
    }

    return { source, target }
}

const getEdgePathByIndex = (
    snapshot: InternalGRNModel | undefined,
    edgeIndex: number,
    fallbackChange?: Difference
): string => {
    const edge = snapshot?.edges[edgeIndex]
    if (edge) {
        return `${getNodeNameById(snapshot, edge.source)}->${getNodeNameById(snapshot, edge.target)}`
    }

    const fallbackValue = fallbackChange
        ? (getChangeValue(fallbackChange) ?? getChangeOldValue(fallbackChange))
        : null
    const endpoints = getEdgeEndpoints(fallbackValue)

    if (endpoints) {
        return `${getNodeNameById(snapshot, endpoints.source)}->${getNodeNameById(snapshot, endpoints.target)}`
    }

    return 'Unknown edge'
}

const getExpressionFromObject = (value: unknown): string | null => {
    if (!isRecord(value)) {
        return null
    }

    return typeof value.expression === 'string' ? value.expression : null
}

const normalizeExpression = (expression: unknown): string => {
    if (typeof expression !== 'string') {
        return '(empty)'
    }

    const trimmed = expression.trim()
    return trimmed.length > 0 ? trimmed : '(empty)'
}

const getEdgeRuleLabel = (value: unknown): string => {
    if (!isRecord(value)) {
        return 'rule'
    }

    const type = value.type
    const target = value.target

    const typeLabel = typeof type === 'string' ? type : 'rule'
    const targetLabel = typeof target === 'number' ? `@${target}` : ''
    return `${typeLabel}${targetLabel}`
}

const pushUnique = (items: string[], value: string) => {
    if (!items.includes(value)) {
        items.push(value)
    }
}

const SEMANTIC_NODE_STYLE_KEYS = new Set<string>([
    'color',
    'backgroundColor',
    'borderColor',
    '--grn-node-background-color',
    '--grn-node-border-color',
])

const hasSemanticNodeStyleKeys = (value: unknown) => {
    if (!isRecord(value)) {
        return false
    }

    return Object.keys(value).some((key) => SEMANTIC_NODE_STYLE_KEYS.has(key))
}

const isSemanticNodeStyleChange = (change: Difference) => {
    const nodeIndex = change.path[1]
    if (!rulePathShape(change.path.slice(0, 2), 'nodes', isNumber) || !isNumber(nodeIndex)) {
        return false
    }

    if (!startsWithPath(change.path, ['nodes', nodeIndex, 'style'])) {
        return false
    }

    const styleKey = change.path[3]
    if (typeof styleKey === 'string') {
        return SEMANTIC_NODE_STYLE_KEYS.has(styleKey)
    }

    if (change.path.length === 3) {
        return (
            hasSemanticNodeStyleKeys(getChangeValue(change)) ||
            hasSemanticNodeStyleKeys(getChangeOldValue(change))
        )
    }

    return false
}

const HISTORY_CHANGE_RULES: HistoryChangeRule[] = [
    {
        applies: (change) =>
            change.type === 'CREATE' &&
            rulePathShape(change.path, 'nodes', isNumber),
        apply: (summary) => {
            summary.addedNodes += 1
        },
    },
    {
        applies: (change) =>
            change.type === 'REMOVE' &&
            rulePathShape(change.path, 'nodes', isNumber),
        apply: (summary) => {
            summary.removedNodes += 1
        },
    },
    {
        applies: (change) =>
            change.type === 'CREATE' &&
            rulePathShape(change.path, 'edges', isNumber),
        apply: (summary, change, snapshot) => {
            const edgeIndex = change.path[1]
            if (!isNumber(edgeIndex)) {
                return
            }

            summary.addedEdges += 1
            pushUnique(
                summary.addedEdgePaths,
                getEdgePathByIndex(snapshot, edgeIndex, change)
            )
        },
    },
    {
        applies: (change) =>
            change.type === 'REMOVE' &&
            rulePathShape(change.path, 'edges', isNumber),
        apply: (summary, change, snapshot) => {
            const edgeIndex = change.path[1]
            if (!isNumber(edgeIndex)) {
                return
            }

            summary.removedEdges += 1
            pushUnique(
                summary.removedEdgePaths,
                getEdgePathByIndex(snapshot, edgeIndex, change)
            )
        },
    },
    {
        applies: (change) =>
            change.type === 'CHANGE' &&
            rulePathShape(change.path, 'nodes', isNumber, 'data', 'name'),
        apply: (summary, change, snapshot) => {
            const nodeIndex = change.path[1]
            const oldValue = getChangeOldValue(change)
            const newValue = getChangeValue(change)

            if (!isNumber(nodeIndex) || !isString(oldValue) || !isString(newValue)) {
                return
            }

            const resolvedOldName = oldValue.trim().length
                ? oldValue
                : getNodeNameFromChange(snapshot, nodeIndex, change)
            const resolvedNewName = newValue.trim().length ? newValue : '(empty)'
            pushUnique(
                summary.renamedNodes,
                `Renamed node ${resolvedOldName} to ${resolvedNewName}`
            )
        },
    },
    {
        applies: (change) =>
            change.type === 'CHANGE' &&
            rulePathShape(
                change.path,
                'nodes',
                isNumber,
                'data',
                'isInputNode'
            ),
        apply: (summary, change, snapshot) => {
            const nodeIndex = change.path[1]
            const value = getChangeValue(change)
            if (!isNumber(nodeIndex) || typeof value !== 'boolean') {
                return
            }

            const nodeName = getNodeNameFromChange(snapshot, nodeIndex, change)
            pushUnique(
                summary.inputNodeChanges,
                value
                    ? `Changed ${nodeName} to input node`
                    : `Changed ${nodeName} to non-input node`
            )
        },
    },
    {
        applies: (change) => {
            if (change.type !== 'CHANGE' && change.type !== 'CREATE' && change.type !== 'REMOVE') {
                return false
            }

            return isSemanticNodeStyleChange(change)
        },
        apply: (summary, change, snapshot) => {
            const nodeIndex = change.path[1]
            if (!isNumber(nodeIndex)) {
                return
            }

            const nodeName = getNodeNameFromChange(snapshot, nodeIndex, change)
            pushUnique(summary.nodeStyleChanges, `Updated style of ${nodeName}`)
        },
    },
    {
        applies: (change) =>
            change.type === 'CHANGE' &&
            rulePathShape(
                change.path,
                'nodes',
                isNumber,
                'data',
                'activityLevels'
            ),
        apply: (summary, change, snapshot) => {
            const nodeIndex = change.path[1]
            const value = getChangeValue(change)

            if (!isNumber(nodeIndex) || typeof value !== 'number') {
                return
            }

            const nodeName = getNodeNameFromChange(snapshot, nodeIndex, change)
            pushUnique(
                summary.activityLevelChanges,
                `Changed ${nodeName} activity level to ${value}`
            )
        },
    },
    {
        applies: (change) =>
            change.type === 'CREATE' &&
            rulePathShape(
                change.path,
                'nodes',
                isNumber,
                'data',
                'rules',
                isNumber
            ),
        apply: (summary, change, snapshot) => {
            const nodeIndex = change.path[1]
            const value = getChangeValue(change)

            if (!isNumber(nodeIndex) || !isRecord(value)) {
                return
            }

            const expression = normalizeExpression(getExpressionFromObject(value))
            const nodeName = getNodeNameFromChange(snapshot, nodeIndex)
            pushUnique(
                summary.addedNodeExpressions,
                `Added node expression ${nodeName}:${expression}`
            )
        },
    },
    {
        applies: (change) =>
            change.type === 'REMOVE' &&
            rulePathShape(
                change.path,
                'nodes',
                isNumber,
                'data',
                'rules',
                isNumber
            ),
        apply: (summary, change, snapshot) => {
            const nodeIndex = change.path[1]
            if (!isNumber(nodeIndex)) {
                return
            }

            const nodeName = getNodeNameFromChange(snapshot, nodeIndex, change)
            pushUnique(
                summary.removedNodeExpressions,
                `Removed expression from ${nodeName}`
            )
        },
    },
    {
        applies: (change) =>
            change.type === 'CHANGE' &&
            rulePathShape(
                change.path,
                'nodes',
                isNumber,
                'data',
                'rules',
                isNumber,
                'expression'
            ),
        apply: (summary, change, snapshot) => {
            const nodeIndex = change.path[1]
            const value = getChangeValue(change)

            if (!isNumber(nodeIndex) || typeof value !== 'string') {
                return
            }

            const nodeName = getNodeNameFromChange(snapshot, nodeIndex)
            pushUnique(
                summary.changedNodeExpressions,
                `Changed node expression of ${nodeName} to ${normalizeExpression(value)}`
            )
        },
    },
    {
        applies: (change) =>
            change.type === 'CHANGE' &&
            rulePathShape(
                change.path,
                'nodes',
                isNumber,
                'data',
                'rules',
                isNumber,
                'target'
            ),
        apply: (summary, change, snapshot) => {
            const nodeIndex = change.path[1]
            const value = getChangeValue(change)

            if (!isNumber(nodeIndex) || typeof value !== 'number') {
                return
            }

            const nodeName = getNodeNameFromChange(snapshot, nodeIndex)
            pushUnique(
                summary.changedNodeExpressionTargets,
                `Changed node expression target of ${nodeName} to ${value}`
            )
        },
    },
    {
        applies: (change) => {
            if (change.type !== 'CREATE') {
                return false
            }

            const edgeIndex = change.path[1]
            if (!isNumber(edgeIndex)) {
                return false
            }

            return rulePathShape(
                change.path,
                'edges',
                isNumber,
                'data',
                'levels',
                isNumber
            )
        },
        apply: (summary, change, snapshot) => {
            const edgeIndex = change.path[1]
            const value = getChangeValue(change)
            if (!isNumber(edgeIndex)) {
                return
            }

            const edgePath = getEdgePathByIndex(snapshot, edgeIndex, change)
            const ruleLabel = getEdgeRuleLabel(value)
            pushUnique(summary.addedEdgeRules, `Added edge rule ${edgePath}:${ruleLabel}`)
        },
    },
    {
        applies: (change) => {
            if (change.type !== 'REMOVE') {
                return false
            }

            const edgeIndex = change.path[1]
            if (!isNumber(edgeIndex)) {
                return false
            }

            return rulePathShape(
                change.path,
                'edges',
                isNumber,
                'data',
                'levels',
                isNumber
            )
        },
        apply: (summary, change, snapshot) => {
            const edgeIndex = change.path[1]
            const value = getChangeOldValue(change)
            if (!isNumber(edgeIndex)) {
                return
            }

            const edgePath = getEdgePathByIndex(snapshot, edgeIndex, change)
            const ruleLabel = getEdgeRuleLabel(value)
            pushUnique(
                summary.removedEdgeRules,
                `Removed edge rule ${edgePath}:${ruleLabel}`
            )
        },
    },
    {
        applies: (change) => {
            if (change.type !== 'CHANGE') {
                return false
            }

            const edgeIndex = change.path[1]
            if (!isNumber(edgeIndex)) {
                return false
            }

            return startsWithPath(change.path, [
                'edges',
                edgeIndex,
                'data',
                'levels',
            ])
        },
        apply: (summary, change, snapshot) => {
            const edgeIndex = change.path[1]
            if (!isNumber(edgeIndex)) {
                return
            }

            const edgePath = getEdgePathByIndex(snapshot, edgeIndex, change)
            const value = getChangeValue(change)
            const ruleLabel = getEdgeRuleLabel(value)
            pushUnique(
                summary.changedEdgeRules,
                `Changed edge rule ${edgePath}:${ruleLabel}`
            )
        },
    },
]

const summarizeChanges = (
    changes: Difference[],
    snapshot?: InternalGRNModel
): MutationSummary => {
    const summary = createSummary()

    changes.forEach((change) => {
        for (const rule of HISTORY_CHANGE_RULES) {
            if (rule.applies(change)) {
                rule.apply(summary, change, snapshot)
                return
            }
        }

        summary.uncategorizedChanges += 1
    })

    return summary
}

const composeToastMessage = (summary: MutationSummary): string | null => {
    const structureParts: string[] = []

    if (summary.addedNodes > 0) {
        structureParts.push(formatCountLabel('Added', summary.addedNodes, 'node'))
    }

    if (summary.removedNodes > 0) {
        structureParts.push(
            formatCountLabel('Removed', summary.removedNodes, 'node')
        )
    }

    if (summary.addedEdgePaths.length > 0) {
        structureParts.push(
            summary.addedEdgePaths.length === 1
                ? `Added edge ${summary.addedEdgePaths[0]}`
                : `Added edges ${summary.addedEdgePaths.join(', ')}`
        )
    } else if (summary.addedEdges > 0) {
        structureParts.push(formatCountLabel('Added', summary.addedEdges, 'edge'))
    }

    if (summary.removedEdgePaths.length > 0) {
        structureParts.push(
            summary.removedEdgePaths.length === 1
                ? `Removed edge ${summary.removedEdgePaths[0]}`
                : `Removed edges ${summary.removedEdgePaths.join(', ')}`
        )
    } else if (summary.removedEdges > 0) {
        structureParts.push(
            formatCountLabel('Removed', summary.removedEdges, 'edge')
        )
    }

    const specificMessage =
        summary.renamedNodes[0] ??
        summary.inputNodeChanges[0] ??
        summary.nodeStyleChanges[0] ??
        summary.activityLevelChanges[0] ??
        summary.changedNodeExpressions[0] ??
        summary.changedNodeExpressionTargets[0] ??
        summary.addedNodeExpressions[0] ??
        summary.removedNodeExpressions[0] ??
        summary.changedEdgeRules[0] ??
        summary.addedEdgeRules[0] ??
        summary.removedEdgeRules[0] ??
        (summary.uncategorizedChanges > 0 ? 'Updated model elements' : null)

    if (structureParts.length > 0) {
        const structureSummary = structureParts.join(', ')
        return specificMessage
            ? `${structureSummary}. ${specificMessage}`
            : structureSummary
    }

    return specificMessage
}

export function displayHistoryActionToast({
    changes,
    snapshot,
}: DisplayHistoryActionToastInput) {
    if (changes.length === 0) {
        return
    }

    const summary = summarizeChanges(changes, snapshot)
    const message = composeToastMessage(summary)

    if (!message) {
        return
    }

    toast.info(message, {
        position: 'top-right',
    })
}
