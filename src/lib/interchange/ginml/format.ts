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
import {
    DEFAULT_NODE_SHAPE,
    NODE_SHAPE_STYLE_PROPERTY,
    type RegulatoryNodeShape,
    type RegulatoryNodeStyle,
} from '@/components/views/editor/graph/node-style'

interface RawNodeDescriptor {
    node: Node<RegulatoryNodeProperties>
    rawRules: ReturnType<typeof collectRawRulesFromNode>
    style?: string
    shape: RegulatoryNodeShape
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
    const ginmlNodeIdsByInternalId = createGinmlNodeIdMap(model)
    const graphId = sanitizeGinmlIdentifier(
        model.title || 'regulatoryGraph',
        'regulatoryGraph'
    )
    const layoutTransform = createGinmlLayoutTransform(model)
    const exportedNodeGeometryById = createExportedNodeGeometryMap(
        model,
        layoutTransform
    )
    const graphAnnotation = buildGinmlAnnotationObject(model.annotations)
    const hasCustomAnnotations =
        graphAnnotation !== undefined ||
        model.nodes.some(
            (node) =>
                buildGinmlAnnotationObject(node.data.annotations) !== undefined
        ) ||
        model.edges.some(
            (edge) =>
                buildGinmlAnnotationObject(edge.data?.annotations) !== undefined
        )
    const graph: XmlRecord = {
        '@_class': 'regulatory',
        '@_id': graphId,
        '@_nodeorder': model.nodes
            .map(
                (node) =>
                    ginmlNodeIdsByInternalId.get(node.id) ?? String(node.id)
            )
            .join(' '),
        attr: {
            '@_name': 'display.node',
            '@_value': 'name',
        },
        nodestyle: buildDefaultNodeStyles(model),
        edgestyle: buildDefaultEdgeStyles(),
        node: model.nodes.map((node) =>
            buildNodeObject(
                node,
                ginmlNodeIdsByInternalId.get(node.id) ?? String(node.id),
                layoutTransform
            )
        ),
        edge: model.edges.map((edge) =>
            buildEdgeObject(
                edge,
                model,
                ginmlNodeIdsByInternalId,
                layoutTransform,
                exportedNodeGeometryById
            )
        ),
    }

    if (graphAnnotation) {
        graph.annotation = graphAnnotation
    }

    const gxl: XmlRecord = {
        '@_xmlns:xlink': GINML_NAMESPACES.xlink,
        graph,
    }

    if (hasCustomAnnotations) {
        gxl['@_xmlns:grn'] = GINML_NAMESPACES.grn
    }

    const xml = buildXml({
        '?xml': {
            '@_version': '1.0',
            '@_encoding': 'UTF-8',
        },
        gxl,
    })

    return xml.replace(
        /^<\?xml[^>]*\?>\n?/,
        (declaration) => `${declaration}${GINML_DOCTYPE}\n`
    )
}

function createGinmlNodeIdMap(model: InternalGRNModel) {
    const seenIds = new Set<string>()

    return new Map(
        model.nodes.map((node) => [
            node.id,
            createUniqueGinmlIdentifier(
                node.data.name.trim() || String(node.id),
                seenIds,
                'node'
            ),
        ])
    )
}

function createUniqueGinmlIdentifier(
    value: string,
    seenIds: Set<string>,
    fallback: string
) {
    const baseIdentifier = sanitizeGinmlIdentifier(value, fallback)

    if (!seenIds.has(baseIdentifier)) {
        seenIds.add(baseIdentifier)
        return baseIdentifier
    }

    let suffix = 2
    let candidate = `${baseIdentifier}_${suffix}`

    while (seenIds.has(candidate)) {
        suffix += 1
        candidate = `${baseIdentifier}_${suffix}`
    }

    seenIds.add(candidate)
    return candidate
}

function sanitizeGinmlIdentifier(value: string, fallback: string) {
    const source = value.trim() || fallback
    const sanitized = source.replace(/[^A-Za-z0-9_]/g, '_')
    const normalized = sanitized.replace(/_+/g, '_').replace(/^_+|_+$/g, '')

    if (normalized.length === 0) {
        return fallback
    }

    return /^[A-Za-z_]/.test(normalized) ? normalized : `n_${normalized}`
}

