import * as ohm from 'ohm-js'
import regulatoryRuleGrammarSource from './regulatory-rule.ohm?raw'

const regulatoryRuleGrammar = ohm.grammar(regulatoryRuleGrammarSource)
const VARIABLE_PATTERN = /[A-Za-z_][A-Za-z0-9_]*/g

function getReferencedVariables(expression: string) {
    return Array.from(new Set(expression.match(VARIABLE_PATTERN) ?? []))
}

export function validateRegulatoryRuleExpression(
    expression: string,
    incomingNodes: string[]
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

    const allowedNodes = new Set(incomingNodes)
    const unknownVariables = getReferencedVariables(trimmedExpression).filter(
        (variable) => !allowedNodes.has(variable)
    )

    if (unknownVariables.length > 0) {
        return unknownVariables.length === 1
            ? `Unknown incoming node: ${unknownVariables[0]}`
            : `Unknown incoming nodes: ${unknownVariables.join(', ')}`
    }

    return null
}

export function isRegulatoryRuleExpressionValid(
    expression: string,
    incomingNodes: string[]
) {
    return validateRegulatoryRuleExpression(expression, incomingNodes) === null
}
