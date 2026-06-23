import {
    RegulatoryNodeNameSchema,
    type EditableRegulatoryEdge,
    type InternalGRNModel,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Edge, Node } from '@xyflow/react'
import {
    buildGinmlAnnotationObject,
    parseGinmlAnnotations,
} from './annotations'
import { GINML_DEFAULTS, GINML_DOCTYPE, GINML_NAMESPACES } from './constants'
import { createEdgesFromGinml } from './edges'
import {
    collectRawRulesFromNode,
    materializeGinmlRules,
    toGinmlExpressionSyntax,
} from './rules'
import {
    asRecord,
    buildXml,
    ensureArray,
    getAttribute,
    getBooleanAttribute,
    getNumberAttribute,
    parseXml,
    type XmlRecord,
} from './xml'

interface RawNodeDescriptor {
    node: Node<RegulatoryNodeProperties>
    rawRules: ReturnType<typeof collectRawRulesFromNode>
    style?: string
}

export function importGinmlModel(xml: string): InternalGRNModel {
    const parsedXml = parseXml(xml)
    const graph = asRecord(asRecord(parsedXml.gxl)?.graph)

    if (!graph) {
        throw new Error('GINML document is missing the graph element.')
    }

    const nodeDescriptors = createNodeDescriptors(graph)
    const nodesById = new Map(
        nodeDescriptors.map((descriptor) => [
            descriptor.node.id,
            descriptor.node,
        ])
    )
    const edges = createEdgesFromGinml(graph, nodesById)
    const nodes = nodeDescriptors.map((descriptor) =>
        materializeNode(descriptor, nodeDescriptors, edges)
    )

    return {
        title: getAttribute(graph, 'id') ?? 'ginml-model',
        annotations: parseGinmlAnnotations(graph.annotation),
        nodes,
        edges,
    }
}

export function exportGinmlModel(model: InternalGRNModel): string {
    const graph: XmlRecord = {
        '@_class': 'regulatory',
        '@_id': model.title || 'regulatoryGraph',
        '@_nodeorder': model.nodes.map((node) => node.id).join(' '),
        nodestyle: buildDefaultNodeStyles(),
        edgestyle: buildDefaultEdgeStyles(),
        node: model.nodes.map((node) => buildNodeObject(node)),
        edge: model.edges.map((edge) => buildEdgeObject(edge)),
    }

    const graphAnnotation = buildGinmlAnnotationObject(model.annotations)
    if (graphAnnotation) {
        graph.annotation = graphAnnotation
    }

    const xml = buildXml({
        '?xml': {
            '@_version': '1.0',
            '@_encoding': 'UTF-8',
        },
        gxl: {
            '@_xmlns:xlink': GINML_NAMESPACES.xlink,
            '@_xmlns:grn': GINML_NAMESPACES.grn,
            graph,
        },
    })

    return xml.replace(
        /^<\?xml[^>]*\?>\n?/,
        (declaration) => `${declaration}${GINML_DOCTYPE}\n`
    )
}

function createNodeDescriptors(graph: XmlRecord): RawNodeDescriptor[] {
    const nodeRecords = ensureArray(graph.node)

    return nodeRecords.map((nodeEntry) => {
        const nodeRecord = asRecord(nodeEntry) ?? {}
        const nodeId = getAttribute(nodeRecord, 'id')

        if (!nodeId) {
            throw new Error('GINML node is missing its id.')
        }

        const position = asRecord(nodeRecord.nodevisualsetting)
        const name = getAttribute(nodeRecord, 'name') ?? nodeId

        return {
            node: {
                id: nodeId,
                position: {
                    x: getNumberAttribute(position, 'x') ?? 0,
                    y: getNumberAttribute(position, 'y') ?? 0,
                },
                data: {
                    name,
                    activityLevels:
                        getNumberAttribute(nodeRecord, 'maxvalue') ?? 1,
                    isInputNode:
                        getBooleanAttribute(nodeRecord, 'input') ?? false,
                    isValid: RegulatoryNodeNameSchema.safeParse(name).success,
                    annotations: parseGinmlAnnotations(nodeRecord.annotation),
                    rules: [],
                },
            },
            rawRules: collectRawRulesFromNode(nodeRecord),
            style: getAttribute(position, 'style'),
        }
    })
}

