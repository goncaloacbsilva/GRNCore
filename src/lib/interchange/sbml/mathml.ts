import {
    formatRuleIdentifier,
    parseRuleIdentifierToken,
} from '@/lib/regulatory-rules/identifiers'
import { regulatoryRuleGrammar } from '@/lib/regulatory-rules/grammar'
import type * as ohm from 'ohm-js'
import { asRecord, ensureArray, getNodeText, type XmlRecord } from './xml'

interface VarAst {
    kind: 'var'
    name: string
    value?: number
}

interface NotAst {
    kind: 'not'
    operand: RuleAst
}

interface LogicAst {
    kind: 'and' | 'or'
    operands: RuleAst[]
}

type RuleAst = VarAst | NotAst | LogicAst

type RuleAstNode = ohm.Node & {
    toRuleAst(): RuleAst
}

function toRuleAstNode(node: unknown): RuleAst {
    return (node as RuleAstNode).toRuleAst()
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

    if (containsMultilevelNegation(ast, activityLevelsByName)) {
        return {
            apply: buildExpandedApplyNode(
                ast,
                activityLevelsByName,
                speciesIdByName
            ),
        }
    }

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
            const applyChildren = record.apply as unknown[]
            const firstChild = applyChildren[0]

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
    const variableName =
        nodeNameById.get(variableIdentifier) ?? variableIdentifier
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
            const value = ast.operand.kind === 'var' ? operand : `(${operand})`
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
            const comparison = ast.value ?? 1

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

function getFirstTagText(
    record: XmlRecord,
    tagName: string
): string | undefined {
    const values = ensureArray(record[tagName])
    const [firstValue] = values

    if (firstValue === undefined) {
        return undefined
    }

    return getNodeText(firstValue)
}

type Assignment = Map<string, number>
type Cube = Map<string, number | undefined>

function containsMultilevelNegation(
    ast: RuleAst,
    activityLevelsByName: Map<string, number>
): boolean {
    switch (ast.kind) {
        case 'var':
            return false
        case 'not':
            return (
                ast.operand.kind !== 'var' ||
                (activityLevelsByName.get(ast.operand.name) ?? 1) > 1
            )
        case 'and':
        case 'or':
            return ast.operands.some((operand) =>
                containsMultilevelNegation(operand, activityLevelsByName)
            )
    }
}

function buildExpandedApplyNode(
    ast: RuleAst,
    activityLevelsByName: Map<string, number>,
    speciesIdByName: Map<string, string>
): XmlRecord {
    const variables = Array.from(collectVariables(ast)).sort()
    const assignments = enumerateAssignments(variables, activityLevelsByName)
    const matchingAssignments = assignments.filter((assignment) =>
        evaluateRuleAst(ast, assignment)
    )

    if (matchingAssignments.length === 0) {
        throw new Error('Rule expression does not match any valid assignments.')
    }

    const minimizedCubes = minimizeCubes(
        matchingAssignments.map((assignment) => new Map(assignment)),
        activityLevelsByName
    )

    if (minimizedCubes.length === 1) {
        return buildCubeApplyNode(
            minimizedCubes[0] ?? new Map(),
            speciesIdByName
        )
    }

    return {
        or: '',
        apply: minimizedCubes.map((cube) =>
            buildCubeApplyNode(cube, speciesIdByName)
        ),
    }
}

function buildCubeApplyNode(
    cube: Cube,
    speciesIdByName: Map<string, string>
): XmlRecord {
    const comparisons = Array.from(cube.entries())
        .filter(([, value]) => value !== undefined)
        .map(([name, value]) =>
            buildComparison('eq', speciesIdByName.get(name) ?? name, value ?? 0)
        )

    if (comparisons.length === 0) {
        throw new Error('Expanded rule cube unexpectedly has no comparisons.')
    }

    if (comparisons.length === 1) {
        return comparisons[0] ?? {}
    }

    return {
        and: '',
        apply: comparisons,
    }
}

function collectVariables(ast: RuleAst): Set<string> {
    switch (ast.kind) {
        case 'var':
            return new Set([ast.name])
        case 'not':
            return collectVariables(ast.operand)
        case 'and':
        case 'or':
            return ast.operands.reduce((variables, operand) => {
                collectVariables(operand).forEach((name) => variables.add(name))
                return variables
            }, new Set<string>())
    }
}

function enumerateAssignments(
    variables: string[],
    activityLevelsByName: Map<string, number>
): Assignment[] {
    if (variables.length === 0) {
        return [new Map()]
    }

    const [currentVariable, ...remainingVariables] = variables
    const nestedAssignments = enumerateAssignments(
        remainingVariables,
        activityLevelsByName
    )
    const maxLevel = activityLevelsByName.get(currentVariable ?? '') ?? 1
    const assignments: Assignment[] = []

    for (let value = 0; value <= maxLevel; value += 1) {
        nestedAssignments.forEach((assignment) => {
            const nextAssignment = new Map(assignment)
            if (currentVariable) {
                nextAssignment.set(currentVariable, value)
            }
            assignments.push(nextAssignment)
        })
    }

    return assignments
}

function evaluateRuleAst(ast: RuleAst, assignment: Assignment): boolean {
    switch (ast.kind) {
        case 'var': {
            const currentValue = assignment.get(ast.name) ?? 0
            return currentValue >= (ast.value ?? 1)
        }
        case 'not':
            return !evaluateRuleAst(ast.operand, assignment)
        case 'and':
            return ast.operands.every((operand) =>
                evaluateRuleAst(operand, assignment)
            )
        case 'or':
            return ast.operands.some((operand) =>
                evaluateRuleAst(operand, assignment)
            )
    }
}

function minimizeCubes(
    initialCubes: Cube[],
    activityLevelsByName: Map<string, number>
): Cube[] {
    let cubes = initialCubes
    let changed = true

    while (changed) {
        changed = false
        const nextCubes: Cube[] = []
        const usedIndices = new Set<number>()

        for (let leftIndex = 0; leftIndex < cubes.length; leftIndex += 1) {
            const leftCube = cubes[leftIndex]

            for (
                let rightIndex = leftIndex + 1;
                rightIndex < cubes.length;
                rightIndex += 1
            ) {
                const rightCube = cubes[rightIndex]
                const combined = tryCombineCubes(
                    leftCube ?? new Map(),
                    rightCube ?? new Map(),
                    activityLevelsByName
                )

                if (!combined) {
                    continue
                }

                usedIndices.add(leftIndex)
                usedIndices.add(rightIndex)
                if (!hasCube(nextCubes, combined)) {
                    nextCubes.push(combined)
                }
                changed = true
            }
        }

        cubes.forEach((cube, index) => {
            if (!usedIndices.has(index) && !hasCube(nextCubes, cube)) {
                nextCubes.push(cube)
            }
        })

        cubes = nextCubes
    }

    return cubes
}

function tryCombineCubes(
    leftCube: Cube,
    rightCube: Cube,
    activityLevelsByName: Map<string, number>
): Cube | null {
    const variableNames = new Set([
        ...leftCube.keys(),
        ...rightCube.keys(),
    ])
    let differingVariable: string | null = null

    for (const variableName of variableNames) {
        const leftValue = leftCube.get(variableName)
        const rightValue = rightCube.get(variableName)

        if (leftValue === rightValue) {
            continue
        }

        if (
            leftValue === undefined ||
            rightValue === undefined ||
            (activityLevelsByName.get(variableName) ?? 1) !== 1 ||
            !(
                (leftValue === 0 && rightValue === 1) ||
                (leftValue === 1 && rightValue === 0)
            )
        ) {
            return null
        }

        if (differingVariable !== null) {
            return null
        }

        differingVariable = variableName
    }

    if (differingVariable === null) {
        return null
    }

    const combined = new Map(leftCube)
    combined.set(differingVariable, undefined)
    return combined
}

function hasCube(cubes: Cube[], candidate: Cube) {
    return cubes.some((cube) => cubesEqual(cube, candidate))
}

function cubesEqual(leftCube: Cube, rightCube: Cube) {
    const variableNames = new Set([
        ...leftCube.keys(),
        ...rightCube.keys(),
    ])

    for (const variableName of variableNames) {
        if (leftCube.get(variableName) !== rightCube.get(variableName)) {
            return false
        }
    }

    return true
}

function buildAst(match: import('ohm-js').MatchResult): RuleAst {
    const semantics = regulatoryRuleGrammar
        .createSemantics()
        .addOperation<RuleAst>('toRuleAst', {
            RuleExpr(expr, end) {
                void end
                return toRuleAstNode(expr)
            },
            Expr(expr) {
                return toRuleAstNode(expr)
            },
            OrExpr_binary(left, _operator, right) {
                return {
                    kind: 'or',
                    operands: [toRuleAstNode(left), toRuleAstNode(right)],
                }
            },
            AndExpr_binary(left, _operator, right) {
                return {
                    kind: 'and',
                    operands: [toRuleAstNode(left), toRuleAstNode(right)],
                }
            },
            UnaryExpr(nots, primary) {
                const base = toRuleAstNode(primary)

                return Array.from({ length: nots.children.length }).reduce(
                    (value: RuleAst): NotAst => ({
                        kind: 'not',
                        operand: value,
                    }),
                    base
                )
            },
            Primary_paren(open, expr, close) {
                void open
                void close
                return toRuleAstNode(expr)
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

    return (semantics(match) as { toRuleAst(): RuleAst }).toRuleAst()
}
