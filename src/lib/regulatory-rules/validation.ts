import type { RegulatoryNodeProperties } from '@/lib/schema'
import type { Node } from '@xyflow/react'
import { regulatoryRuleGrammar } from './grammar'
import { getExpressionVars } from './semantics'

export function validateRegulatoryRuleExpression(
    expression: string,
    incomingNodes: Node<RegulatoryNodeProperties>[]
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
    const incomingNodeActivityLevels = new Map(
        incomingNodes.map((node) => [node.data.name, node.data.activityLevels])
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

    return null
}

export function isRegulatoryRuleExpressionValid(
    expression: string,
    incomingNodes: Node<RegulatoryNodeProperties>[]
) {
    return validateRegulatoryRuleExpression(expression, incomingNodes) === null
}
