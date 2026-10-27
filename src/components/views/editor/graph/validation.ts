import {
    type EditableRegulatoryEdge,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import { isRegulatoryRuleExpressionValid } from '@/lib/regulatory-rules'
import type { Edge, Node } from '@xyflow/react'

export type GraphNode = Node<RegulatoryNodeProperties>
export type GraphEdge = Edge<EditableRegulatoryEdge>

export interface GraphValidationIndexes {
    nodeById: Map<string, GraphNode>
    incomingNodesByTargetId: Map<string, GraphNode[]>
    incomingEdgesByTargetId: Map<string, GraphEdge[]>
    outgoingEdgesBySourceId: Map<string, GraphEdge[]>
}

interface NodeSemanticState {
    name: string
    activityLevels: number
    rules: string
}

interface EdgeSemanticState {
    source: string
    target: string
    levels: string
}

export interface ValidationSnapshot {
    nodes: Map<string, NodeSemanticState>
    edges: Map<string, EdgeSemanticState>
}

export interface ValidationStats {
    ruleEvaluations: number
    edgeLevelEvaluations: number
    changedNodeIds: string[]
    changedEdgeIds: string[]
}

export interface IncrementalValidationResult {
    nodes: GraphNode[]
    edges: GraphEdge[]
    snapshot: ValidationSnapshot
    nodesChanged: boolean
    edgesChanged: boolean
    stats: ValidationStats
}

function rulesSemanticValue(node: GraphNode) {
    return node.data.rules
        .map((rule) => `${rule.id}\u0000${rule.target}\u0000${rule.expression}`)
        .join('\u0001')
}

function levelsSemanticValue(edge: GraphEdge) {
    return (edge.data?.levels ?? [])
        .map((level) => `${level.id}\u0000${level.type}\u0000${level.target}`)
        .join('\u0001')
}

function getNodeSemanticState(node: GraphNode): NodeSemanticState {
    return {
        name: node.data.name,
        activityLevels: node.data.activityLevels,
        rules: rulesSemanticValue(node),
    }
}

function getEdgeSemanticState(edge: GraphEdge): EdgeSemanticState {
    return {
        source: edge.source,
        target: edge.target,
        levels: levelsSemanticValue(edge),
    }
}

function sameNodeSemanticState(
    left: NodeSemanticState | undefined,
    right: NodeSemanticState | undefined
) {
    return (
        left?.name === right?.name &&
        left?.activityLevels === right?.activityLevels &&
        left?.rules === right?.rules
    )
}

function sameEdgeSemanticState(
    left: EdgeSemanticState | undefined,
    right: EdgeSemanticState | undefined
) {
    return (
        left?.source === right?.source &&
        left?.target === right?.target &&
        left?.levels === right?.levels
    )
}

export function buildGraphValidationIndexes(
    nodes: GraphNode[],
    edges: GraphEdge[]
): GraphValidationIndexes {
    const nodeById = new Map(nodes.map((node) => [node.id, node]))
    const incomingNodesByTargetId = new Map<string, GraphNode[]>()
    const incomingEdgesByTargetId = new Map<string, GraphEdge[]>()
    const outgoingEdgesBySourceId = new Map<string, GraphEdge[]>()

    for (const edge of edges) {
        const sourceNode = nodeById.get(edge.source)
        if (sourceNode) {
            const incomingNodes = incomingNodesByTargetId.get(edge.target) ?? []
            incomingNodes.push(sourceNode)
            incomingNodesByTargetId.set(edge.target, incomingNodes)
        }

        const incomingEdges = incomingEdgesByTargetId.get(edge.target) ?? []
        incomingEdges.push(edge)
        incomingEdgesByTargetId.set(edge.target, incomingEdges)

        const outgoingEdges = outgoingEdgesBySourceId.get(edge.source) ?? []
        outgoingEdges.push(edge)
        outgoingEdgesBySourceId.set(edge.source, outgoingEdges)
    }

    return {
        nodeById,
        incomingNodesByTargetId,
        incomingEdgesByTargetId,
        outgoingEdgesBySourceId,
    }
}

export function createValidationSnapshot(
    nodes: GraphNode[],
    edges: GraphEdge[]
): ValidationSnapshot {
    return {
        nodes: new Map(
            nodes.map((node) => [node.id, getNodeSemanticState(node)])
        ),
        edges: new Map(
            edges.map((edge) => [edge.id, getEdgeSemanticState(edge)])
        ),
    }
}

function addOutgoingDependents(
    nodeId: string,
    indexes: GraphValidationIndexes,
    affectedNodeIds: Set<string>,
    affectedEdgeIds: Set<string>
) {
    for (const edge of indexes.outgoingEdgesBySourceId.get(nodeId) ?? []) {
        affectedEdgeIds.add(edge.id)
        affectedNodeIds.add(edge.target)
    }
}

export function validateGraphIncrementally(
    nodes: GraphNode[],
    edges: GraphEdge[],
    previousSnapshot: ValidationSnapshot | null
): IncrementalValidationResult {
    const indexes = buildGraphValidationIndexes(nodes, edges)
    const snapshot = createValidationSnapshot(nodes, edges)
    const affectedNodeIds = new Set<string>()
    const affectedEdgeIds = new Set<string>()
    const changedNodeIds: string[] = []
    const changedEdgeIds: string[] = []

    if (!previousSnapshot) {
        nodes.forEach((node) => affectedNodeIds.add(node.id))
        edges.forEach((edge) => affectedEdgeIds.add(edge.id))
    } else {
        for (const [nodeId, state] of snapshot.nodes) {
            const previousNode = previousSnapshot.nodes.get(nodeId)
            if (sameNodeSemanticState(previousNode, state)) {
                continue
            }

            changedNodeIds.push(nodeId)
            affectedNodeIds.add(nodeId)
            if (
                previousNode?.name !== state.name ||
                previousNode?.activityLevels !== state.activityLevels
            ) {
                addOutgoingDependents(
                    nodeId,
                    indexes,
                    affectedNodeIds,
                    affectedEdgeIds
                )
            }
        }

        for (const [edgeId, state] of snapshot.edges) {
            if (sameEdgeSemanticState(previousSnapshot.edges.get(edgeId), state)) {
                continue
            }

            changedEdgeIds.push(edgeId)
            affectedEdgeIds.add(edgeId)
            affectedNodeIds.add(state.target)
            const previousEdge = previousSnapshot.edges.get(edgeId)
            if (previousEdge) affectedNodeIds.add(previousEdge.target)
        }

        for (const [nodeId] of previousSnapshot.nodes) {
            if (snapshot.nodes.has(nodeId)) continue

            // A removed source can change the rules and edge levels of every
            // remaining target it used to regulate.
            for (const [previousEdgeId, previousEdge] of previousSnapshot.edges) {
                if (previousEdge.source === nodeId) {
                    affectedNodeIds.add(previousEdge.target)
                    affectedEdgeIds.add(previousEdgeId)
                }
            }
        }

        for (const [edgeId, previousEdge] of previousSnapshot.edges) {
            if (snapshot.edges.has(edgeId)) continue

            // The former target must be rechecked when an incoming edge is
            // deleted, even though that edge no longer exists in the index.
            if (snapshot.nodes.has(previousEdge.target)) {
                affectedNodeIds.add(previousEdge.target)
            }
            affectedEdgeIds.add(edgeId)
        }
    }

    let ruleEvaluations = 0
    let edgeLevelEvaluations = 0
    let nodesChanged = false
    let edgesChanged = false

    const nextNodes = nodes.map((node) => {
        if (!affectedNodeIds.has(node.id) || node.data.rules.length === 0) {
            return node
        }

        const incomingNodes = indexes.incomingNodesByTargetId.get(node.id) ?? []
        const incomingEdges = indexes.incomingEdgesByTargetId.get(node.id) ?? []
        const nextRules = node.data.rules.map((rule) => {
            ruleEvaluations++
            const hasTargetConflict = node.data.rules.some(
                (currentRule) =>
                    currentRule.id !== rule.id &&
                    currentRule.target === rule.target
            )
            const isValid =
                !hasTargetConflict &&
                isRegulatoryRuleExpressionValid(
                    rule.expression,
                    incomingNodes,
                    incomingEdges
                )

            return rule.isValid === isValid ? rule : { ...rule, isValid }
        })

        if (nextRules.every((rule, index) => rule === node.data.rules[index])) {
            return node
        }

        nodesChanged = true
        return { ...node, data: { ...node.data, rules: nextRules } }
    })

    const nextEdges = edges.map((edge) => {
        if (!affectedEdgeIds.has(edge.id) || !edge.data) return edge

        const sourceActivityLevels = indexes.nodeById.get(edge.source)?.data
            .activityLevels
        const nextLevels = edge.data.levels.map((level) => {
            edgeLevelEvaluations++
            const hasConflict = edge.data?.levels.some(
                (currentLevel) =>
                    currentLevel.id !== level.id &&
                    currentLevel.target === level.target
            ) ?? false
            const isWithinSourceRange =
                sourceActivityLevels === undefined ||
                level.target <= sourceActivityLevels
            const isValid = !hasConflict && isWithinSourceRange

            return level.isValid === isValid ? level : { ...level, isValid }
        })

        if (edge.data.levels.every((level, index) => level === nextLevels[index])) {
            return edge
        }

        edgesChanged = true
        return { ...edge, data: { ...edge.data, levels: nextLevels } }
    })

    return {
        nodes: nextNodes,
        edges: nextEdges,
        snapshot,
        nodesChanged,
        edgesChanged,
        stats: {
            ruleEvaluations,
            edgeLevelEvaluations,
            changedNodeIds,
            changedEdgeIds,
        },
    }
}
