import { nanoid } from 'nanoid'
import type { Edge } from '@xyflow/react'
import {
    InteractionType,
    type EditableRegulatoryEdge,
    type InternalGRNModel,
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
    VariableEffect,
} from 'mddlib-ts'
import { compileRuleExpressionToMdd } from './rule-to-mdd'

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
        layout.set(nodeInfo, node.position.x, node.position.y, 90, 40)
    }

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
                annotations: undefined,
            },
        }
    })

    const edges = createInternalModelEdges(model, nodes)

    return {
        title,
        nodes,
        edges,
    }
}

function createInternalModelEdges(
    model: LogicalModel,
    nodes: InternalGRNModel['nodes']
) {
    const matrix = new ConnectivityMatrix(model)
    const manager = (model as LogicalModelImpl).getMDDManager()
    const edges: Edge<EditableRegulatoryEdge>[] = []
    const edgesByEndpoints = new Map<string, Edge<EditableRegulatoryEdge>>()
    const nodeIdByComponentId = new Map<string, string>()

    for (const node of nodes) {
        nodeIdByComponentId.set(node.id, node.id)
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

        const edge: Edge<EditableRegulatoryEdge> = {
            id: `${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            data: {
                levels: [],
                annotations: undefined,
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

function createInternalModelRules(
    manager: MDDManager,
    functionId: number,
    nodeInfo: NodeInfo
) {
    const rules = []
    const targetCount = nodeInfo.getMax()

    for (let target = 1; target <= targetCount; target += 1) {
        const expression = createRuleExpressionForThreshold(
            manager,
            functionId,
            target
        )

        if (expression === '0') {
            continue
        }

        rules.push({
            id: nanoid(),
            target,
            expression,
            isValid: true,
        })
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

            functionId = MDDBaseOperators.OVEROPERATOR(rule.target).combine(
                manager,
                functionId,
                predicate
            )
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
