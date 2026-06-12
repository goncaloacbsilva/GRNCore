import type { InternalGRNModel } from '@/lib/schema'
import { regulatoryRuleGrammar } from '@/lib/regulatory-rules/grammar'
import {
    type MDDManager,
    type MDDVariable,
    MDDBaseOperators,
} from 'mddlib-ts'
import type { NodeInfo } from 'biolqm-io-ts'

interface SemanticNode {
    toMdd(): number
}

interface SemanticNodeWithSource {
    sourceString: string
}

interface SemanticChildrenNode {
    children: unknown[]
}

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

    const evaluateNode = (node: SemanticNode): number => node.toMdd()

    const semantics = regulatoryRuleGrammar.createSemantics().addOperation<number>(
        'toMdd',
        {
            RuleExpr(expr: SemanticNode) {
                return evaluateNode(expr)
            },
            OrExpr_binary(left: SemanticNode, operator: unknown, right: SemanticNode) {
                void operator
                return MDDBaseOperators.OR.combine(
                    manager,
                    evaluateNode(left),
                    evaluateNode(right)
                )
            },
            AndExpr_binary(left: SemanticNode, operator: unknown, right: SemanticNode) {
                void operator
                return MDDBaseOperators.AND.combine(
                    manager,
                    evaluateNode(left),
                    evaluateNode(right)
                )
            },
            UnaryExpr(nots: SemanticChildrenNode, primary: SemanticNode) {
                let result = evaluateNode(primary)
                if (nots.children.length % 2 === 1) {
                    result = manager.not(result)
                }
                return result
            },
            Primary_paren(open: unknown, expr: SemanticNode, close: unknown) {
                void open
                void close
                return evaluateNode(expr)
            },
            Condition(
                variable: SemanticNodeWithSource,
                colon: unknown,
                value: SemanticNodeWithSource
            ) {
                void colon
                return buildConditionNode(
                    variable.sourceString,
                    Number(value.sourceString)
                )
            },
            Var(ident: SemanticNodeWithSource) {
                return buildConditionNode(ident.sourceString, 1)
            },
            Val(value: SemanticNodeWithSource) {
                return Number(value.sourceString) === 0 ? 0 : 1
            },
        }
    )

    return evaluateNode(semantics(matchResult) as SemanticNode)

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
