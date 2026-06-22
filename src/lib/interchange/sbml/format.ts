import { isRegulatoryRuleExpressionValid } from '@/lib/regulatory-rules'
import {
    InteractionType,
    RegulatoryNodeNameSchema,
    type EditableRegulatoryEdge,
    type InternalGRNModel,
    type PersistedAnnotations,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Edge, Node } from '@xyflow/react'
import { nanoid } from 'nanoid'
import {
    annotationsToPlainText,
    mergeAnnotations,
    parseSbmlAnnotations,
} from './annotations'
import {
    DEFAULT_NODE_POSITION,
    GRN_ANNOTATIONS_TAG,
    GRN_PAYLOAD_TAG,
    SBML_LAYOUT,
    SBML_NAMESPACES,
} from './constants'
import { buildExpressionMathMl, parseMathMlToExpression } from './mathml'
import {
    asRecord,
    buildXml,
    compactText,
    ensureArray,
    getAttribute,
    getBooleanAttribute,
    getNumberAttribute,
    parseXml,
    type XmlRecord,
} from './xml'

interface ImportedTransitionRule {
    target: number
    expression: string
}

type MutableEdge = Edge<EditableRegulatoryEdge>

export function importSbmlModel(xml: string): InternalGRNModel {
    const parsedXml = parseXml(xml)
    const sbml = asRecord(parsedXml.sbml)
    const model = asRecord(sbml?.model)

    if (!sbml || !model) {
        throw new Error('SBML document is missing the root model element.')
    }

    const qualitativeSpecies = ensureArray(
        asRecord(model['qual:listOfQualitativeSpecies'])?.[
            'qual:qualitativeSpecies'
        ]
    )
    const transitions = ensureArray(
        asRecord(model['qual:listOfTransitions'])?.['qual:transition']
    )

    if (qualitativeSpecies.length === 0) {
        throw new Error('SBML document does not contain qualitative species.')
    }

    if (transitions.length === 0) {
        throw new Error(
            'SBML document does not contain qualitative transitions.'
        )
    }

    const positionsByReference = parseLayoutPositions(model)
    const nodes = qualitativeSpecies.map((species) =>
        createNodeFromSpecies(asRecord(species) ?? {}, positionsByReference)
    )
    const nodesById = new Map(nodes.map((node) => [node.id, node]))
    const nodeNameById = new Map(nodes.map((node) => [node.id, node.data.name]))
    const activityLevelsByName = new Map(
        nodes.map((node) => [node.data.name, node.data.activityLevels])
    )
    const rulesByTarget = new Map<string, ImportedTransitionRule[]>()
    const edgesByKey = new Map<string, MutableEdge>()

    transitions.forEach((transitionValue) => {
        const transition = asRecord(transitionValue) ?? {}
        const outputs = ensureArray(
            asRecord(transition['qual:listOfOutputs'])?.['qual:output']
        )

        if (outputs.length !== 1) {
            throw new Error(
                'SBML transitions with zero or multiple outputs are not supported.'
            )
        }

        const output = asRecord(outputs[0]) ?? {}
        const targetSpeciesId = getAttribute(output, 'qual:qualitativeSpecies')

        if (!targetSpeciesId || !nodesById.has(targetSpeciesId)) {
            throw new Error(
                'SBML transition references an unknown output species.'
            )
        }

        const inputs = ensureArray(
            asRecord(transition['qual:listOfInputs'])?.['qual:input']
        )

        inputs.forEach((inputValue) => {
            const input = asRecord(inputValue) ?? {}
            const sourceSpeciesId = getAttribute(
                input,
                'qual:qualitativeSpecies'
            )
            const sign = getAttribute(input, 'qual:sign') ?? 'positive'
            const threshold =
                getNumberAttribute(input, 'qual:thresholdLevel') ?? 1

            if (!sourceSpeciesId || !nodesById.has(sourceSpeciesId)) {
                throw new Error(
                    'SBML transition references an unknown input species.'
                )
            }

            const edgeKey = `${sourceSpeciesId}->${targetSpeciesId}`
            const interactionType =
                sign === 'negative'
                    ? InteractionType.Inhibition
                    : InteractionType.Activation
            const inputAnnotations = parseSbmlAnnotations({
                notes: input.notes,
                annotation: input.annotation,
            })
            const currentEdge = edgesByKey.get(edgeKey)

            if (!currentEdge) {
                edgesByKey.set(edgeKey, {
                    id: edgeKey,
                    source: sourceSpeciesId,
                    target: targetSpeciesId,
                    data: {
                        levels: [
                            {
                                id: nanoid(),
                                type: interactionType,
                                target: threshold,
                                isValid: true,
                            },
                        ],
                        annotations: inputAnnotations,
                    },
                })
                return
            }

            const currentEdgeData = currentEdge.data

            if (!currentEdgeData) {
                return
            }

            currentEdgeData.levels.push({
                id: nanoid(),
                type: interactionType,
                target: threshold,
                isValid: true,
            })
            currentEdgeData.annotations = mergeAnnotations(
                currentEdgeData.annotations,
                inputAnnotations
            )
        })

        const functionTerms = ensureArray(
            asRecord(transition['qual:listOfFunctionTerms'])?.[
                'qual:functionTerm'
            ]
        )

        const rulesByLevel = new Map<number, string[]>()

        functionTerms.forEach((functionTermValue) => {
            const functionTerm = asRecord(functionTermValue) ?? {}
            const resultLevel = getNumberAttribute(
                functionTerm,
                'qual:resultLevel'
            )

            if (resultLevel === undefined) {
                throw new Error('SBML function term is missing a result level.')
            }

            const expression = parseMathMlToExpression(
                functionTerm.math,
                activityLevelsByName,
                nodeNameById
            )
            const expressions = rulesByLevel.get(resultLevel) ?? []
            expressions.push(expression)
            rulesByLevel.set(resultLevel, expressions)
        })

        const rules = Array.from(rulesByLevel.entries()).map(
            ([target, expressions]) => ({
                target,
                expression:
                    expressions.length === 1
                        ? (expressions[0] ?? '')
                        : expressions
                              .map((expression) =>
                                  expression.includes('&&')
                                      ? `(${expression})`
                                      : expression
                              )
                              .join(' || '),
            })
        )

        rulesByTarget.set(targetSpeciesId, rules)
    })

    const edges = Array.from(edgesByKey.values()).map((edge) =>
        normalizeImportedEdge(edge, nodesById)
    )

    const validatedNodes = nodes.map((node) => {
        const rules = rulesByTarget.get(node.id) ?? []
        const incomingNodes = edges
            .filter((edge) => edge.target === node.id)
            .map((edge) => nodesById.get(edge.source))
            .filter((value): value is Node<RegulatoryNodeProperties> => !!value)
        const incomingEdges = edges.filter((edge) => edge.target === node.id)

        return {
            ...node,
            data: {
                ...node.data,
                rules: rules.map((rule) => ({
                    id: nanoid(),
                    target: rule.target,
                    expression: rule.expression,
                    isValid: isRegulatoryRuleExpressionValid(
                        rule.expression,
                        incomingNodes,
                        incomingEdges
                    ),
                })),
                isValid: RegulatoryNodeNameSchema.safeParse(node.data.name)
                    .success,
            },
        }
    })

    return {
        title: getAttribute(model, 'id') ?? 'sbml-model',
        annotations: parseSbmlAnnotations({
            notes: model.notes,
            annotation: model.annotation,
        }),
        nodes: validatedNodes,
        edges,
    }
}

