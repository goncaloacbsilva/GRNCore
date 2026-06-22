import { formatRuleIdentifier, parseRuleIdentifierToken } from '@/lib/regulatory-rules/identifiers'
import { regulatoryRuleGrammar } from '@/lib/regulatory-rules/grammar'
import { asRecord, ensureArray, getNodeText, type XmlRecord } from './xml'

type RuleAst =
    | {
          kind: 'var'
          name: string
          value?: number
      }
    | {
          kind: 'not'
          operand: RuleAst
      }
    | {
          kind: 'and' | 'or'
          operands: RuleAst[]
      }

export function parseMathMlToExpression(
    math: unknown,
    activityLevelsByName: Map<string, number>,
    nodeNameById: Map<string, string>
): string {
    const mathRecord = asRecord(math)
    const apply = asRecord(mathRecord?.apply)

    if (!apply) {
        throw new Error('SBML function term is missing a MathML apply node.')
    }

    const ast = parseApplyNode(apply, activityLevelsByName, nodeNameById)
    return renderRuleAst(ast)
}

export function buildExpressionMathMl(
    expression: string,
    activityLevelsByName: Map<string, number>,
    speciesIdByName: Map<string, string>
): XmlRecord {
    const match = regulatoryRuleGrammar.match(expression.trim(), 'RuleExpr')

    if (match.failed()) {
        throw new Error(`Invalid rule expression: ${expression}`)
    }

    const ast = buildAst(match)
    return {
        apply: buildApplyNode(ast, activityLevelsByName, speciesIdByName),
    }
}

function parseApplyNode(
    applyNode: XmlRecord,
    activityLevelsByName: Map<string, number>,
    nodeNameById: Map<string, string>
): RuleAst {
    if ('and' in applyNode) {
        return {
            kind: 'and',
            operands: extractApplyChildren(applyNode).map((child) =>
                parseExpressionNode(child, activityLevelsByName, nodeNameById)
            ),
        }
    }

    if ('or' in applyNode) {
        return {
            kind: 'or',
            operands: extractApplyChildren(applyNode).map((child) =>
                parseExpressionNode(child, activityLevelsByName, nodeNameById)
            ),
        }
    }

    if ('not' in applyNode) {
        const [operand] = extractApplyChildren(applyNode)

        if (!operand) {
            throw new Error('MathML not operator is missing an operand.')
        }

        return {
            kind: 'not',
            operand: parseExpressionNode(
                operand,
                activityLevelsByName,
                nodeNameById
            ),
        }
    }

    if ('eq' in applyNode || 'geq' in applyNode) {
        return parseComparisonNode(
            applyNode,
            activityLevelsByName,
            nodeNameById
        )
    }

    throw new Error('Unsupported MathML operator in SBML function term.')
}

function parseExpressionNode(
    value: unknown,
    activityLevelsByName: Map<string, number>,
    nodeNameById: Map<string, string>
): RuleAst {
    const record = asRecord(value)

    if (!record) {
        throw new Error('Unsupported MathML expression node.')
    }

    if (
        'and' in record ||
        'or' in record ||
        'not' in record ||
        'eq' in record ||
        'geq' in record
    ) {
        return parseApplyNode(record, activityLevelsByName, nodeNameById)
    }

    if ('apply' in record) {
        if (Array.isArray(record.apply)) {
            const [firstChild] = record.apply

            if (!firstChild) {
                throw new Error('MathML apply wrapper is empty.')
            }

            return parseExpressionNode(
                firstChild,
                activityLevelsByName,
                nodeNameById
            )
        }

        return parseApplyNode(
            asRecord(record.apply) ?? {},
            activityLevelsByName,
            nodeNameById
        )
    }

    if ('ci' in record) {
        const identifier = getNodeText(record.ci).trim()

        return {
            kind: 'var',
            name: nodeNameById.get(identifier) ?? identifier,
        }
    }

    throw new Error('Unsupported MathML expression node.')
}

function parseComparisonNode(
    applyNode: XmlRecord,
    activityLevelsByName: Map<string, number>,
    nodeNameById: Map<string, string>
): RuleAst {
    const ciValue = getFirstTagText(applyNode, 'ci')
    const cnValue = getFirstTagText(applyNode, 'cn')

    if (!ciValue || !cnValue) {
        throw new Error('Unsupported MathML comparison structure.')
    }

    const variableIdentifier = ciValue.trim()
    const variableName = nodeNameById.get(variableIdentifier) ?? variableIdentifier
    const numericValue = Number(cnValue.trim())

    if (!Number.isInteger(numericValue)) {
        throw new Error('Only integer MathML thresholds are supported.')
    }

    if ('geq' in applyNode) {
        return {
            kind: 'var',
            name: variableName,
            value: numericValue,
        }
    }

    const activityLevels = activityLevelsByName.get(variableName) ?? 1

    if (numericValue === 0) {
        return {
            kind: 'not',
            operand: {
                kind: 'var',
                name: variableName,
                ...(activityLevels > 1 ? { value: 1 } : {}),
            },
        }
    }

    return {
        kind: 'var',
        name: variableName,
        ...(activityLevels === 1 && numericValue === 1
            ? {}
            : { value: numericValue }),
    }
}

