import { isRegulatoryRuleExpressionValid } from '@/lib/regulatory-rules'
import {
    InteractionType,
    RegulatoryNodeNameSchema,
    type EditableRegulatoryEdge,
    type InternalGRNModel,
    type RegulatoryNodeProperties,
} from '@/lib/schema'
import type { Edge, Node } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { parseSbmlAnnotations } from './annotations'
import {
    DEFAULT_NODE_POSITION,
    SBML_DEFAULT_COMPARTMENT_ID,
    SBML_LAYOUT,
    SBML_NAMESPACES,
} from './constants'
import { buildExpressionMathMl, parseMathMlToExpression } from './mathml'
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
            const inputAnnotations = parseSbmlAnnotations({
                notes: input.notes,
                annotation: input.annotation,
            })
            const currentEdge = edgesByKey.get(edgeKey)
            const sourceNodeActivityLevels =
                nodesById.get(sourceSpeciesId)?.data.activityLevels ?? 1
            const interactionLevels =
                sign === 'dual'
                    ? [
                          {
                              type: InteractionType.Activation,
                              target:
                                  getNumberAttribute(
                                      input,
                                      'qual:thresholdLevel'
                                  ) ?? sourceNodeActivityLevels,
                          },
                          {
                              type: InteractionType.Inhibition,
                              target:
                                  getNumberAttribute(
                                      input,
                                      'qual:thresholdLevel'
                                  ) ?? 1,
                          },
                      ]
                    : [
                          {
                              type:
                                  sign === 'negative'
                                      ? InteractionType.Inhibition
                                      : InteractionType.Activation,
                              target: threshold,
                          },
                      ]

            if (!currentEdge) {
                edgesByKey.set(edgeKey, {
                    id: edgeKey,
                    source: sourceSpeciesId,
                    target: targetSpeciesId,
                    data: {
                        levels: interactionLevels.map((interactionLevel) => ({
                            id: nanoid(),
                            type: interactionLevel.type,
                            target: interactionLevel.target,
                            isValid: true,
                        })),
                        annotations: inputAnnotations,
                    },
                })
                return
            }

            const currentEdgeData = currentEdge.data

            if (!currentEdgeData) {
                return
            }

            interactionLevels.forEach((interactionLevel) => {
                currentEdgeData.levels.push({
                    id: nanoid(),
                    type: interactionLevel.type,
                    target: interactionLevel.target,
                    isValid: true,
                })
            })
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
    const sbmlNodeIdsByInternalId = createSbmlNodeIdMap(model.nodes)

    return {
        '@_id': 'model_id',
        ...buildLayoutEntry(model.nodes, sbmlNodeIdsByInternalId),
        ...buildSpeciesEntry(model.nodes, sbmlNodeIdsByInternalId),
        ...buildTransitionsEntry(model, sbmlNodeIdsByInternalId),
        ...buildCompartmentsEntry(),
    }
}

function buildLayoutEntry(
    nodes: InternalGRNModel['nodes'],
    sbmlNodeIdsByInternalId: Map<string, string>
): XmlRecord {
    const maxX = Math.max(
        ...nodes.map(
            (node) =>
                node.position.x +
                (node.data.isInputNode
                    ? SBML_LAYOUT.inputNodeWidth
                    : SBML_LAYOUT.nodeWidth)
        ),
        0
    )
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
                    'layout:generalGlyph': nodes.map((node) => {
                        const sbmlNodeId =
                            sbmlNodeIdsByInternalId.get(node.id) ?? node.id

                        return {
                            '@_layout:id': `_ly_${sanitizeIdentifier(
                                sbmlNodeId
                            )}`,
                            '@_layout:reference': sbmlNodeId,
                            'layout:boundingBox': {
                                'layout:position': {
                                    '@_layout:x': String(node.position.x),
                                    '@_layout:y': String(node.position.y),
                                },
                                'layout:dimensions': {
                                    '@_layout:width': String(
                                        node.data.isInputNode
                                            ? SBML_LAYOUT.inputNodeWidth
                                            : SBML_LAYOUT.nodeWidth
                                    ),
                                    '@_layout:height': String(
                                        SBML_LAYOUT.nodeHeight
                                    ),
                                },
                            },
                        }
                    }),
                },
            },
        },
    }
}

function buildSpeciesEntry(
    nodes: InternalGRNModel['nodes'],
    sbmlNodeIdsByInternalId: Map<string, string>
): XmlRecord {
    return {
        'qual:listOfQualitativeSpecies': {
            'qual:qualitativeSpecies': nodes.map((node) => {
                const sbmlNodeId =
                    sbmlNodeIdsByInternalId.get(node.id) ?? node.id

                return {
                    '@_qual:id': sbmlNodeId,
                    '@_qual:name': node.data.name,
                    '@_qual:compartment': SBML_DEFAULT_COMPARTMENT_ID,
                    '@_qual:constant': String(node.data.isInputNode),
                    '@_qual:maxLevel': String(node.data.activityLevels),
                }
            }),
        },
    }
}

function buildCompartmentsEntry(): XmlRecord {
    return {
        listOfCompartments: {
            compartment: {
                '@_id': SBML_DEFAULT_COMPARTMENT_ID,
                '@_constant': 'true',
            },
        },
    }
}