export function exportSbmlModel(model: InternalGRNModel): string {
    return buildXml({
        '?xml': {
            '@_version': '1.0',
            '@_encoding': 'UTF-8',
        },
        sbml: {
            '@_xmlns': SBML_NAMESPACES.sbml,
            '@_xmlns:qual': SBML_NAMESPACES.qual,
            '@_xmlns:layout': SBML_NAMESPACES.layout,
            '@_xmlns:rdf': SBML_NAMESPACES.rdf,
            '@_xmlns:bqbiol': SBML_NAMESPACES.bqbiol,
            '@_xmlns:grn': SBML_NAMESPACES.grn,
            '@_level': '3',
            '@_version': '1',
            '@_layout:required': 'false',
            '@_qual:required': 'true',
            model: buildSbmlModelObject(model),
        },
    })
}

function createNodeFromSpecies(
    species: XmlRecord,
    positionsByReference: Map<string, { x: number; y: number }>
): Node<RegulatoryNodeProperties> {
    const speciesId = getAttribute(species, 'qual:id')

    if (!speciesId) {
        throw new Error('SBML qualitative species is missing its id.')
    }

    const annotations = parseSbmlAnnotations({
        notes: species.notes,
        annotation: species.annotation,
    })

    return {
        id: speciesId,
        position: positionsByReference.get(speciesId) ?? {
            ...DEFAULT_NODE_POSITION,
        },
        data: {
            name: getAttribute(species, 'qual:name') ?? speciesId,
            activityLevels: getNumberAttribute(species, 'qual:maxLevel') ?? 1,
            isInputNode: getBooleanAttribute(species, 'qual:constant') ?? false,
            rules: [],
            isValid: true,
            annotations,
        },
    }
}