function materializeNode(
    descriptor: RawNodeDescriptor,
    allDescriptors: RawNodeDescriptor[],
    edges: Edge<EditableRegulatoryEdge>[]
) {
    const allNodes = allDescriptors.map((entry) => entry.node)

    return {
        ...descriptor.node,
        data: {
            ...descriptor.node.data,
            rules: materializeGinmlRules({
                rawRules: descriptor.rawRules,
                targetNode: descriptor.node,
                nodes: allNodes,
                edges,
            }),
        },
        ...(descriptor.style !== undefined
            ? { style: { ginmlStyle: descriptor.style } }
            : {}),
    }
}

function buildDefaultNodeStyles(): XmlRecord[] {
    return [
        {
            '@_background': '#ffffff',
            '@_foreground': '#000000',
            '@_text': '#000000',
            '@_shape': 'RECTANGLE',
            '@_width': String(GINML_DEFAULTS.nodeWidth),
            '@_height': String(GINML_DEFAULTS.nodeHeight),
        },
        {
            '@_name': 'Input',
            '@_background': '#99ffff',
            '@_text': '#000000',
            '@_width': '125',
        },
    ]
}

function buildDefaultEdgeStyles(): XmlRecord[] {
    return [
        {
            '@_color': '#000000',
            '@_pattern': 'SIMPLE',
            '@_line_width': '3',
            '@_properties': 'positive:#00c800 negative:#c80000 dual:#0000c8',
        },
    ]
}

function buildNodeObject(node: Node<RegulatoryNodeProperties>): XmlRecord {
    const groupedRules = new Map<number, string[]>()
    for (const rule of node.data.rules) {
        const expressions = groupedRules.get(rule.target) ?? []
        expressions.push(rule.expression.trim())
        groupedRules.set(rule.target, expressions)
    }

    const values: XmlRecord[] = []
    const parameters: XmlRecord[] = []

    for (const [target, expressions] of groupedRules) {
        const literalExpressions = expressions.filter((expression) =>
            /^\d+$/.test(expression)
        )
        const directExpressions = expressions.filter(
            (expression) => !/^\d+$/.test(expression)
        )

        if (directExpressions.length > 0) {
            values.push({
                '@_val': String(target),
                exp: directExpressions.map((expression) => ({
                    '@_str': toGinmlExpressionSyntax(expression),
                })),
            })
        } else if (literalExpressions.length > 0) {
            parameters.push({
                '@_val': String(target),
            })
        }
    }

    const annotation = buildGinmlAnnotationObject(node.data.annotations)
    const nodeRecord: XmlRecord = {
        '@_id': node.id,
        '@_name': node.data.name,
        '@_maxvalue': String(node.data.activityLevels),
        ...(node.data.isInputNode ? { '@_input': 'true' } : {}),
        ...(values.length > 0 ? { value: values } : {}),
        ...(parameters.length > 0 ? { parameter: parameters } : {}),
        ...(annotation ? { annotation } : {}),
        nodevisualsetting: {
            '@_x': String(node.position.x),
            '@_y': String(node.position.y),
            '@_style': node.data.isInputNode ? 'Input' : '',
        },
    }

    return nodeRecord
}

function buildEdgeObject(edge: Edge<EditableRegulatoryEdge>): XmlRecord {
    const edgeData = edge.data
    const levels = [...(edgeData?.levels ?? [])].sort(
        (left, right) => left.target - right.target
    )
    const edgeRecord: XmlRecord = {
        '@_id': String(edge.id),
        '@_from': String(edge.source),
        '@_to': String(edge.target),
    }

    if (levels.length === 1) {
        const firstLevel = levels[0]
        if (!firstLevel) {
            return edgeRecord
        }
        edgeRecord['@_minvalue'] = String(firstLevel.target)
        edgeRecord['@_sign'] =
            firstLevel.type === 'activation' ? 'positive' : 'negative'
    } else if (levels.length > 1) {
        edgeRecord['@_effects'] = levels
            .map(
                (level) =>
                    `${level.target}:${level.type === 'activation' ? 'positive' : 'negative'}`
            )
            .join(' ')
    }

    const annotation = buildGinmlAnnotationObject(edgeData?.annotations)
    const edgeVisualsettingAttributes: Record<string, string> = {
        '@_anchor':
            edge.source === edge.target
                ? GINML_DEFAULTS.selfLoopAnchor
                : GINML_DEFAULTS.edgeAnchor,
        '@_style': '',
    }

    edgeRecord.edgevisualsetting = edgeVisualsettingAttributes

    if (annotation) {
        edgeRecord.annotation = annotation
    }

    return edgeRecord
}
