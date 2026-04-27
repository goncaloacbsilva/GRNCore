import * as ohm from 'ohm-js'
import regulatoryRuleGrammarSource from './regulatory-rule.ohm?raw'

const regulatoryRuleGrammar = ohm.grammar(regulatoryRuleGrammarSource)
const regulatoryRuleSemantics = regulatoryRuleGrammar
    .createSemantics()
    .addOperation<string[]>('referencedVars', {
        RuleExpr(expression, _end) {
            return expression.referencedVars()
        },
        Expr(expression) {
            return expression.referencedVars()
        },
        OrExpr_binary(left, _operator, right) {
            return [...left.referencedVars(), ...right.referencedVars()]
        },
        OrExpr(andExpression) {
            return andExpression.referencedVars()
        },
        AndExpr_binary(left, _operator, right) {
            return [...left.referencedVars(), ...right.referencedVars()]
        },
        AndExpr(unaryExpression) {
            return unaryExpression.referencedVars()
        },
        UnaryExpr(_nots, primary) {
            return primary.referencedVars()
        },
        Primary_paren(_open, expression, _close) {
            return expression.referencedVars()
        },
        Primary_condition(condition) {
            return condition.referencedVars()
        },
        Primary_var(variable) {
            return variable.referencedVars()
        },
        Primary_val(_value) {
            return []
        },
        Condition(variable, _colon, _value) {
            return variable.referencedVars()
        },
        Var(_ident) {
            return [this.sourceString]
        },
        _iter(...children) {
            return children.flatMap((child) => child.referencedVars())
        },
        _terminal() {
            return []
        },
    })

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
    const referencedVariables = new Set(
        regulatoryRuleSemantics(matchResult).referencedVars() as string[]
    )
    const unknownVariables = Array.from(referencedVariables).filter(
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