function renderRuleAst(ast: RuleAst, parentPrecedence = 0): string {
    switch (ast.kind) {
        case 'var':
            return ast.value === undefined
                ? formatRuleIdentifier(ast.name)
                : `${formatRuleIdentifier(ast.name)}:${ast.value}`
        case 'not': {
            const operand = renderRuleAst(ast.operand, 3)
            const value =
                ast.operand.kind === 'var' ? operand : `(${operand})`
            return `!${value}`
        }
        case 'and': {
            const value = ast.operands
                .map((operand) => renderRuleAst(operand, 2))
                .join(' && ')
            return parentPrecedence > 2 ? `(${value})` : value
        }
        case 'or': {
            const value = ast.operands
                .map((operand) => renderRuleAst(operand, 1))
                .join(' || ')
            return parentPrecedence > 1 ? `(${value})` : value
        }
    }
}

function buildApplyNode(
    ast: RuleAst,
    activityLevelsByName: Map<string, number>,
    speciesIdByName: Map<string, string>
): XmlRecord {
    switch (ast.kind) {
        case 'var': {
            const activityLevels = activityLevelsByName.get(ast.name) ?? 1
            const comparison = ast.value === undefined ? 1 : ast.value

            if (ast.value === undefined && activityLevels === 1) {
                return buildComparison(
                    'eq',
                    speciesIdByName.get(ast.name) ?? ast.name,
                    comparison
                )
            }

            return buildComparison(
                'geq',
                speciesIdByName.get(ast.name) ?? ast.name,
                comparison
            )
        }
        case 'not': {
            const operand = ast.operand

            if (
                operand.kind === 'var' &&
                operand.value === undefined &&
                (activityLevelsByName.get(operand.name) ?? 1) === 1
            ) {
                return buildComparison(
                    'eq',
                    speciesIdByName.get(operand.name) ?? operand.name,
                    0
                )
            }

            return {
                not: '',
                apply: buildApplyNode(
                    operand,
                    activityLevelsByName,
                    speciesIdByName
                ),
            }
        }
        case 'and':
        case 'or': {
            return {
                [ast.kind]: '',
                apply: ast.operands.map((operand) =>
                    buildApplyNode(
                        operand,
                        activityLevelsByName,
                        speciesIdByName
                    )
                ),
            }
        }
    }
}

function buildComparison(
    operator: 'eq' | 'geq',
    variableName: string,
    numericValue: number
): XmlRecord {
    return {
        [operator]: '',
        ci: { '#text': ` ${variableName} ` },
        cn: {
            '@_type': 'integer',
            '#text': ` ${numericValue} `,
        },
    }
}

function extractApplyChildren(applyNode: XmlRecord): unknown[] {
    const childEntries = Object.entries(applyNode).filter(
        ([key]) =>
            !key.startsWith('@_') &&
            key !== '#text' &&
            key !== 'and' &&
            key !== 'or' &&
            key !== 'not' &&
            key !== 'eq' &&
            key !== 'geq'
    )

    return childEntries.flatMap(([, value]) => ensureArray(value))
}

function getFirstTagText(record: XmlRecord, tagName: string): string | undefined {
    const values = ensureArray(record[tagName])
    const [firstValue] = values

    if (firstValue === undefined) {
        return undefined
    }

    return getNodeText(firstValue)
}

function buildAst(match: import('ohm-js').MatchResult): RuleAst {
    const semantics = regulatoryRuleGrammar
        .createSemantics()
        .addOperation<RuleAst>('toRuleAst', {
            RuleExpr(expr, _end) {
                return expr.toRuleAst()
            },
            Expr(expr) {
                return expr.toRuleAst()
            },
            OrExpr_binary(left, _operator, right) {
                return {
                    kind: 'or',
                    operands: [left.toRuleAst(), right.toRuleAst()],
                }
            },
            AndExpr_binary(left, _operator, right) {
                return {
                    kind: 'and',
                    operands: [left.toRuleAst(), right.toRuleAst()],
                }
            },
            UnaryExpr(nots, primary) {
                const base = primary.toRuleAst()

                return Array.from({ length: nots.children.length }).reduce(
                    (value) => ({
                        kind: 'not',
                        operand: value,
                    }),
                    base
                )
            },
            Primary_paren(_open, expr, _close) {
                return expr.toRuleAst()
            },
            Condition(variable, _colon, value) {
                return {
                    kind: 'var',
                    name: parseRuleIdentifierToken(variable.sourceString),
                    value: Number(value.sourceString),
                }
            },
            Var(ident) {
                return {
                    kind: 'var',
                    name: parseRuleIdentifierToken(ident.sourceString),
                }
            },
            Val(value) {
                throw new Error(
                    `Standalone numeric literal ${value.sourceString} is not supported in SBML export.`
                )
            },
        })

    return semantics(match).toRuleAst()
}
