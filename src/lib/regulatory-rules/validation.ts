import {
    InteractionType,
    type EditableRegulatoryEdge,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Edge, Node } from '@xyflow/react'
import { regulatoryRuleGrammar } from './grammar'
import { getExpressionReferences, getExpressionVars } from './semantics'

interface IncomingEdgeConstraint {
    positiveMaxThreshold?: number
    negativeMaxThreshold?: number
    positiveThresholds?: Set<number>
    negativeThresholds?: Set<number>
}

function buildIncomingEdgeConstraints(
    incomingNodes: Node<RegulatoryNodeProperties>[],
    incomingEdges: Edge<EditableRegulatoryEdge>[]
) {
    const nodeAliasesById = new Map(
        incomingNodes.map((node) => [
            node.id,
            Array.from(new Set([node.id, node.data.name])),
        ])
    )
    const constraints = new Map<string, IncomingEdgeConstraint>()

    incomingEdges.forEach((edge) => {
        const sourceAliases = nodeAliasesById.get(edge.source)

        if (!sourceAliases || sourceAliases.length === 0) {
            return
        }

        const currentConstraint =
            constraints.get(sourceAliases[0] ?? edge.source) ?? {}

        edge.data?.levels.forEach((level) => {
            if (level.type === InteractionType.Activation) {
                currentConstraint.positiveMaxThreshold = Math.max(
                    currentConstraint.positiveMaxThreshold ?? 0,
                    level.target
                )
                ;(currentConstraint.positiveThresholds ??= new Set()).add(
                    level.target
                )
                return
            }

            currentConstraint.negativeMaxThreshold = Math.max(
                currentConstraint.negativeMaxThreshold ?? 0,
                level.target
            )
            ;(currentConstraint.negativeThresholds ??= new Set()).add(level.target)
        })

        sourceAliases.forEach((alias) => {
            constraints.set(alias, currentConstraint)
        })
    })

    return constraints
}

export function validateRegulatoryRuleExpression(
    expression: string,
    incomingNodes: Node<RegulatoryNodeProperties>[],
    incomingEdges: Edge<EditableRegulatoryEdge>[] = []
) {
    const trimmedExpression = expression.trim()

    if (trimmedExpression.length === 0) {
        return null
    }

    const matchResult = regulatoryRuleGrammar.match(
        trimmedExpression,
        'RuleExpr'
    )

    if (matchResult.failed()) {
        return matchResult.message
    }

    const expressionVars = getExpressionVars(matchResult)
    const expressionReferences = getExpressionReferences(matchResult)
    const incomingNodeActivityLevels = new Map<string, number>()
    incomingNodes.forEach((node) => {
        incomingNodeActivityLevels.set(node.id, node.data.activityLevels)
        incomingNodeActivityLevels.set(node.data.name, node.data.activityLevels)
    })
    const incomingEdgeConstraints = buildIncomingEdgeConstraints(
        incomingNodes,
        incomingEdges
    )
    const allowedNodes = new Set(incomingNodeActivityLevels.keys())
    const referencedVariables = Array.from(
        new Set(expressionVars.map((expressionVar) => expressionVar.name))
    )
    const unknownVariables = referencedVariables.filter(
        (variable) => !allowedNodes.has(variable)
    )

    if (unknownVariables.length > 0) {
        return unknownVariables.length === 1
            ? `Unknown incoming node: ${unknownVariables[0]}`
            : `Unknown incoming nodes: ${unknownVariables.join(', ')}`
    }

    const outOfRangeAssignments = expressionVars.filter(({ name, value }) => {
        if (value === undefined) {
            return false
        }

        const activityLevels = incomingNodeActivityLevels.get(name)

        return activityLevels !== undefined && value > activityLevels
    })

    if (outOfRangeAssignments.length > 0) {
        return outOfRangeAssignments.length === 1
            ? `Assigned value ${outOfRangeAssignments[0].value} must be lower than or equal to the activity levels for incoming node ${outOfRangeAssignments[0].name}`
            : `Assigned values exceed activity levels for incoming nodes: ${outOfRangeAssignments
                  .map(({ name }) => name)
                  .join(', ')}`
    }

    const edgeCoherenceError = expressionReferences.find(
        ({ name, value, negated }) => {
            const constraint = incomingEdgeConstraints.get(name)
            const activityLevels = incomingNodeActivityLevels.get(name) ?? 1

            if (!constraint) {
                return false
            }

            const maxThreshold = negated
                ? constraint.negativeMaxThreshold
                : constraint.positiveMaxThreshold

            if (maxThreshold === undefined) {
                return true
            }

            if (value === undefined) {
                const thresholds = negated
                    ? constraint.negativeThresholds
                    : constraint.positiveThresholds

                if ((thresholds?.size ?? 0) === 1) {
                    return false
                }

                return activityLevels > 1
            }

            return value > maxThreshold
        }
    )

    if (edgeCoherenceError) {
        const constraint = incomingEdgeConstraints.get(edgeCoherenceError.name)
        const maxThreshold = edgeCoherenceError.negated
            ? constraint?.negativeMaxThreshold
            : constraint?.positiveMaxThreshold
        const expectedInteractionLabel =
            edgeCoherenceError.negated === true ? 'positive' : 'negative'

        if (maxThreshold === undefined) {
            return `${edgeCoherenceError.name} must appear as a ${expectedInteractionLabel} interaction in the rule`
        }

        if (edgeCoherenceError.value === undefined) {
            const interactionLabel = edgeCoherenceError.negated
                ? 'negative'
                : 'positive'

            return `${edgeCoherenceError.name} must reference an existing ${interactionLabel} edge threshold`
        }

        const interactionLabel = edgeCoherenceError.negated
            ? 'negative'
            : 'positive'

        return `${edgeCoherenceError.name}:${edgeCoherenceError.value} exceeds the ${interactionLabel} edge threshold ${maxThreshold}`
    }

    return null
}

export function isRegulatoryRuleExpressionValid(
    expression: string,
    incomingNodes: Node<RegulatoryNodeProperties>[],
    incomingEdges: Edge<EditableRegulatoryEdge>[] = []
) {
    return (
        validateRegulatoryRuleExpression(
            expression,
            incomingNodes,
            incomingEdges
        ) === null
    )
}
