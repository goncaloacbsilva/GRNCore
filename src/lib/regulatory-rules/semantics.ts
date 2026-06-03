import type * as ohm from 'ohm-js'
import { regulatoryRuleGrammar } from './grammar'

export interface ExpressionVar {
    name: string
    value?: number
}

export interface ExpressionReference extends ExpressionVar {
    negated: boolean
}

type ExpressionVarNode = ohm.Node & {
    expressionVars(): ExpressionVar[]
}

type ExpressionReferenceNode = ohm.Node & {
    expressionReferences(negated: boolean): ExpressionReference[]
}

const getNegatedArgument = (context: { args: { negated: boolean } }) =>
    context.args.negated

const regulatoryRuleSemantics = regulatoryRuleGrammar
    .createSemantics()
    .addOperation<ExpressionVar[]>('expressionVars', {
        Condition(variable, _colon, value) {
            return [
                {
                    name: variable.sourceString,
                    value: Number(value.sourceString),
                },
            ]
        },
        Var(ident) {
            return [{ name: ident.sourceString }]
        },
        _iter(...children: ohm.Node[]) {
            return children.flatMap((child) =>
                (child as ExpressionVarNode).expressionVars()
            )
        },
        _nonterminal(...children: ohm.Node[]) {
            return children.flatMap((child) =>
                (child as ExpressionVarNode).expressionVars()
            )
        },
        _terminal() {
            return []
        },
    })
    .addOperation<ExpressionReference[]>('expressionReferences(negated)', {
        RuleExpr(expr, end) {
            void end
            return (expr as ExpressionReferenceNode).expressionReferences(false)
        },
        OrExpr_binary(left, _operator, right) {
            const negated = getNegatedArgument(
                this as unknown as { args: { negated: boolean } }
            )

            return [
                ...(left as ExpressionReferenceNode).expressionReferences(
                    negated
                ),
                ...(right as ExpressionReferenceNode).expressionReferences(
                    negated
                ),
            ]
        },
        AndExpr_binary(left, _operator, right) {
            const negated = getNegatedArgument(
                this as unknown as { args: { negated: boolean } }
            )

            return [
                ...(left as ExpressionReferenceNode).expressionReferences(
                    negated
                ),
                ...(right as ExpressionReferenceNode).expressionReferences(
                    negated
                ),
            ]
        },
        UnaryExpr(nots, primary) {
            const negated = getNegatedArgument(
                this as unknown as { args: { negated: boolean } }
            )
            const isNegated = negated !== (nots.children.length % 2 === 1)

            return (primary as ExpressionReferenceNode).expressionReferences(
                isNegated
            )
        },
        Primary_paren(_open, expr, close) {
            void close
            const negated = getNegatedArgument(
                this as unknown as { args: { negated: boolean } }
            )

            return (expr as ExpressionReferenceNode).expressionReferences(
                negated
            )
        },
        Condition(variable, _colon, value) {
            const negated = getNegatedArgument(
                this as unknown as { args: { negated: boolean } }
            )

            return [
                {
                    name: variable.sourceString,
                    value: Number(value.sourceString),
                    negated,
                },
            ]
        },
        Var(ident) {
            const negated = getNegatedArgument(
                this as unknown as { args: { negated: boolean } }
            )

            return [
                {
                    name: ident.sourceString,
                    negated,
                },
            ]
        },
        _iter(...children: ohm.Node[]) {
            const negated = getNegatedArgument(
                this as unknown as { args: { negated: boolean } }
            )

            return children.flatMap((child) =>
                (child as ExpressionReferenceNode).expressionReferences(negated)
            )
        },
        _nonterminal(...children: ohm.Node[]) {
            const negated = getNegatedArgument(
                this as unknown as { args: { negated: boolean } }
            )

            return children.flatMap((child) =>
                (child as ExpressionReferenceNode).expressionReferences(negated)
            )
        },
        _terminal() {
            return []
        },
    })

export function getExpressionVars(matchResult: ohm.MatchResult) {
    return (
        regulatoryRuleSemantics(matchResult) as {
            expressionVars(): ExpressionVar[]
        }
    ).expressionVars()
}

export function getExpressionReferences(matchResult: ohm.MatchResult) {
    return (
        regulatoryRuleSemantics(matchResult) as {
            expressionReferences(negated: boolean): ExpressionReference[]
        }
    ).expressionReferences(false)
}
