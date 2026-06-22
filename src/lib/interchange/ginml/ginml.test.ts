import type { InternalGRNModel } from '@/lib/schema'
import { describe, expect, it } from 'vitest'
import { ACTIVE_INTERACTIONS_GINML } from './__fixtures__/active-ginml'
import { DIRECT_GINML } from './__fixtures__/direct-ginml'
import { exportGinmlModel, importGinmlModel } from './format'
import { GINMLInterchanger } from './ginml'

function toArrayBuffer(value: string): ArrayBuffer {
    return new TextEncoder().encode(value).buffer
}

function summarizeModel(model: InternalGRNModel) {
    return {
        title: model.title,
        annotations: {
            references: model.annotations?.references ?? [],
            text: extractText(model.annotations?.unstructured),
        },
        nodes: [...model.nodes]
            .sort((left, right) => left.id.localeCompare(right.id))
            .map((node) => ({
                id: node.id,
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
            .sort((left, right) => String(left.id).localeCompare(String(right.id)))
            .map((edge) => ({
                id: String(edge.id),
                source: edge.source,
                target: edge.target,
                references: edge.data.annotations?.references ?? [],
                levels: [...edge.data.levels]
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
        expect(raToC?.data.points).toBeUndefined()
        expect(raToC?.data.levels).toEqual(
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

    it('exports valid GINML with direct-expression normalization and fresh edge settings', () => {
        const model = importGinmlModel(ACTIVE_INTERACTIONS_GINML)
        const xml = exportGinmlModel(model)

        expect(xml).toContain('<!DOCTYPE gxl SYSTEM "http://ginsim.org/GINML_2_2.dtd">')
        expect(xml).toContain('<graph class="regulatory"')
        expect(xml).toContain('nodeorder="A B C"')
        expect(xml).toContain('<value val="1">')
        expect(xml).not.toContain('idActiveInteractions=')
        expect(xml).toContain('<edge id="A:C"')
        expect(xml).toContain('<edgevisualsetting')
        expect(xml).not.toContain('points=')
    })

    it('round-trips direct-expression GINML through the interchanger', async () => {
        const interchanger = new GINMLInterchanger()
        const imported = await interchanger.import(toArrayBuffer(DIRECT_GINML))
        const exported = await interchanger.export(imported)
        const reimported = await interchanger.import(exported)

        expect(summarizeModel(reimported)).toEqual(summarizeModel(imported))
    })

    it('round-trips active-interaction GINML with normalized expression export', () => {
        const imported = importGinmlModel(ACTIVE_INTERACTIONS_GINML)
        const reimported = importGinmlModel(exportGinmlModel(imported))

        expect(
            reimported.nodes.find((node) => node.id === 'C')?.data.rules.map((rule) => ({
                target: rule.target,
                expression: rule.expression,
            }))
        ).toEqual([
            { target: 1, expression: 'B:1 || A:1 || (A:1 && B:1)' },
        ])
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
                DIRECT_GINML.replace('effects="1:positive 2:positive"', 'effects="x:positive"')
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