function buildTransitionsEntry(
    model: InternalGRNModel,
    sbmlNodeIdsByInternalId: Map<string, string>
): XmlRecord {
    const activityLevelsByName = new Map(
        model.nodes.map((node) => [node.data.name, node.data.activityLevels])
    )
    const speciesIdByName = new Map(
        model.nodes.map((node) => [
            node.data.name,
            sbmlNodeIdsByInternalId.get(node.id) ?? node.id,
        ])
    )

    return {
        'qual:listOfTransitions': {
            'qual:transition': model.nodes
                .filter((node) => !node.data.isInputNode)
                .map((node) => {
                    const incomingEdges = model.edges.filter(
                        (edge) => edge.target === node.id
                    )

                    const sbmlNodeId =
                        sbmlNodeIdsByInternalId.get(node.id) ?? node.id
                    const sanitizedSbmlNodeId = sanitizeIdentifier(sbmlNodeId)
                    const exportedRules = selectExportedSbmlRules(
                        buildExactLevelRules(node.data.rules)
                    )

                    return {
                        '@_qual:id': `tr_${sanitizedSbmlNodeId}_`,
                        ...(incomingEdges.length > 0
                            ? {
                                  'qual:listOfInputs': {
                                      'qual:input': incomingEdges.map(
                                          (edge, index) => {
                                              const edgeLevels =
                                                  edge.data?.levels ?? []
                                              const hasPositive =
                                                  edgeLevels.some(
                                                      (level) =>
                                                          level.type ===
                                                          InteractionType.Activation
                                                  )
                                              const hasNegative =
                                                  edgeLevels.some(
                                                      (level) =>
                                                          level.type ===
                                                          InteractionType.Inhibition
                                                  )

                                              let sign = 'positive'

                                              if (hasPositive && hasNegative) {
                                                  sign = 'dual'
                                              } else if (hasNegative) {
                                                  sign = 'negative'
                                              }

                                              return {
                                                  '@_qual:id': `tr_${sanitizedSbmlNodeId}_in_${index}`,
                                                  '@_qual:qualitativeSpecies':
                                                      sbmlNodeIdsByInternalId.get(
                                                          edge.source
                                                      ) ?? edge.source,
                                                  '@_qual:transitionEffect':
                                                      'none',
                                                  '@_qual:sign': sign,
                                              }
                                          }
                                      ),
                                  },
                              }
                            : {}),
                        'qual:listOfOutputs': {
                            'qual:output': {
                                '@_qual:id': `tr_${sanitizedSbmlNodeId}_out`,
                                '@_qual:qualitativeSpecies': sbmlNodeId,
                                '@_qual:transitionEffect': 'assignmentLevel',
                            },
                        },
                        'qual:listOfFunctionTerms': {
                            'qual:defaultTerm': {
                                '@_qual:resultLevel':
                                    node.data.rules.length === 0 ? '1' : '0',
                            },
                            ...(exportedRules.length > 0
                                ? {
                                      'qual:functionTerm': exportedRules.map(
                                          (rule) => ({
                                              '@_qual:resultLevel': String(
                                                  rule.target
                                              ),
                                              math: {
                                                  '@_xmlns':
                                                      SBML_NAMESPACES.mathml,
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

function createSbmlNodeIdMap(nodes: InternalGRNModel['nodes']) {
    const seenIds = new Set<string>()

    return new Map(
        nodes.map((node) => {
            const baseId = sanitizeIdentifier(
                node.data.name || node.id || 'node'
            )
            let candidate = baseId
            let suffix = 2

            while (seenIds.has(candidate)) {
                candidate = `${baseId}_${suffix}`
                suffix += 1
            }

            seenIds.add(candidate)
            return [node.id, candidate]
        })
    )
}

function buildExactLevelRules(
    rules: InternalGRNModel['nodes'][number]['data']['rules']
) {
    const sortedRules = [...rules].sort(
        (left, right) => left.target - right.target
    )

    return sortedRules.map((rule, index) => {
        const higherExpressions = sortedRules
            .slice(index + 1)
            .map((candidate) => candidate.expression.trim())
            .filter((expression) => expression.length > 0)

        if (higherExpressions.length === 0) {
            return rule
        }

        const currentExpression = wrapRuleExpression(rule.expression.trim())
        const higherExpression = wrapRuleExpression(
            higherExpressions.length === 1
                ? (higherExpressions[0] ?? '')
                : higherExpressions
                      .map((expression) => wrapRuleExpression(expression))
                      .join(' || ')
        )

        return {
            ...rule,
            expression: `${currentExpression} && !${higherExpression}`,
        }
    })
}

function selectExportedSbmlRules(
    rules: InternalGRNModel['nodes'][number]['data']['rules']
) {
    if (rules.length <= 1) {
        return rules
    }

    const sortedRules = [...rules].sort(
        (left, right) => left.target - right.target
    )
    const [lowestRule] = sortedRules

    return lowestRule ? [lowestRule] : []
}

function wrapRuleExpression(expression: string) {
    if (
        expression.startsWith('(') &&
        expression.endsWith(')') &&
        expression.length > 1
    ) {
        return expression
    }

    return `(${expression})`
}

function sanitizeIdentifier(value: string): string {
    const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '_')
    const normalized = sanitized.replace(/_+/g, '_').replace(/^_+|_+$/g, '')

    if (normalized.length === 0) {
        return 'id'
    }

    return /^[A-Za-z_]/.test(normalized) ? normalized : `id_${normalized}`
}
