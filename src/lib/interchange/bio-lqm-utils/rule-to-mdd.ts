import type { InternalGRNModel } from '@/lib/schema'
import { regulatoryRuleGrammar } from '@/lib/regulatory-rules/grammar'
import {
    type MDDManager,
    type MDDVariable,
    MDDBaseOperators,
} from 'mddlib-ts'
import { NodeInfo } from 'biolqm-io-ts'

export function compileRuleExpressionToMdd(
    expression: string,
    manager: MDDManager,
    nodeByName: Map<string, InternalGRNModel['nodes'][number]>,
    nodesById: Map<string, NodeInfo>
): number {
    const matchResult = regulatoryRuleGrammar.match(expression.trim(), 'RuleExpr')
    if (matchResult.failed()) {
        throw new Error(matchResult.message)
    }

    const semantics = regulatoryRuleGrammar.createSemantics().addOperation<number>(
        'toMdd',
        {
            RuleExpr(expr, _end) {
                return expr.toMdd()
            },
            OrExpr_binary(left, _operator, right) {
                return MDDBaseOperators.OR.combine(
                    manager,
                    left.toMdd(),
                    right.toMdd()
                )
            },
            AndExpr_binary(left, _operator, right) {
                return MDDBaseOperators.AND.combine(
                    manager,
                    left.toMdd(),
                    right.toMdd()
                )
            },
            UnaryExpr(nots, primary) {
                let result = primary.toMdd()
                if (nots.children.length % 2 === 1) {
                    result = manager.not(result)
                }
                return result
            },
            Primary_paren(_open, expr, _close) {
                return expr.toMdd()
            },
            Condition(variable, _colon, value) {
                return buildConditionNode(
                    variable.sourceString,
                    Number(value.sourceString)
                )
            },
            Var(ident) {
                return buildConditionNode(ident.sourceString, 1)
            },
            Val(value) {
                return Number(value.sourceString) === 0 ? 0 : 1
            },
        }
    )

    return (semantics(matchResult) as { toMdd(): number }).toMdd()

    function buildConditionNode(name: string, threshold: number): number {
        const sourceNode = nodeByName.get(name)
        if (sourceNode == null) {
            throw new Error(`Unknown node "${name}" in regulatory rule.`)
        }

        const nodeInfo = nodesById.get(sourceNode.id)
        if (nodeInfo == null) {
            throw new Error(`Missing node info for "${sourceNode.id}".`)
        }

        const variable = manager.getVariableForKey(nodeInfo)
        if (variable == null) {
            throw new Error(
                `Missing MDD variable for node "${nodeInfo.getNodeID()}".`
            )
        }

        return createThresholdNode(variable, threshold)
    }
}

export function createThresholdNode(
    variable: MDDVariable,
    threshold: number
): number {
    if (variable.nbval === 2) {
        if (threshold <= 0) {
            return 1
        }
        if (threshold > 1) {
            return 0
        }
        return variable.getNode(0, 1)
    }

    if (threshold <= 0) {
        return 1
    }

    if (threshold >= variable.nbval) {
        return 0
    }

    return variable.getSimpleNode(0, 1, threshold, variable.nbval - 1)
}