function createNodeDescriptors(graph: XmlRecord): RawNodeDescriptor[] {
    const nodeStylesByName = buildNodeStyleShapeMap(graph)
    const defaultShape = nodeStylesByName.get('') ?? 'rectangle'
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
            shape:
                nodeStylesByName.get(getAttribute(position, 'style') ?? '') ??
                defaultShape,
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
            ? {
                  style: {
                      ginmlStyle: descriptor.style,
                      [NODE_SHAPE_STYLE_PROPERTY]: descriptor.shape,
                  } as RegulatoryNodeStyle,
              }
            : {
                  style: {
                      [NODE_SHAPE_STYLE_PROPERTY]: descriptor.shape,
                  } as RegulatoryNodeStyle,
              }),
    }
}

function buildDefaultNodeStyles(model: InternalGRNModel): XmlRecord[] {
    const styles: XmlRecord[] = [
        {
            '@_background': '#ffffff',
            '@_foreground': '#000000',
            '@_text': '#000000',
            '@_shape': 'RECTANGLE',
            '@_width': String(GINML_DEFAULTS.nodeWidth),
            '@_height': String(GINML_DEFAULTS.nodeHeight),
        },
    ]

    const exportedStyleNames = new Set(
        model.nodes.map((node) =>
            getGinmlNodeStyleName(node.style, node.data.isInputNode)
        )
    )

    if (exportedStyleNames.has('RoundedRectangle')) {
        styles.push({
            '@_name': 'RoundedRectangle',
            '@_background': '#ffffff',
            '@_foreground': '#000000',
            '@_text': '#000000',
            '@_shape': 'ROUND_RECTANGLE',
            '@_width': String(GINML_DEFAULTS.nodeWidth),
            '@_height': String(GINML_DEFAULTS.nodeHeight),
        })
    }

    if (exportedStyleNames.has('Ellipse')) {
        styles.push({
            '@_name': 'Ellipse',
            '@_background': '#ffffff',
            '@_foreground': '#000000',
            '@_text': '#000000',
            '@_shape': 'ELLIPSE',
            '@_width': String(GINML_DEFAULTS.nodeWidth),
            '@_height': String(GINML_DEFAULTS.nodeHeight),
        })
    }

    if (exportedStyleNames.has('Input')) {
        styles.push({
            '@_name': 'Input',
            '@_background': '#99ffff',
            '@_text': '#000000',
            '@_shape': 'ROUND_RECTANGLE',
            '@_width': String(GINML_DEFAULTS.inputNodeWidth),
        })
    }

    return styles
}

function buildDefaultEdgeStyles(): XmlRecord[] {
    return [
        {
            '@_color': '#000000',
            '@_pattern': 'SIMPLE',
            '@_line_width': '1',
            '@_properties': 'positive:#00c800 negative:#c80000 dual:#0000c8',
        },
    ]
}

function buildNodeObject(
    node: Node<RegulatoryNodeProperties>,
    ginmlNodeId: string,
    layoutTransform: (point: { x: number; y: number }) => {
        x: number
        y: number
    }
): XmlRecord {
    const style = node.style
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
    const includeNameAttribute = node.data.name !== ginmlNodeId
    const exportedDimensions = getGinmlExportedNodeDimensions(
        style,
        node.data.isInputNode
    )
    const sourceDimensions = getCurrentNodeDimensions(style, exportedDimensions)
    const exportedPosition = layoutTransform({
        x:
            node.position.x +
            (sourceDimensions.width - exportedDimensions.width) / 2,
        y:
            node.position.y +
            (sourceDimensions.height - exportedDimensions.height) / 2,
    })
    const nodeRecord: XmlRecord = {
        '@_id': ginmlNodeId,
        ...(includeNameAttribute ? { '@_name': node.data.name } : {}),
        '@_maxvalue': String(node.data.activityLevels),
        ...(node.data.isInputNode ? { '@_input': 'true' } : {}),
        ...(values.length > 0 ? { value: values } : {}),
        ...(parameters.length > 0 ? { parameter: parameters } : {}),
        ...(annotation ? { annotation } : {}),
        nodevisualsetting: {
            '@_x': String(Math.round(exportedPosition.x)),
            '@_y': String(Math.round(exportedPosition.y)),
            '@_style': getGinmlNodeStyleName(style, node.data.isInputNode),
        },
    }

    return nodeRecord
}

