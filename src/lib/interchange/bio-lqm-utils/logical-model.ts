import { nanoid } from 'nanoid'
import type { Edge } from '@xyflow/react'
import {
    InteractionType,
    type EditableRegulatoryEdge,
    type InternalGRNModel,
    type PersistedAnnotations,
} from '@/lib/schema'
import {
    ConnectivityMatrix,
    LogicalModelImpl,
    NodeInfo,
    type LogicalModel,
} from 'biolqm-io-ts'
import {
    type MDDManager,
    type MDDVariable,
    MDDBaseOperators,
    MDDManagerFactory,
    MDDVariableFactory,
    OverwriteOperator,
    VariableEffect,
} from 'mddlib-ts'
import { compileRuleExpressionToMdd } from './rule-to-mdd'
import type { Annotator } from 'biolqm-io-ts'
import type { SerializedEditorState } from 'lexical'
import { regulatoryRuleGrammar } from '@/lib/regulatory-rules/grammar'

const GINML_EDGE_DECLARATIONS = 'ginml:edge-declarations'

interface GINMLEdgeDeclaration {
    from: string
    to: string
    threshold: number
    sign: string
}

type RuleExpressionAst =
    | {
          type: 'const'
          value: boolean
      }
    | {
          type: 'literal'
          name: string
          value?: number
          negated: boolean
      }
    | {
          type: 'and' | 'or'
          children: RuleExpressionAst[]
      }

export function createLogicalModelFromInternalModel(
    snapshot: InternalGRNModel
): LogicalModel {
    const nodesById = createLogicalModelNodes(snapshot.nodes)
    const nodeInfos = Array.from(nodesById.values())

    const variableFactory = createVariableFactory(nodeInfos)
    const leafCount = Math.max(...nodeInfos.map((node) => node.getMax())) + 1
    const manager = MDDManagerFactory.getManager(variableFactory, leafCount)
    const functions = createLogicalFunctions(snapshot, manager, nodesById)

    const logicalModel = new LogicalModelImpl(nodeInfos, manager, functions)
    const layout = logicalModel.getLayout()

    for (const node of snapshot.nodes) {
        const nodeInfo = nodesById.get(node.id)
        if (nodeInfo == null) {
            continue
        }
        layout.set(
            nodeInfo,
            Math.round(node.position.x),
            Math.round(node.position.y),
            90,
            40
        )
    }

    applyInternalAnnotationsToLogicalModel(logicalModel, snapshot, nodesById)

    return logicalModel
}

export function createInternalModelFromLogicalModel(
    model: LogicalModel,
    title = ''
): InternalGRNModel {
    const coreComponents = model.getComponents()
    const extraComponents = model.getExtraComponents()
    const allComponents = [...coreComponents, ...extraComponents]
    const layout = model.hasLayout() ? model.getLayout() : undefined
    const allFunctions = [
        ...model.getLogicalFunctions(),
        ...model.getExtraLogicalFunctions(),
    ]

    const annotator = model.getAnnotator()
    const nodes = allComponents.map((component, index) => {
        const layoutInfo = layout?.getInfo(component)
        const functionId = allFunctions[index]
        const nodeName = component.getName() || component.getNodeID()

        return {
            id: component.getNodeID(),
            position: {
                x: layoutInfo?.x ?? 0,
                y: layoutInfo?.y ?? 0,
            },
            data: {
                name: nodeName,
                activityLevels: component.getMax(),
                isInputNode: component.isInput(),
                rules:
                    component.isInput() || functionId === 0
                        ? []
                        : createInternalModelRules(
                              (model as LogicalModelImpl).getMDDManager(),
                              functionId,
                              component
                          ),
                annotations: createPersistedAnnotationsFromAnnotator(
                    annotator.node(component)
                ),
            },
        }
    })

    const edges = createInternalModelEdges(model, nodes, annotator)

    return {
        title,
        annotations: createPersistedAnnotationsFromAnnotator(
            annotator.onModel()
        ),
        nodes,
        edges,
    }
}

