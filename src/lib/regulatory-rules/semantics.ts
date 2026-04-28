import type * as ohm from 'ohm-js'
import { regulatoryRuleGrammar } from './grammar'

export interface ExpressionVar {
    name: string
    value?: number
}

type ExpressionVarNode = ohm.Node & {
    expressionVars(): ExpressionVar[]
}

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

export function getExpressionVars(matchResult: ohm.MatchResult) {
    return (
        regulatoryRuleSemantics(matchResult) as {
            expressionVars(): ExpressionVar[]
        }
    ).expressionVars()
}
