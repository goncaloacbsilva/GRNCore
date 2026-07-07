import type { InternalGRNModel } from '@/lib/schema'
import { describe, expect, it } from 'vitest'
import { getRegulatoryNodeShape } from '@/components/views/editor/graph/node-style'
import { validateRegulatoryRuleExpression } from '@/lib/regulatory-rules'
import { ACTIVE_INTERACTIONS_GINML } from './__fixtures__/active-ginml'
import { DIRECT_GINML } from './__fixtures__/direct-ginml'
import { exportGinmlModel, importGinmlModel } from './format'
import { GINMLInterchanger } from './ginml'

function toArrayBuffer(value: string): ArrayBuffer {
    return new TextEncoder().encode(value).buffer
}

function summarizePortableModel(model: InternalGRNModel) {
    const nodeNameById = new Map(
        model.nodes.map((node) => [node.id, node.data.name])
    )

    return {
        title: model.title,
        annotations: {
            references: model.annotations?.references ?? [],
            text: extractText(model.annotations?.unstructured),
        },
        nodes: [...model.nodes]
            .sort((left, right) =>
                left.data.name.localeCompare(right.data.name)
            )
            .map((node) => ({
                name: node.data.name,
                levels: node.data.activityLevels,
                isInputNode: node.data.isInputNode,
                references: node.data.annotations?.references ?? [],
                text: extractText(node.data.annotations?.unstructured),
                rules: [...node.data.rules]
                    .sort((left, right) =>
                        left.expression.localeCompare(right.expression)
                    )
                    .map((rule) => ({
                        target: rule.target,
                        expression: rule.expression,
                    })),
            })),
        edges: [...model.edges]
            .sort((left, right) =>
                String(left.id).localeCompare(String(right.id))
            )
            .map((edge) => ({
                source: nodeNameById.get(edge.source) ?? edge.source,
                target: nodeNameById.get(edge.target) ?? edge.target,
                references: edge.data?.annotations?.references ?? [],
                levels: [...(edge.data?.levels ?? [])]
                    .sort((left, right) => left.target - right.target)
                    .map((level) => ({
                        type: level.type,
                        target: level.target,
                    })),
            })),
    }
}