function parseLayoutPositions(
    model: XmlRecord
): Map<string, { x: number; y: number }> {
    const layouts = ensureArray(
        asRecord(model['layout:listOfLayouts'])?.['layout:layout']
    )
    const positions = new Map<string, { x: number; y: number }>()

    layouts.forEach((layoutValue) => {
        const layout = asRecord(layoutValue)
        const glyphs = ensureArray(
            asRecord(layout?.['layout:listOfAdditionalGraphicalObjects'])?.[
                'layout:generalGlyph'
            ]
        )

        glyphs.forEach((glyphValue) => {
            const glyph = asRecord(glyphValue)
            const reference = getAttribute(glyph, 'layout:reference')
            const boundingBox = asRecord(glyph?.['layout:boundingBox'])
            const position = asRecord(boundingBox?.['layout:position'])

            if (!reference || !position) {
                return
            }

            const x = getNumberAttribute(position, 'layout:x')
            const y = getNumberAttribute(position, 'layout:y')

            if (x === undefined || y === undefined) {
                return
            }

            positions.set(reference, { x, y })
        })
    })

    return positions
}

function normalizeImportedEdge(
    edge: MutableEdge,
    nodesById: Map<string, Node<RegulatoryNodeProperties>>
): MutableEdge {
    const sourceNode = nodesById.get(edge.source)
    const seenPairs = new Set<string>()
    const edgeData = edge.data

    if (!edgeData) {
        return edge
    }

    edgeData.levels = edgeData.levels.map((level) => {
        const pairKey = `${level.type}:${level.target}`
        const isWithinSourceRange =
            level.target <= (sourceNode?.data.activityLevels ?? 0)
        const isUnique = !seenPairs.has(pairKey)

        seenPairs.add(pairKey)

        return {
            ...level,
            isValid: isWithinSourceRange && isUnique,
        }
    })

    return edge
}

function buildSbmlModelObject(model: InternalGRNModel): XmlRecord {
    return {
        '@_id': model.title || 'model_id',
        '@_metaid': '_grn_model',
        ...buildNotesEntry(model.annotations),
        ...buildAnnotationEntry(model.annotations, '_grn_model'),
        ...buildLayoutEntry(model.nodes),
        ...buildSpeciesEntry(model.nodes),
        ...buildTransitionsEntry(model),
    }
}

function buildLayoutEntry(nodes: InternalGRNModel['nodes']): XmlRecord {
    const maxX =
        Math.max(...nodes.map((node) => node.position.x), 0) +
        SBML_LAYOUT.nodeWidth
    const maxY =
        Math.max(...nodes.map((node) => node.position.y), 0) +
        SBML_LAYOUT.nodeHeight

    return {
        'layout:listOfLayouts': {
            'layout:layout': {
                '@_layout:id': '__layout__',
                'layout:dimensions': {
                    '@_layout:width': String(maxX),
                    '@_layout:height': String(maxY),
                },
                'layout:listOfAdditionalGraphicalObjects': {
                    'layout:generalGlyph': nodes.map((node) => ({
                        '@_layout:id': `_ly_${sanitizeIdentifier(node.id)}`,
                        '@_layout:reference': node.id,
                        'layout:boundingBox': {
                            'layout:position': {
                                '@_layout:x': String(node.position.x),
                                '@_layout:y': String(node.position.y),
                            },
                            'layout:dimensions': {
                                '@_layout:width': String(SBML_LAYOUT.nodeWidth),
                                '@_layout:height': String(
                                    SBML_LAYOUT.nodeHeight
                                ),
                            },
                        },
                    })),
                },
            },
        },
    }
}

function buildSpeciesEntry(nodes: InternalGRNModel['nodes']): XmlRecord {
    return {
        'qual:listOfQualitativeSpecies': {
            'qual:qualitativeSpecies': nodes.map((node) => {
                const metaid = `_grn_node_${sanitizeIdentifier(node.id)}`

                return {
                    '@_metaid': metaid,
                    '@_qual:id': node.id,
                    '@_qual:name': node.data.name,
                    '@_qual:compartment': 'default',
                    '@_qual:constant': String(node.data.isInputNode),
                    '@_qual:maxLevel': String(node.data.activityLevels),
                    ...buildNotesEntry(node.data.annotations),
                    ...buildAnnotationEntry(node.data.annotations, metaid),
                }
            }),
        },
    }
}