function buildNodeStyleShapeMap(graph: XmlRecord) {
    const nodeStyles = ensureArray(graph.nodestyle)
    const nodeStylesByName = new Map<string, RegulatoryNodeShape>()

    nodeStyles.forEach((entry, index) => {
        const style = asRecord(entry)
        if (!style) {
            return
        }

        const styleName = getAttribute(style, 'name') ?? (index === 0 ? '' : '')
        nodeStylesByName.set(styleName, toRegulatoryNodeShape(style))
    })

    return nodeStylesByName
}

function toRegulatoryNodeShape(
    style: XmlRecord | undefined
): RegulatoryNodeShape {
    const rawShape = getAttribute(style, 'shape')

    switch (rawShape) {
        case 'RECTANGLE':
            return 'rectangle'
        case 'ELLIPSE':
            return 'ellipse'
        case 'ROUND_RECTANGLE':
            return 'rounded-rectangle'
        default:
            return DEFAULT_NODE_SHAPE
    }
}

function getGinmlNodeStyleName(
    style: RegulatoryNodeStyle | undefined,
    isInputNode: boolean
): string {
    const persistedGinmlStyle = getPersistedGinmlStyle(style)
    const explicitShape = style?.[NODE_SHAPE_STYLE_PROPERTY]

    if (
        persistedGinmlStyle !== undefined &&
        !hasExplicitShapeOverride(
            explicitShape,
            persistedGinmlStyle,
            isInputNode
        )
    ) {
        return persistedGinmlStyle
    }

    if (isInputNode) {
        return 'Input'
    }

    if (
        explicitShape !== 'rectangle' &&
        explicitShape !== 'rounded-rectangle' &&
        explicitShape !== 'ellipse'
    ) {
        return ''
    }

    switch (explicitShape) {
        case 'rectangle':
            return ''
        case 'ellipse':
            return 'Ellipse'
        default:
            return 'RoundedRectangle'
    }
}

function getPersistedGinmlStyle(style: RegulatoryNodeStyle | undefined) {
    const value: unknown =
        style && 'ginmlStyle' in style
            ? Reflect.get(style, 'ginmlStyle')
            : undefined

    return typeof value === 'string' ? value : undefined
}

function getGinmlExportedNodeDimensions(
    style: RegulatoryNodeStyle | undefined,
    isInputNode: boolean
) {
    if (isInputNode || getGinmlNodeStyleName(style, isInputNode) === 'Input') {
        return {
            width: GINML_DEFAULTS.inputNodeWidth,
            height: GINML_DEFAULTS.nodeHeight,
        }
    }

    return {
        width: GINML_DEFAULTS.nodeWidth,
        height: GINML_DEFAULTS.nodeHeight,
    }
}

function getCurrentNodeDimensions(
    style: RegulatoryNodeStyle | undefined,
    fallback: { width: number; height: number }
) {
    const width =
        typeof style?.width === 'number'
            ? style.width
            : typeof style?.width === 'string'
              ? Number(style.width)
              : fallback.width
    const height =
        typeof style?.height === 'number'
            ? style.height
            : typeof style?.height === 'string'
              ? Number(style.height)
              : fallback.height

    return {
        width: Number.isFinite(width) ? width : fallback.width,
        height: Number.isFinite(height) ? height : fallback.height,
    }
}

function hasExplicitShapeOverride(
    explicitShape: unknown,
    persistedGinmlStyle: string,
    isInputNode: boolean
) {
    if (
        explicitShape !== 'rectangle' &&
        explicitShape !== 'rounded-rectangle' &&
        explicitShape !== 'ellipse'
    ) {
        return false
    }

    return (
        explicitShape !==
        inferShapeFromGinmlStyle(persistedGinmlStyle, isInputNode)
    )
}

function inferShapeFromGinmlStyle(
    ginmlStyle: string,
    isInputNode: boolean
): RegulatoryNodeShape {
    if (isInputNode || ginmlStyle === 'Input') {
        return 'rounded-rectangle'
    }

    switch (ginmlStyle) {
        case '':
        case 'Rectangle':
            return 'rectangle'
        case 'Ellipse':
            return 'ellipse'
        case 'RoundedRectangle':
        default:
            return 'rounded-rectangle'
    }
}

