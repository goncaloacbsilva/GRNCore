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
} from 'mddlib-ts'
import { compileRuleExpressionToMdd } from './rule-to-mdd'
import { getExpressionReferences } from '@/lib/regulatory-rules/semantics'
import { regulatoryRuleGrammar } from '@/lib/regulatory-rules/grammar'

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
    const edges: Edge<EditableRegulatoryEdge>[] = []
    const edgesByEndpoints = new Map<string, Edge<EditableRegulatoryEdge>>()
    const nodeIdByReferenceName = new Map<string, string>()

    for (const node of nodes) {
        nodeIdByReferenceName.set(node.data.name || node.id, node.id)
        nodeIdByReferenceName.set(node.id, node.id)
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

    for (const targetNode of nodes) {
        for (const rule of targetNode.data.rules) {
            const matchResult = regulatoryRuleGrammar.match(
                rule.expression.trim(),
                'RuleExpr'
            )
            if (matchResult.failed()) {
                continue
            }

            const references = getExpressionReferences(matchResult)
            for (const reference of references) {
                const sourceId = nodeIdByReferenceName.get(reference.name)
                if (sourceId == null) {
                    continue
                }

                const edge = getOrCreateEdge(sourceId, targetNode.id)
                const edgeData = edge.data as EditableRegulatoryEdge
                const levelType = getEdgeTypeFromReference(reference)
                const levelTarget = Math.max(reference.value ?? 1, 1)
                const hasLevel = edgeData.levels.some(
                    (level) =>
                        level.type === levelType &&
                        level.target === levelTarget
                )

                if (!hasLevel) {
                    edgeData.levels.push({
                        id: nanoid(),
                        type: levelType,
                        target: levelTarget,
                        isValid: true,
                    })
                }
            }
        }
    }

    // Preserve any remaining regulators reported by bioLQM even if the
    // recovered rules omitted them, but leave their thresholds unspecified.
    const coreComponents = model.getComponents()
    const extraComponents = model.getExtraComponents()
    const allComponents = [...coreComponents, ...extraComponents]

    for (const [index, target] of coreComponents.entries()) {
        for (const regulatorIndex of matrix.getRegulators(index, false)) {
            const source = allComponents[regulatorIndex]
            if (source == null) {
                continue
            }
            getOrCreateEdge(source.getNodeID(), target.getNodeID())
        }
    }

    for (const [index, target] of extraComponents.entries()) {
        for (const regulatorIndex of matrix.getRegulators(index, true)) {
            const source = allComponents[regulatorIndex]
            if (source == null) {
                continue
            }
            getOrCreateEdge(source.getNodeID(), target.getNodeID())
        }
    }

    return edges
}

function getEdgeTypeFromReference({
    negated,
    value,
}: {
    negated: boolean
    value?: number
}): InteractionType {
    const isZeroCondition = value === 0
    return negated !== isZeroCondition
        ? InteractionType.Inhibition
        : InteractionType.Activation
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
    const expression = buildExpressionForThreshold(manager, functionId, target)
    return expression === '1' ? '1' : expression
}

function buildExpressionForThreshold(
    manager: MDDManager,
    node: number,
    threshold: number
): string {
    const variable = manager.getNodeVariable(node)
    if (variable == null) {
        return manager.isleaf(node) && node >= threshold ? '1' : '0'
    }

    const children = manager.getChildren(node)
    if (children == null || children.length === 0) {
        return '0'
    }

    const segments: string[] = []
    let start = 0
    let currentChild = children[0]

    const pushSegment = (end: number, child: number) => {
        const childExpression = buildExpressionForThreshold(
            manager,
            child,
            threshold
        )
        if (childExpression === '0') {
            return
        }

        const intervalCondition = buildIntervalCondition(variable, start, end)

        const segment =
            intervalCondition === '1'
                ? childExpression
                : childExpression === '1'
                  ? intervalCondition
                  : `(${intervalCondition} && ${childExpression})`

        segments.push(segment)
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
        return '0'
    }

    return segments.length === 1 ? segments[0] : `(${segments.join(' || ')})`
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