function createInternalModelEdges(
    model: LogicalModel,
    nodes: InternalGRNModel['nodes'],
    annotator: Annotator<NodeInfo>
) {
    const matrix = new ConnectivityMatrix(model)
    const manager = (model as LogicalModelImpl).getMDDManager()
    const edges: Edge<EditableRegulatoryEdge>[] = []
    const edgesByEndpoints = new Map<string, Edge<EditableRegulatoryEdge>>()
    const nodeIdByComponentId = new Map<string, string>()
    const componentById = new Map<string, NodeInfo>()

    for (const node of nodes) {
        nodeIdByComponentId.set(node.id, node.id)
    }
    for (const component of [
        ...model.getComponents(),
        ...model.getExtraComponents(),
    ]) {
        componentById.set(component.getNodeID(), component)
    }

    const getOrCreateEdge = (
        sourceId: string,
        targetId: string
    ): Edge<EditableRegulatoryEdge> => {
        const key = `${sourceId}:${targetId}`
        const existingEdge = edgesByEndpoints.get(key)
        if (existingEdge != null) {
            return existingEdge
        }

        const sourceComponent = componentById.get(sourceId)
        const targetComponent = componentById.get(targetId)
        const edge: Edge<EditableRegulatoryEdge> = {
            id: `${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            data: {
                levels: [],
                annotations:
                    sourceComponent != null && targetComponent != null
                        ? createPersistedAnnotationsFromAnnotator(
                              annotator.edge(sourceComponent, targetComponent)
                          )
                        : undefined,
            },
        }
        edges.push(edge)
        edgesByEndpoints.set(key, edge)
        return edge
    }

    const coreComponents = model.getComponents()
    const extraComponents = model.getExtraComponents()
    const allComponents = [...coreComponents, ...extraComponents]
    const allFunctions = [
        ...model.getLogicalFunctions(),
        ...model.getExtraLogicalFunctions(),
    ]
    const ginmlEdgeDeclarations =
        model.getProperty<GINMLEdgeDeclaration[]>(GINML_EDGE_DECLARATIONS) ?? []
    const ginmlDeclaredThresholds = new Set(
        ginmlEdgeDeclarations.map(
            (declaration) =>
                `${declaration.from}:${declaration.to}:${declaration.threshold}`
        )
    )

    const addSemanticLevels = (
        sourceId: string,
        targetId: string,
        effects: VariableEffect[]
    ) => {
        const edge = getOrCreateEdge(sourceId, targetId)
        const edgeData = edge.data!

        for (const [index, effect] of effects.entries()) {
            const threshold = index + 1

            if (effect === VariableEffect.NONE) {
                continue
            }

            if (
                ginmlDeclaredThresholds.has(
                    `${sourceId}:${targetId}:${threshold}`
                )
            ) {
                continue
            }

            const levelTypes = getInteractionTypesFromEffect(effect)
            for (const levelType of levelTypes) {
                const hasLevel = edgeData.levels.some(
                    (level) =>
                        level.type === levelType && level.target === threshold
                )

                if (!hasLevel) {
                    edgeData.levels.push({
                        id: nanoid(),
                        type: levelType,
                        target: threshold,
                        isValid: true,
                    })
                }
            }
        }
    }

    for (const declaration of ginmlEdgeDeclarations) {
        if (declaration.threshold <= 0) {
            continue
        }

        const levelTypes = getInteractionTypesFromGinmlSign(declaration.sign)
        for (const levelType of levelTypes) {
            const edge = getOrCreateEdge(declaration.from, declaration.to)
            const edgeData = edge.data!
            const hasLevel = edgeData.levels.some(
                (level) =>
                    level.type === levelType &&
                    level.target === declaration.threshold
            )

            if (!hasLevel) {
                edgeData.levels.push({
                    id: nanoid(),
                    type: levelType,
                    target: declaration.threshold,
                    isValid: true,
                })
            }
        }
    }

    for (const [index, target] of coreComponents.entries()) {
        if (target.isInput() || (allFunctions[index] ?? 0) === 0) {
            continue
        }

        for (const regulatorIndex of matrix.getRegulators(index, false)) {
            const source = allComponents[regulatorIndex]
            if (source == null) {
                continue
            }

            const sourceId = nodeIdByComponentId.get(source.getNodeID())
            const targetId = nodeIdByComponentId.get(target.getNodeID())
            if (sourceId == null || targetId == null) {
                continue
            }

            addSemanticLevels(
                sourceId,
                targetId,
                getSemanticEffectsForRegulator(
                    manager,
                    allFunctions[index] ?? 0,
                    source
                )
            )
        }
    }

    for (const [index, target] of extraComponents.entries()) {
        const functionId = allFunctions[coreComponents.length + index] ?? 0
        if (target.isInput() || functionId === 0) {
            continue
        }

        for (const regulatorIndex of matrix.getRegulators(index, true)) {
            const source = allComponents[regulatorIndex]
            if (source == null) {
                continue
            }

            const sourceId = nodeIdByComponentId.get(source.getNodeID())
            const targetId = nodeIdByComponentId.get(target.getNodeID())
            if (sourceId == null || targetId == null) {
                continue
            }

            addSemanticLevels(
                sourceId,
                targetId,
                getSemanticEffectsForRegulator(manager, functionId, source)
            )
        }
    }

    return edges
}

function createPersistedAnnotationsFromAnnotator(
    annotator: Annotator<NodeInfo>
): PersistedAnnotations | undefined {
    const notes = annotator.getNotes()
    const references = (annotator.annotations() ?? [])
        .flatMap((annotation) => annotation.uris.map((uri) => uri.uri()))
        .filter((reference, index, array) => array.indexOf(reference) === index)

    if (
        (notes == null || notes.trim().length === 0) &&
        references.length === 0
    ) {
        return undefined
    }

    return {
        unstructured:
            notes != null && notes.trim().length > 0
                ? createSerializedEditorStateFromNotes(notes)
                : undefined,
        references,
    }
}

function createSerializedEditorStateFromNotes(
    notes: string
): SerializedEditorState {
    const lines = notes
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

    return {
        root: {
            children: (lines.length > 0 ? lines : ['']).map((line) => ({
                children: line.length
                    ? [
                          {
                              detail: 0,
                              format: 0,
                              mode: 'normal',
                              style: '',
                              text: line,
                              type: 'text',
                              version: 1,
                          },
                      ]
                    : [],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
            })),
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
        },
    } as unknown as SerializedEditorState
}

function applyInternalAnnotationsToLogicalModel(
    logicalModel: LogicalModel,
    snapshot: InternalGRNModel,
    nodesById: Map<string, NodeInfo>
) {
    const annotator = logicalModel.getAnnotator()

    applyPersistedAnnotationsToAnnotator(
        annotator.onModel(),
        snapshot.annotations
    )

    for (const node of snapshot.nodes) {
        const nodeInfo = nodesById.get(node.id)
        if (nodeInfo == null) {
            continue
        }

        applyPersistedAnnotationsToAnnotator(
            annotator.node(nodeInfo),
            node.data.annotations
        )
    }

    for (const edge of snapshot.edges) {
        const sourceInfo = nodesById.get(edge.source)
        const targetInfo = nodesById.get(edge.target)
        if (sourceInfo == null || targetInfo == null) {
            continue
        }

        applyPersistedAnnotationsToAnnotator(
            annotator.edge(sourceInfo, targetInfo),
            edge.data?.annotations
        )
    }
}

function applyPersistedAnnotationsToAnnotator(
    annotator: Annotator<NodeInfo>,
    annotations: PersistedAnnotations | undefined
) {
    if (annotations == null) {
        return
    }

    const notes = extractPlainTextFromSerializedState(
        annotations.unstructured as SerializedEditorState | null | undefined
    )
    if (notes.length > 0) {
        annotator.setNotes(notes)
    }

    for (const reference of annotations.references ?? []) {
        annotator.addURI(reference)
    }
}

function extractPlainTextFromSerializedState(
    state: SerializedEditorState | null | undefined
): string {
    if (state == null) {
        return ''
    }

    const root = state as unknown as {
        root?: {
            children?: unknown[]
        }
    }

    const lines = (root.root?.children ?? [])
        .map((child) => extractTextFromLexicalNode(child))
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

    return lines.join('\n')
}

function extractTextFromLexicalNode(node: unknown): string {
    if (node == null || typeof node !== 'object') {
        return ''
    }

    const candidate = node as {
        text?: string
        children?: unknown[]
    }

    const ownText = candidate.text ?? ''
    const childrenText = (candidate.children ?? [])
        .map((child) => extractTextFromLexicalNode(child))
        .join('')

    return `${ownText}${childrenText}`
}

function getSemanticEffectsForRegulator(
    manager: MDDManager,
    functionId: number,
    source: NodeInfo
): VariableEffect[] {
    const variable = manager.getVariableForKey(source)
    if (variable == null) {
        return []
    }

    if (variable.nbval <= 2) {
        return [manager.getVariableEffect(variable, functionId)]
    }

    return manager.getMultivaluedVariableEffect(variable, functionId)
}

function getInteractionTypesFromEffect(
    effect: VariableEffect
): InteractionType[] {
    switch (effect) {
        case VariableEffect.POSITIVE:
            return [InteractionType.Activation]
        case VariableEffect.NEGATIVE:
            return [InteractionType.Inhibition]
        case VariableEffect.DUAL:
            return [InteractionType.Activation, InteractionType.Inhibition]
        default:
            return []
    }
}

function getInteractionTypesFromGinmlSign(sign: string): InteractionType[] {
    switch (sign) {
        case 'positive':
            return [InteractionType.Activation]
        case 'negative':
            return [InteractionType.Inhibition]
        case 'unknown':
            return [InteractionType.Activation, InteractionType.Inhibition]
        default:
            return []
    }
}

function createInternalModelRules(
    manager: MDDManager,
    functionId: number,
    nodeInfo: NodeInfo
) {
    const thresholdExpressions = []
    const targetCount = nodeInfo.getMax()

    for (let target = 1; target <= targetCount; target += 1) {
        const expression = simplifyRuleExpression(
            createRuleExpressionForThreshold(manager, functionId, target)
        )

        thresholdExpressions.push({
            target,
            expression,
        })
    }

    const rules = []
    let previousExpression: string | null = null

    for (let index = thresholdExpressions.length - 1; index >= 0; index -= 1) {
        const { target, expression } = thresholdExpressions[index]
        if (expression === '0') {
            continue
        }

        if (expression === previousExpression) {
            continue
        }

        rules.unshift({
            id: nanoid(),
            target,
            expression,
            isValid: true,
        })
        previousExpression = expression
    }

    return rules
}

function createRuleExpressionForThreshold(
    manager: MDDManager,
    functionId: number,
    target: number
) {
    const expression = buildThresholdExpression(manager, functionId, target)
    return expression === '1' ? '1' : expression
}

function buildThresholdExpression(
    manager: MDDManager,
    node: number,
    threshold: number
): string {
    return buildThresholdExpressionWithPredicate(manager, node, threshold)
        .expression
}

function buildThresholdExpressionWithPredicate(
    manager: MDDManager,
    node: number,
    threshold: number
): { expression: string; predicate: number } {
    const variable = manager.getNodeVariable(node)
    if (variable == null) {
        const predicate = manager.isleaf(node) && node >= threshold ? 1 : 0
        return {
            expression: predicate === 1 ? '1' : '0',
            predicate,
        }
    }

    const children = manager.getChildren(node)
    if (children == null || children.length === 0) {
        return {
            expression: '0',
            predicate: 0,
        }
    }

    const segments: {
        start: number
        end: number
        expression: string
        predicate: number
    }[] = []
    let start = 0
    let currentChild = children[0]

    const pushSegment = (end: number, child: number) => {
        const childResult = buildThresholdExpressionWithPredicate(
            manager,
            child,
            threshold
        )
        if (childResult.expression === '0') {
            return
        }

        segments.push({
            start,
            end,
            expression: childResult.expression,
            predicate: childResult.predicate,
        })
    }

    for (let index = 1; index < children.length; index += 1) {
        const child = children[index]
        if (child !== currentChild) {
            pushSegment(index - 1, currentChild)
            start = index
            currentChild = child
        }
    }

    pushSegment(children.length - 1, currentChild)

    if (segments.length === 0) {
        return {
            expression: '0',
            predicate: 0,
        }
    }

    if (children.length === 2 && segments.length === 2) {
        const lowSegment = segments.find((segment) => segment.start === 0)
        const highSegment = segments.find((segment) => segment.end === 1)

        if (lowSegment != null && highSegment != null) {
            if (
                isPredicateSubset(
                    manager,
                    lowSegment.predicate,
                    highSegment.predicate
                )
            ) {
                const expression = joinOrExpressions([
                    lowSegment.expression,
                    combineWithCondition(
                        variable.getNode(0, 1),
                        variable,
                        1,
                        1,
                        highSegment.expression
                    ),
                ])

                return {
                    expression,
                    predicate: variable.getNode(
                        lowSegment.predicate,
                        highSegment.predicate
                    ),
                }
            }

            if (
                isPredicateSubset(
                    manager,
                    highSegment.predicate,
                    lowSegment.predicate
                )
            ) {
                const expression = joinOrExpressions([
                    highSegment.expression,
                    combineWithCondition(
                        variable.getNode(0, 1),
                        variable,
                        0,
                        0,
                        lowSegment.expression
                    ),
                ])

                return {
                    expression,
                    predicate: variable.getNode(
                        lowSegment.predicate,
                        highSegment.predicate
                    ),
                }
            }
        }
    }

    const expression = joinOrExpressions(
        segments.map((segment) =>
            combineWithCondition(
                segment.predicate,
                variable,
                segment.start,
                segment.end,
                segment.expression
            )
        )
    )

    return {
        expression,
        predicate: variable.getNode(children),
    }
}

function isPredicateSubset(
    manager: MDDManager,
    left: number,
    right: number
): boolean {
    return MDDBaseOperators.AND.combine(manager, left, manager.not(right)) === 0
}

function joinOrExpressions(segments: string[]): string {
    const filteredSegments = segments.filter((segment) => segment !== '0')
    if (filteredSegments.length === 0) {
        return '0'
    }

    return filteredSegments.length === 1
        ? filteredSegments[0]
        : `(${filteredSegments.join(' || ')})`
}

function combineWithCondition(
    predicate: number,
    variable: MDDVariable,
    start: number,
    end: number,
    childExpression: string
): string {
    void predicate
    const intervalCondition = buildIntervalCondition(variable, start, end)

    if (intervalCondition === '1') {
        return childExpression
    }

    if (childExpression === '1') {
        return intervalCondition
    }

    return `(${intervalCondition} && ${childExpression})`
}

function buildIntervalCondition(
    variable: MDDVariable,
    start: number,
    end: number
): string {
    const nodeInfo = variable.key as NodeInfo
    const variableName = nodeInfo.getName() || nodeInfo.getNodeID()
    const maxValue = variable.nbval

    if (start === 0 && end === maxValue - 1) {
        return '1'
    }

    if (maxValue === 2) {
        if (start === 0) {
            return `!${variableName}`
        }
        return variableName
    }

    if (start === 0) {
        return `!${variableName}:${end + 1}`
    }

    if (end === maxValue - 1) {
        return `${variableName}:${start}`
    }

    return `(${variableName}:${start} && !${variableName}:${end + 1})`
}

function simplifyRuleExpression(expression: string): string {
    const matchResult = regulatoryRuleGrammar.match(
        expression.trim(),
        'RuleExpr'
    )
    if (matchResult.failed()) {
        return expression
    }

    const ast = buildRuleExpressionAst(matchResult)
    return serializeRuleExpressionAst(simplifyRuleExpressionAst(ast))
}

function buildRuleExpressionAst(matchResult: unknown): RuleExpressionAst {
    interface SemanticNode {
        toRuleExpressionAst(): RuleExpressionAst
    }

    interface SemanticNodeWithSource {
        sourceString: string
    }

    interface SemanticNodeWithChildren {
        children: unknown[]
    }

    const semantics = regulatoryRuleGrammar
        .createSemantics()
        .addOperation<RuleExpressionAst>('toRuleExpressionAst', {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            RuleExpr(expr, _end) {
                return (expr as unknown as SemanticNode).toRuleExpressionAst()
            },
            OrExpr_binary(left, _operator, right) {
                return {
                    type: 'or',
                    children: [
                        (left as unknown as SemanticNode).toRuleExpressionAst(),
                        (
                            right as unknown as SemanticNode
                        ).toRuleExpressionAst(),
                    ],
                }
            },
            AndExpr_binary(left, _operator, right) {
                return {
                    type: 'and',
                    children: [
                        (left as unknown as SemanticNode).toRuleExpressionAst(),
                        (
                            right as unknown as SemanticNode
                        ).toRuleExpressionAst(),
                    ],
                }
            },
            UnaryExpr(nots, primary) {
                const primaryAst = (
                    primary as unknown as SemanticNode
                ).toRuleExpressionAst()
                const isNegated =
                    (nots as unknown as SemanticNodeWithChildren).children
                        .length %
                        2 ===
                    1

                if (!isNegated) {
                    return primaryAst
                }

                return negateRuleExpressionAst(primaryAst)
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Primary_paren(_open, expr, _close) {
                return (expr as unknown as SemanticNode).toRuleExpressionAst()
            },
            Condition(variable, _colon, value) {
                return {
                    type: 'literal',
                    name: (variable as unknown as SemanticNodeWithSource)
                        .sourceString,
                    value: Number(
                        (value as unknown as SemanticNodeWithSource)
                            .sourceString
                    ),
                    negated: false,
                }
            },
            Var(ident) {
                return {
                    type: 'literal',
                    name: (ident as unknown as SemanticNodeWithSource)
                        .sourceString,
                    negated: false,
                }
            },
            Val(value) {
                return {
                    type: 'const',
                    value:
                        Number(
                            (value as unknown as SemanticNodeWithSource)
                                .sourceString
                        ) !== 0,
                }
            },
        })

    return (
        semantics(matchResult as never) as SemanticNode
    ).toRuleExpressionAst()
}

function negateRuleExpressionAst(ast: RuleExpressionAst): RuleExpressionAst {
    switch (ast.type) {
        case 'const':
            return { type: 'const', value: !ast.value }
        case 'literal':
            return { ...ast, negated: !ast.negated }
        case 'and':
            return {
                type: 'or',
                children: ast.children.map((child) =>
                    negateRuleExpressionAst(child)
                ),
            }
        case 'or':
            return {
                type: 'and',
                children: ast.children.map((child) =>
                    negateRuleExpressionAst(child)
                ),
            }
    }
}

function simplifyRuleExpressionAst(ast: RuleExpressionAst): RuleExpressionAst {
    switch (ast.type) {
        case 'const':
        case 'literal':
            return ast
        case 'and':
        case 'or': {
            const simplifiedChildren = ast.children.map((child) =>
                simplifyRuleExpressionAst(child)
            )
            const flattenedChildren = simplifiedChildren.flatMap((child) =>
                child.type === ast.type ? child.children : [child]
            )

            const childrenWithoutIdentities = flattenedChildren.filter(
                (child) =>
                    ast.type === 'and'
                        ? !(child.type === 'const' && child.value)
                        : !(child.type === 'const' && !child.value)
            )

            if (
                childrenWithoutIdentities.some((child) =>
                    ast.type === 'and'
                        ? child.type === 'const' && !child.value
                        : child.type === 'const' && child.value
                )
            ) {
                return {
                    type: 'const',
                    value: ast.type === 'or',
                }
            }

            const uniqueChildren = dedupeRuleExpressionAst(
                childrenWithoutIdentities
            )

            if (hasComplementaryChildren(uniqueChildren)) {
                return {
                    type: 'const',
                    value: ast.type === 'or',
                }
            }

            const normalizedChildren =
                ast.type === 'or'
                    ? applyOrLiteralResolution(uniqueChildren)
                    : applyAndLiteralResolution(uniqueChildren)
            const absorbedChildren = applyAbsorption(
                ast.type,
                normalizedChildren
            )

            if (absorbedChildren.length === 0) {
                return {
                    type: 'const',
                    value: ast.type === 'and',
                }
            }

            if (absorbedChildren.length === 1) {
                return absorbedChildren[0]
            }

            return {
                type: ast.type,
                children: absorbedChildren,
            }
        }
    }
}

function dedupeRuleExpressionAst(
    children: RuleExpressionAst[]
): RuleExpressionAst[] {
    const seen = new Set<string>()
    const result: RuleExpressionAst[] = []

    for (const child of children) {
        const key = serializeRuleExpressionAst(child)
        if (seen.has(key)) {
            continue
        }

        seen.add(key)
        result.push(child)
    }

    return result
}

function hasComplementaryChildren(children: RuleExpressionAst[]): boolean {
    const literals = children.filter(
        (child): child is Extract<RuleExpressionAst, { type: 'literal' }> =>
            child.type === 'literal'
    )

    return literals.some((literal) =>
        literals.some((candidate) =>
            areComplementaryLiterals(literal, candidate)
        )
    )
}

function applyOrLiteralResolution(
    children: RuleExpressionAst[]
): RuleExpressionAst[] {
    const literals = children.filter(
        (child): child is Extract<RuleExpressionAst, { type: 'literal' }> =>
            child.type === 'literal'
    )

    return dedupeRuleExpressionAst(
        children.map((child) => {
            if (child.type !== 'and') {
                return child
            }

            const filteredChildren = child.children.filter(
                (grandchild) =>
                    !literals.some(
                        (literal) =>
                            grandchild.type === 'literal' &&
                            areComplementaryLiterals(literal, grandchild)
                    )
            )

            if (filteredChildren.length === 0) {
                return {
                    type: 'const',
                    value: true,
                } satisfies RuleExpressionAst
            }

            if (filteredChildren.length === 1) {
                return filteredChildren[0]
            }

            return {
                type: 'and',
                children: filteredChildren,
            } satisfies RuleExpressionAst
        })
    )
}

function applyAndLiteralResolution(
    children: RuleExpressionAst[]
): RuleExpressionAst[] {
    const literals = children.filter(
        (child): child is Extract<RuleExpressionAst, { type: 'literal' }> =>
            child.type === 'literal'
    )

    return dedupeRuleExpressionAst(
        children.map((child) => {
            if (child.type !== 'or') {
                return child
            }

            const filteredChildren = child.children.filter(
                (grandchild) =>
                    !literals.some(
                        (literal) =>
                            grandchild.type === 'literal' &&
                            areComplementaryLiterals(literal, grandchild)
                    )
            )

            if (filteredChildren.length === 0) {
                return {
                    type: 'const',
                    value: false,
                } satisfies RuleExpressionAst
            }

            if (filteredChildren.length === 1) {
                return filteredChildren[0]
            }

            return {
                type: 'or',
                children: filteredChildren,
            } satisfies RuleExpressionAst
        })
    )
}

function applyAbsorption(
    type: 'and' | 'or',
    children: RuleExpressionAst[]
): RuleExpressionAst[] {
    const counterpartType = type === 'and' ? 'or' : 'and'

    return children.filter((child, childIndex) => {
        if (child.type !== counterpartType) {
            return true
        }

        return !children.some((candidate, candidateIndex) => {
            if (candidateIndex === childIndex) {
                return false
            }

            return child.children.some((grandchild) =>
                areEquivalentRuleExpressions(candidate, grandchild)
            )
        })
    })
}

function areComplementaryLiterals(
    left: Extract<RuleExpressionAst, { type: 'literal' }>,
    right: Extract<RuleExpressionAst, { type: 'literal' }>
): boolean {
    return (
        left.name === right.name &&
        left.value === right.value &&
        left.negated !== right.negated
    )
}

function areEquivalentRuleExpressions(
    left: RuleExpressionAst,
    right: RuleExpressionAst
): boolean {
    return (
        serializeRuleExpressionAst(left) === serializeRuleExpressionAst(right)
    )
}

function serializeRuleExpressionAst(ast: RuleExpressionAst): string {
    switch (ast.type) {
        case 'const':
            return ast.value ? '1' : '0'
        case 'literal': {
            const base =
                ast.value == null ? ast.name : `${ast.name}:${ast.value}`
            return ast.negated ? `!${base}` : base
        }
        case 'and':
            return serializeRuleExpressionGroup(ast.children, '&&')
        case 'or':
            return serializeRuleExpressionGroup(ast.children, '||')
    }
}

function serializeRuleExpressionGroup(
    children: RuleExpressionAst[],
    operator: '&&' | '||'
): string {
    return children
        .map((child) => {
            const serialized = serializeRuleExpressionAst(child)
            if (
                (operator === '&&' && child.type === 'or') ||
                (operator === '||' && child.type === 'and')
            ) {
                return `(${serialized})`
            }

            return serialized
        })
        .join(` ${operator} `)
}

export function createLogicalFunctions(
    snapshot: InternalGRNModel,
    manager: MDDManager,
    nodesById: Map<string, NodeInfo>
): number[] {
    const nodeByName = new Map(
        snapshot.nodes.map((node) => [node.data.name, node] as const)
    )

    return snapshot.nodes.map((node) => {
        const nodeInfo = nodesById.get(node.id)
        if (nodeInfo == null) {
            throw new Error(`Missing node info for "${node.id}".`)
        }

        if (nodeInfo.isInput()) {
            return createInputFunction(manager, nodeInfo)
        }

        const nonEmptyRules = node.data.rules
            .filter((rule) => rule.expression.trim().length > 0)
            .sort((left, right) => left.target - right.target)

        let functionId = 0

        for (const rule of nonEmptyRules) {
            const predicate = compileRuleExpressionToMdd(
                rule.expression,
                manager,
                nodeByName,
                nodesById
            )

            functionId = OverwriteOperator.getOverwriteAction(
                rule.target
            ).combine(manager, functionId, predicate)
        }

        return functionId
    })
}

export function createLogicalModelNodes(
    nodes: InternalGRNModel['nodes']
): Map<string, NodeInfo> {
    return new Map(
        nodes.map((node) => {
            const nodeInfo = new NodeInfo(
                node.data.name,
                node.data.name,
                node.data.activityLevels
            )
            nodeInfo.setInput(node.data.isInputNode)
            return [node.id, nodeInfo] as const
        })
    )
}

export function createVariableFactory(nodes: NodeInfo[]): MDDVariableFactory {
    const variableFactory = new MDDVariableFactory()
    for (const node of nodes) {
        variableFactory.add(node, node.getMax() + 1)
    }
    return variableFactory
}

export function createInputFunction(
    manager: MDDManager,
    nodeInfo: NodeInfo
): number {
    const variable = manager.getVariableForKey(nodeInfo)
    if (variable == null) {
        throw new Error(
            `Missing MDD variable for input node "${nodeInfo.getNodeID()}".`
        )
    }

    if (nodeInfo.getMax() === 1) {
        return variable.getNode(0, 1)
    }

    return variable.getNode(
        Array.from({ length: nodeInfo.getMax() + 1 }, (_, index) => index)
    )
}