describe('GINMLInterchanger', () => {
    it('imports direct-expression GINML with annotations and fresh edges', async () => {
        const interchanger = new GINMLInterchanger()
        const model = await interchanger.import(toArrayBuffer(DIRECT_GINML))

        expect(model.title).toBe('direct_fixture')
        expect(model.annotations?.references).toEqual([
            'https://example.org/models/direct',
        ])
        expect(model.nodes).toHaveLength(3)
        expect(model.edges).toHaveLength(2)

        const ra = model.nodes.find((node) => node.id === 'RA')
        const b = model.nodes.find((node) => node.id === 'B')
        const c = model.nodes.find((node) => node.id === 'C')
        const raToC = model.edges.find((edge) => edge.id === 'RA:C')

        expect(ra?.position).toEqual({ x: 20, y: 30 })
        expect(ra?.data.activityLevels).toBe(2)
        expect(ra?.data.isInputNode).toBe(true)
        expect(b?.data.rules.map((rule) => rule.expression)).toEqual(['1'])
        expect(c?.data.rules.map((rule) => rule.expression)).toEqual([
            '"Retinoic Acid":1 || !B',
        ])
        expect(raToC?.data?.points).toBeUndefined()
        expect(raToC?.data?.levels).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ type: 'activation', target: 1 }),
                expect.objectContaining({ type: 'activation', target: 2 }),
            ])
        )
    })

    it('imports active-interaction rules as a single OR expression per level', () => {
        const model = importGinmlModel(ACTIVE_INTERACTIONS_GINML)
        const nodeC = model.nodes.find((node) => node.id === 'C')

        expect(nodeC?.data.rules.map((rule) => rule.expression)).toEqual([
            'B:1 || A:1 || (A:1 && B:1)',
        ])
    })

    it('ignores constitutive parameters when the same level already has explicit rules', () => {
        const model = importGinmlModel(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">
<gxl xmlns:xlink="http://www.w3.org/1999/xlink">
  <graph class="regulatory" id="constitutive_override" nodeorder="A C">
    <node id="A" name="A" maxvalue="1">
      <nodevisualsetting x="10" y="10" style=""/>
    </node>
    <node id="C" name="C" maxvalue="1">
      <parameter val="1"/>
      <value val="1">
        <exp str="A"/>
      </value>
      <nodevisualsetting x="110" y="10" style=""/>
    </node>
    <edge id="A:C" from="A" to="C" minvalue="1" sign="positive">
      <edgevisualsetting anchor="NE" style=""/>
    </edge>
  </graph>
</gxl>`)
        const node = model.nodes.find((entry) => entry.id === 'C')

        expect(node?.data.rules).toEqual([
            expect.objectContaining({
                target: 1,
                expression: 'A',
                isValid: true,
            }),
        ])
    })

    it('accepts omitted thresholds for multilevel references when only one polarity threshold exists', () => {
        const model = importGinmlModel(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">
<gxl xmlns:xlink="http://www.w3.org/1999/xlink">
  <graph class="regulatory" id="threshold_fixture" nodeorder="p53 DNAdam">
    <node id="p53" name="p53" maxvalue="2">
      <nodevisualsetting x="10" y="10" style=""/>
    </node>
    <node id="DNAdam" name="DNAdam" maxvalue="1">
      <value val="1">
        <exp str="DNAdam &amp; !p53"/>
      </value>
      <nodevisualsetting x="110" y="10" style=""/>
    </node>
    <edge id="DNAdam:DNAdam" from="DNAdam" to="DNAdam" minvalue="1" sign="positive">
      <edgevisualsetting anchor="NE" style=""/>
    </edge>
    <edge id="p53:DNAdam" from="p53" to="DNAdam" minvalue="2" sign="negative">
      <edgevisualsetting anchor="NE" style=""/>
    </edge>
  </graph>
</gxl>`)
        const node = model.nodes.find((entry) => entry.id === 'DNAdam')

        expect(node?.data.rules).toEqual([
            expect.objectContaining({
                target: 1,
                expression: 'DNAdam && !p53',
                isValid: true,
            }),
        ])
    })

    it('validates rule identifiers against node names rather than node ids', () => {
        const model = importGinmlModel(DIRECT_GINML)
        const target = model.nodes.find((entry) => entry.id === 'C')
        const incomingEdges = model.edges.filter((edge) => edge.target === 'C')
        const incomingNodes = model.nodes.filter((node) =>
            incomingEdges.some((edge) => edge.source === node.id)
        )

        expect(
            validateRegulatoryRuleExpression(
                'RA:1 || !B',
                incomingNodes,
                incomingEdges
            )
        ).toMatch(/Unknown incoming node: RA/)
        expect(
            validateRegulatoryRuleExpression(
                '"Retinoic Acid":1 || !B',
                incomingNodes,
                incomingEdges
            )
        ).toBeNull()
        expect(target?.data.rules).toEqual([
            expect.objectContaining({
                target: 1,
                expression: '"Retinoic Acid":1 || !B',
                isValid: true,
            }),
        ])
    })

    it('resolves two-part active-interaction ids via edge ids when threshold is omitted', () => {
        const model = importGinmlModel(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">
<gxl xmlns:xlink="http://www.w3.org/1999/xlink">
  <graph class="regulatory" id="two_part_fixture" nodeorder="A C">
    <node id="A" name="A" maxvalue="1">
      <nodevisualsetting x="10" y="10" style=""/>
    </node>
    <node id="C" name="C" maxvalue="1">
      <parameter val="1" idActiveInteractions="A:C"/>
      <nodevisualsetting x="110" y="10" style=""/>
    </node>
    <edge id="A:C" from="A" to="C" minvalue="1" sign="positive">
      <edgevisualsetting anchor="NE" style=""/>
    </edge>
  </graph>
</gxl>`)
        const node = model.nodes.find((entry) => entry.id === 'C')

        expect(node?.data.rules).toEqual([
            expect.objectContaining({
                target: 1,
                expression: 'A:1',
                isValid: true,
            }),
        ])
    })

    it('exports valid GINML with direct-expression normalization and fresh edge settings', () => {
        const model = importGinmlModel(ACTIVE_INTERACTIONS_GINML)
        const xml = exportGinmlModel(model)

        expect(xml).toContain(
            '<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">'
        )
        expect(xml).toContain('<graph class="regulatory"')
        expect(xml).toContain('nodeorder="A B C"')
        expect(xml).toContain('<attr name="display.node" value="name"/>')
        expect(xml).toContain('<value val="1">')
        expect(xml).not.toContain('idActiveInteractions=')
        expect(xml).toContain('<edge id="A:C"')
        expect(xml).toContain('<edgevisualsetting')
        expect(xml).not.toContain('points=')
        expect(xml).not.toContain('xmlns:grn=')
        expect(xml).toContain('id="active_fixture"')
    })

    it('exports node shapes to GINML node styles', () => {
        const model = importGinmlModel(ACTIVE_INTERACTIONS_GINML)
        model.nodes = model.nodes.map((node, index) => ({
            ...node,
            style: {
                ...node.style,
                '--grn-node-shape':
                    index === 0
                        ? 'rectangle'
                        : index === 1
                          ? 'rounded-rectangle'
                          : 'ellipse',
            },
        }))

        const xml = exportGinmlModel(model)

        expect(xml).toContain('<nodestyle background="#ffffff"')
        expect(xml).toContain('shape="RECTANGLE"')
        expect(xml).toContain('name="RoundedRectangle"')
        expect(xml).toContain('shape="ROUND_RECTANGLE"')
        expect(xml).toContain('name="Ellipse"')
        expect(xml).toContain('shape="ELLIPSE"')
        expect(xml).toContain('nodevisualsetting x="254" y="10" style=""')
        expect(xml).toContain(
            'nodevisualsetting x="369" y="10" style="RoundedRectangle"'
        )
        expect(xml).toContain(
            'nodevisualsetting x="328" y="108" style="Ellipse"'
        )
    })

    it('exports nodes without explicit shape using the default rectangle style', () => {
        const model = importGinmlModel(ACTIVE_INTERACTIONS_GINML)

        const xml = exportGinmlModel(model)

        expect(xml).toContain('nodevisualsetting x="254" y="10" style=""')
        expect(xml).toContain('nodevisualsetting x="369" y="10" style=""')
        expect(xml).toContain('nodevisualsetting x="328" y="108" style=""')
        expect(xml).not.toContain('name="RoundedRectangle"')
    })

    it('sanitizes exported GINML identifiers from node names instead of raw internal ids', () => {
        const model = importGinmlModel(ACTIVE_INTERACTIONS_GINML)
        const renamedNodeIdByPreviousId = new Map<string, string>()
        model.nodes = model.nodes.map((node, index) => {
            const nextId = `${index + 1}-node-${node.id}`
            renamedNodeIdByPreviousId.set(node.id, nextId)

            return {
                ...node,
                id: nextId,
            }
        })
        model.edges = model.edges.map((edge, index) => ({
            ...edge,
            id: `${index + 1}-edge-${edge.id}`,
            source: renamedNodeIdByPreviousId.get(edge.source) ?? edge.source,
            target: renamedNodeIdByPreviousId.get(edge.target) ?? edge.target,
        }))

        const xml = exportGinmlModel(model)

        expect(xml).toContain('nodeorder="A B C"')
        expect(xml).toContain('<node id="A" maxvalue="1">')
        expect(xml).toContain('<node id="B" maxvalue="1">')
        expect(xml).toContain('<node id="C" maxvalue="1">')
        expect(xml).toContain('<edge id="A:C" from="A" to="C"')
        expect(xml).not.toContain('1-node-')
        expect(xml).not.toContain('1-edge-')
    })

    it('exports edge control points in GINML edgevisualsetting', () => {
        const model = importGinmlModel(ACTIVE_INTERACTIONS_GINML)
        model.edges = model.edges.map((edge) =>
            edge.id === 'A:C'
                ? {
                      ...edge,
                      data: {
                          ...edge.data,
                          levels: edge.data?.levels ?? [],
                          points: [
                              { x: 45.6, y: 189.4, active: true },
                              { x: 88.9, y: 187.2, active: true },
                          ],
                      },
                  }
                : edge
        )

        const xml = exportGinmlModel(model)

        expect(xml).toContain('points="294,189 344,187"')
    })

    it('adds a higher midpoint hint for reverse edges without explicit points', () => {
        const model: InternalGRNModel = {
            title: 'reverse_edge_test',
            nodes: [
                {
                    id: 'left',
                    position: { x: 160.66666666666666, y: 154.66666666666666 },
                    data: {
                        name: 'det',
                        activityLevels: 1,
                        isInputNode: false,
                        isValid: true,
                        rules: [],
                    },
                    style: {
                        width: 52,
                        height: 35,
                    },
                },
                {
                    id: 'right',
                    position: { x: 347.3333333333333, y: 153.16666666666669 },
                    data: {
                        name: 'dfgd',
                        activityLevels: 1,
                        isInputNode: false,
                        isValid: true,
                        rules: [],
                    },
                    style: {
                        width: 76,
                        height: 35,
                    },
                },
            ],
            edges: [
                {
                    id: 'right-left',
                    source: 'right',
                    target: 'left',
                    data: {
                        levels: [
                            {
                                id: 'lvl-1',
                                type: 'inhibition',
                                target: 1,
                                isValid: true,
                            },
                        ],
                    },
                },
                {
                    id: 'left-right',
                    source: 'left',
                    target: 'right',
                    data: {
                        levels: [
                            {
                                id: 'lvl-2',
                                type: 'activation',
                                target: 1,
                                isValid: true,
                            },
                        ],
                        points: [
                            {
                                x: 187.19791666666666,
                                y: 117.890625,
                                active: true,
                            },
                            {
                                x: 386.4088541666667,
                                y: 118.05729166666667,
                                active: true,
                            },
                        ],
                    },
                },
            ],
        }

        const xml = exportGinmlModel(model)

        expect(xml).toContain(
            '<edge id="dfgd:det" from="dfgd" to="det" minvalue="1" sign="negative">'
        )
        expect(xml).toContain('points="568,171"')
    })

    it('imports node shapes from GINML style definitions', () => {
        const model = importGinmlModel(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">
<gxl xmlns:xlink="http://www.w3.org/1999/xlink">
  <graph class="regulatory" id="shape_fixture" nodeorder="A B C">
    <nodestyle name="RoundedRectangle" shape="ROUND_RECTANGLE" width="120" height="45"/>
    <nodestyle name="Rectangle" shape="RECTANGLE" width="120" height="45"/>
    <nodestyle name="Ellipse" shape="ELLIPSE" width="120" height="45"/>
    <node id="A" name="A" maxvalue="1">
      <nodevisualsetting x="10" y="10" style="RoundedRectangle"/>
    </node>
    <node id="B" name="B" maxvalue="1">
      <nodevisualsetting x="110" y="10" style="Rectangle"/>
    </node>
    <node id="C" name="C" maxvalue="1">
      <nodevisualsetting x="210" y="10" style="Ellipse"/>
    </node>
  </graph>
</gxl>`)

        expect(
            model.nodes.map((node) => ({
                id: node.id,
                shape: getRegulatoryNodeShape(node.style),
            }))
        ).toEqual([
            { id: 'A', shape: 'rounded-rectangle' },
            { id: 'B', shape: 'rectangle' },
            { id: 'C', shape: 'ellipse' },
        ])
    })

    it('falls back to rounded-rectangle for missing or unsupported imported shapes', () => {
        const model = importGinmlModel(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">
<gxl xmlns:xlink="http://www.w3.org/1999/xlink">
  <graph class="regulatory" id="shape_fallback_fixture" nodeorder="A B">
    <nodestyle shape="TRIANGLE" width="120" height="45"/>
    <node id="A" name="A" maxvalue="1">
      <nodevisualsetting x="10" y="10" style=""/>
    </node>
    <node id="B" name="B" maxvalue="1">
      <nodevisualsetting x="110" y="10" style="UnknownStyle"/>
    </node>
  </graph>
</gxl>`)

        expect(
            model.nodes.map((node) => getRegulatoryNodeShape(node.style))
        ).toEqual(['rounded-rectangle', 'rounded-rectangle'])
    })

    it('round-trips direct-expression GINML through the interchanger', async () => {
        const interchanger = new GINMLInterchanger()
        const imported = await interchanger.import(toArrayBuffer(DIRECT_GINML))
        const exported = await interchanger.export(imported)
        const reimported = await interchanger.import(exported)

        expect(summarizePortableModel(reimported)).toEqual(
            summarizePortableModel(imported)
        )
    })

    it('round-trips active-interaction GINML with normalized expression export', () => {
        const imported = importGinmlModel(ACTIVE_INTERACTIONS_GINML)
        const reimported = importGinmlModel(exportGinmlModel(imported))

        expect(
            reimported.nodes
                .find((node) => node.id === 'C')
                ?.data.rules.map((rule) => ({
                    target: rule.target,
                    expression: rule.expression,
                }))
        ).toEqual([{ target: 1, expression: 'B:1 || A:1 || (A:1 && B:1)' }])
    })

    it('round-trips supported node shapes through GINML export and import', () => {
        const imported = importGinmlModel(ACTIVE_INTERACTIONS_GINML)
        const expectedShapes = [
            'rectangle',
            'rounded-rectangle',
            'ellipse',
        ] as const

        imported.nodes = imported.nodes.map((node, index) => ({
            ...node,
            style: {
                ...node.style,
                '--grn-node-shape': expectedShapes[index],
            },
        }))

        const reimported = importGinmlModel(exportGinmlModel(imported))

        expect(
            reimported.nodes.map((node) => getRegulatoryNodeShape(node.style))
        ).toEqual(expectedShapes)
    })

    it('exports non-input nodes without rules', () => {
        const model: InternalGRNModel = {
            title: 'invalid export #1',
            nodes: [
                {
                    id: 'node-1',
                    position: { x: 10, y: 20 },
                    data: {
                        name: 'A',
                        activityLevels: 1,
                        isInputNode: false,
                        isValid: true,
                        rules: [],
                    },
                },
            ],
            edges: [],
        }

        expect(exportGinmlModel(model)).toContain(
            '<graph class="regulatory" id="invalid_export_1"'
        )
        expect(exportGinmlModel(model)).toContain('<node id="A" maxvalue="1">')
    })

    it('adjusts exported node positions to preserve centers for resized nodes', () => {
        const model: InternalGRNModel = {
            title: 'position_test',
            nodes: [
                {
                    id: 'node-1',
                    position: { x: 160.66666666666666, y: 154.66666666666666 },
                    data: {
                        name: 'det',
                        activityLevels: 1,
                        isInputNode: false,
                        isValid: true,
                        rules: [],
                    },
                    style: {
                        width: 52,
                        height: 35,
                    },
                },
            ],
            edges: [],
        }

        expect(exportGinmlModel(model)).toContain(
            'nodevisualsetting x="431" y="160" style=""'
        )
    })

    it('rejects malformed structures and unresolved active interactions', () => {
        expect(() => importGinmlModel('<gxl><graph></gxl>')).toThrow(
            /Invalid GINML XML/
        )
        expect(() =>
            importGinmlModel(
                '<?xml version="1.0"?><gxl xmlns:xlink="http://www.w3.org/1999/xlink"></gxl>'
            )
        ).toThrow(/graph element/)
        expect(() =>
            importGinmlModel(
                ACTIVE_INTERACTIONS_GINML.replace('A:C:1', 'Z:C:1')
            )
        ).toThrow(/Unable to resolve GINML active interaction/)
        expect(() =>
            importGinmlModel(
                DIRECT_GINML.replace(
                    'effects="1:positive 2:positive"',
                    'effects="x:positive"'
                )
            )
        ).toThrow(/invalid effects threshold/i)
    })
})

function extractText(unstructured: unknown): string {
    const root = asRecord(asRecord(unstructured)?.root)

    if (!root) {
        return ''
    }

    return toArray(root.children)
        .map((child) => collectText(child))
        .join('\n\n')
        .trim()
}

function collectText(value: unknown): string {
    if (typeof value === 'string') {
        return value
    }

    if (Array.isArray(value)) {
        return value.map((entry) => collectText(entry)).join('')
    }

    const record = asRecord(value)

    if (!record) {
        return ''
    }

    if (typeof record.text === 'string') {
        return record.text
    }

    return toArray(record.children)
        .map((child) => collectText(child))
        .join('')
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>
    }

    return undefined
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
    if (value === undefined || value === null) {
        return []
    }

    return Array.isArray(value) ? value : [value]
}