function buildTransitionsEntry(model: InternalGRNModel): XmlRecord {
    const activityLevelsByName = new Map(
        model.nodes.map((node) => [node.data.name, node.data.activityLevels])
    )
    const speciesIdByName = new Map(
        model.nodes.map((node) => [node.data.name, node.id])
    )

    return {
        'qual:listOfTransitions': {
            'qual:transition': model.nodes.map((node) => {
                const incomingEdges = model.edges.filter(
                    (edge) => edge.target === node.id
                )

                return {
                    '@_qual:id': `tr_${sanitizeIdentifier(node.id)}_`,
                    ...(incomingEdges.length > 0
                        ? {
                              'qual:listOfInputs': {
                                  'qual:input': incomingEdges.flatMap(
                                      (edge) => {
                                          const edgeLevels =
                                              edge.data?.levels ?? []

                                          return edgeLevels.map(
                                              (level, index) => {
                                                  const inputMetaid = `_grn_edge_${sanitizeIdentifier(
                                                      edge.id
                                                  )}_${index + 1}`

                                                  return {
                                                      '@_metaid': inputMetaid,
                                                      '@_qual:id': `${sanitizeIdentifier(edge.id)}_in_${index + 1}`,
                                                      '@_qual:qualitativeSpecies':
                                                          edge.source,
                                                      '@_qual:transitionEffect':
                                                          'none',
                                                      '@_qual:sign':
                                                          level.type ===
                                                          InteractionType.Inhibition
                                                              ? 'negative'
                                                              : 'positive',
                                                      '@_qual:thresholdLevel':
                                                          String(level.target),
                                                      ...buildNotesEntry(
                                                          edge.data?.annotations
                                                      ),
                                                      ...buildAnnotationEntry(
                                                          edge.data
                                                              ?.annotations,
                                                          inputMetaid
                                                      ),
                                                  }
                                              }
                                          )
                                      }
                                  ),
                              },
                          }
                        : {}),
                    'qual:listOfOutputs': {
                        'qual:output': {
                            '@_qual:id': `tr_${sanitizeIdentifier(node.id)}_out`,
                            '@_qual:qualitativeSpecies': node.id,
                            '@_qual:transitionEffect': 'assignmentLevel',
                        },
                    },
                    'qual:listOfFunctionTerms': {
                        'qual:defaultTerm': {
                            '@_qual:resultLevel':
                                node.data.rules.length === 0 ? '1' : '0',
                        },
                        ...(node.data.rules.length > 0
                            ? {
                                  'qual:functionTerm': node.data.rules.map(
                                      (rule) => ({
                                          '@_qual:resultLevel': String(
                                              rule.target
                                          ),
                                          math: {
                                              '@_xmlns': SBML_NAMESPACES.mathml,
                                              ...buildExpressionMathMl(
                                                  rule.expression,
                                                  activityLevelsByName,
                                                  speciesIdByName
                                              ),
                                          },
                                      })
                                  ),
                              }
                            : {}),
                    },
                }
            }),
        },
    }
}

function buildNotesEntry(
    annotations: PersistedAnnotations | undefined
): XmlRecord {
    const text = compactText(annotationsToPlainText(annotations))

    if (text.length === 0) {
        return {}
    }

    return {
        notes: {
            body: {
                '@_xmlns': SBML_NAMESPACES.xhtml,
                p: text
                    .split(/\n{2,}/)
                    .map((paragraph) => ({ '#text': paragraph.trim() })),
            },
        },
    }
}

function buildAnnotationEntry(
    annotations: PersistedAnnotations | undefined,
    metaid: string
): XmlRecord {
    const references = annotations?.references?.filter(
        (reference) => reference.trim().length > 0
    )
    const hasCustomPayload = annotations !== undefined

    if ((!references || references.length === 0) && !hasCustomPayload) {
        return {}
    }

    const annotation: XmlRecord = {}

    if (references && references.length > 0) {
        annotation['rdf:RDF'] = {
            'rdf:Description': {
                '@_rdf:about': `#${metaid}`,
                'bqbiol:unknownQualifier': references.map((reference) => ({
                    'rdf:Bag': {
                        'rdf:li': {
                            '@_rdf:resource': reference,
                        },
                    },
                })),
            },
        }
    }

    if (hasCustomPayload) {
        annotation[GRN_ANNOTATIONS_TAG] = {
            '@_grn:version': '1',
            [GRN_PAYLOAD_TAG]: {
                '#text': JSON.stringify(annotations),
            },
        }
    }

    return {
        annotation,
    }
}

function sanitizeIdentifier(value: string): string {
    return value.replace(/[^a-zA-Z0-9_]/g, '_')
}