function buildEdgeObject(
    edge: Edge<EditableRegulatoryEdge>,
    model: InternalGRNModel,
    ginmlNodeIdsByInternalId: Map<string, string>,
    layoutTransform: (point: { x: number; y: number }) => {
        x: number
        y: number
    },
    exportedNodeGeometryById: Map<
        string,
        { x: number; y: number; width: number; height: number }
    >
): XmlRecord {
    const edgeData = edge.data
    const levels = [...(edgeData?.levels ?? [])].sort(
        (left, right) => left.target - right.target
    )
    const sourceId =
        ginmlNodeIdsByInternalId.get(String(edge.source)) ?? String(edge.source)
    const targetId =
        ginmlNodeIdsByInternalId.get(String(edge.target)) ?? String(edge.target)
    const edgeRecord: XmlRecord = {
        '@_id': `${sourceId}:${targetId}`,
        '@_from': sourceId,
        '@_to': targetId,
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

    const explicitPoints = edgeData?.points
        ?.filter((point) => point.active)
        .map((point) => layoutTransform(point))
    const points =
        explicitPoints && explicitPoints.length > 0
            ? explicitPoints
            : createReverseEdgeMidpoint(edge, model, exportedNodeGeometryById)

    if (points && points.length > 0) {
        edgeVisualsettingAttributes['@_points'] = points
            .map((point) => `${Math.round(point.x)},${Math.round(point.y)}`)
            .join(' ')
    }

    edgeRecord.edgevisualsetting = edgeVisualsettingAttributes

    if (annotation) {
        edgeRecord.annotation = annotation
    }

    return edgeRecord
}

function createExportedNodeGeometryMap(
    model: InternalGRNModel,
    layoutTransform: (point: { x: number; y: number }) => {
        x: number
        y: number
    }
) {
    return new Map(
        model.nodes.map((node) => {
            const exportedDimensions = getGinmlExportedNodeDimensions(
                node.style,
                node.data.isInputNode
            )
            const sourceDimensions = getCurrentNodeDimensions(
                node.style,
                exportedDimensions
            )
            const position = layoutTransform({
                x:
                    node.position.x +
                    (sourceDimensions.width - exportedDimensions.width) / 2,
                y:
                    node.position.y +
                    (sourceDimensions.height - exportedDimensions.height) / 2,
            })

            return [
                String(node.id),
                {
                    x: position.x,
                    y: position.y,
                    width: exportedDimensions.width,
                    height: exportedDimensions.height,
                },
            ]
        })
    )
}

function createReverseEdgeMidpoint(
    edge: Edge<EditableRegulatoryEdge>,
    model: InternalGRNModel,
    exportedNodeGeometryById: Map<
        string,
        { x: number; y: number; width: number; height: number }
    >
) {
    const reverseEdge = model.edges.find(
        (candidate) =>
            candidate.id !== edge.id &&
            candidate.source === edge.target &&
            candidate.target === edge.source
    )

    if (!reverseEdge) {
        return undefined
    }

    const source = exportedNodeGeometryById.get(String(edge.source))
    const target = exportedNodeGeometryById.get(String(edge.target))

    if (!source || !target) {
        return undefined
    }

    return [
        {
            x: (source.x + source.width / 2 + target.x + target.width / 2) / 2,
            y:
                (source.y + source.height / 2 + target.y + target.height / 2) /
                    2 +
                GINML_DEFAULTS.reverseEdgeMidpointYOffset,
        },
    ]
}

function createGinmlLayoutTransform(model: InternalGRNModel) {
    const baseNodePositions = model.nodes.map((node) => {
        const exportedDimensions = getGinmlExportedNodeDimensions(
            node.style,
            node.data.isInputNode
        )
        const sourceDimensions = getCurrentNodeDimensions(
            node.style,
            exportedDimensions
        )

        return {
            x:
                node.position.x +
                (sourceDimensions.width - exportedDimensions.width) / 2,
            y:
                node.position.y +
                (sourceDimensions.height - exportedDimensions.height) / 2,
        }
    })

    const minX = Math.min(...baseNodePositions.map((position) => position.x), 0)
    const minY = Math.min(...baseNodePositions.map((position) => position.y), 0)

    return (point: { x: number; y: number }) => ({
        x:
            point.x +
            GINML_DEFAULTS.exportOffsetX +
            (point.x - minX) * (GINML_DEFAULTS.exportScaleX - 1),
        y:
            point.y +
            GINML_DEFAULTS.exportOffsetY +
            (point.y - minY) * (GINML_DEFAULTS.exportScaleY - 1),
    })
}
