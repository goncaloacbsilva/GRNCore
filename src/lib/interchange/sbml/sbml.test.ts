import type { InternalGRNModel } from '@/lib/schema'
import { describe, expect, it } from 'vitest'
import { SAMPLE_SBML } from './__fixtures__/sample-sbml'
import { exportSbmlModel, importSbmlModel } from './format'
import { SBMLInterchanger } from './sbml'

function toArrayBuffer(value: string): ArrayBuffer {
    return new TextEncoder().encode(value).buffer
}

function summarizeModel(model: InternalGRNModel) {
    return {
        title: model.title,
        modelReferences: model.annotations?.references ?? [],
        nodes: [...model.nodes]
            .sort((left, right) => left.id.localeCompare(right.id))
            .map((node) => ({
                id: node.id,
                name: node.data.name,
                levels: node.data.activityLevels,
                isInputNode: node.data.isInputNode,
                references: node.data.annotations?.references ?? [],
                rules: [...node.data.rules]
                    .sort((left, right) => left.target - right.target)
                    .map((rule) => ({
                        target: rule.target,
                        expression: rule.expression,
                    })),
            })),
        edges: [...model.edges]
            .sort((left, right) => left.id.localeCompare(right.id))
            .map((edge) => ({
                id: edge.id,
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

describe('SBMLInterchanger', () => {
    it('imports a representative SBML-qual document', async () => {
        const interchanger = new SBMLInterchanger()
        const model = await interchanger.import(toArrayBuffer(SAMPLE_SBML))

        expect(model.title).toBe('sample_model')
        expect(model.nodes).toHaveLength(4)
        expect(model.edges).toHaveLength(3)
        expect(model.annotations?.references).toEqual([
            'https://pubmed.ncbi.nlm.nih.gov/36514338/',
        ])

        const raNode = model.nodes.find((node) => node.id === 'RA')
        const spi1Node = model.nodes.find((node) => node.id === 'SPI1')
        const raEdge = model.edges.find((edge) => edge.source === 'RA')

        expect(raNode?.position).toEqual({ x: 20, y: 30 })
        expect(raNode?.data.activityLevels).toBe(2)
        expect(raNode?.data.isInputNode).toBe(true)
        expect(raNode?.data.annotations?.references).toEqual([
            'https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:15367',
        ])
        expect(spi1Node?.data.rules.map((rule) => rule.expression)).toEqual([
            '"Retinoic Acid":1 && "Retinoic Acid Receptor" && !"PML::RARA fusion protein"',
        ])
        expect(raEdge?.data.annotations?.references).toEqual([
            'https://example.org/edge/ra-spi1',
        ])
    })

    it('collapses multiple function terms for the same result level into one OR rule', () => {
        const model = importSbmlModel(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version1/core"
      xmlns:qual="http://www.sbml.org/sbml/level3/version1/qual/version1"
      xmlns:layout="http://www.sbml.org/sbml/level3/version1/layout/version1"
      level="3"
      version="1"
      qual:required="true"
      layout:required="false">
  <model id="merge_terms">
    <qual:listOfQualitativeSpecies>
      <qual:qualitativeSpecies qual:id="A" qual:name="A" qual:compartment="default" qual:constant="false" qual:maxLevel="1"/>
      <qual:qualitativeSpecies qual:id="B" qual:name="B" qual:compartment="default" qual:constant="false" qual:maxLevel="1"/>
      <qual:qualitativeSpecies qual:id="C" qual:name="C" qual:compartment="default" qual:constant="false" qual:maxLevel="1"/>
    </qual:listOfQualitativeSpecies>
    <qual:listOfTransitions>
      <qual:transition qual:id="tr_C">
        <qual:listOfInputs>
          <qual:input qual:id="a_in" qual:qualitativeSpecies="A" qual:transitionEffect="none" qual:sign="positive" qual:thresholdLevel="1"/>
          <qual:input qual:id="b_in" qual:qualitativeSpecies="B" qual:transitionEffect="none" qual:sign="positive" qual:thresholdLevel="1"/>
        </qual:listOfInputs>
        <qual:listOfOutputs>
          <qual:output qual:id="c_out" qual:qualitativeSpecies="C" qual:transitionEffect="assignmentLevel"/>
        </qual:listOfOutputs>
        <qual:listOfFunctionTerms>
          <qual:defaultTerm qual:resultLevel="0"/>
          <qual:functionTerm qual:resultLevel="1">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <apply><eq/><ci> A </ci><cn type="integer"> 1 </cn></apply>
            </math>
          </qual:functionTerm>
          <qual:functionTerm qual:resultLevel="1">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <apply><eq/><ci> B </ci><cn type="integer"> 1 </cn></apply>
            </math>
          </qual:functionTerm>
        </qual:listOfFunctionTerms>
      </qual:transition>
    </qual:listOfTransitions>
  </model>
</sbml>`)

        const nodeC = model.nodes.find((node) => node.id === 'C')
        expect(
            nodeC?.data.rules.map((rule) => ({
                target: rule.target,
                expression: rule.expression,
            }))
        ).toEqual([{ target: 1, expression: 'A || B' }])
    })

    it('exports an internal model with SBML namespaces, layout, rules, and annotations', () => {
        const xml = exportSbmlModel(createRoundTripModel())

        expect(xml).toContain(
            'xmlns:qual="http://www.sbml.org/sbml/level3/version1/qual/version1"'
        )
        expect(xml).toContain('xmlns:grn="https://grn-core.dev/ns/sbml/v1"')
        expect(xml).toContain('<layout:generalGlyph')
        expect(xml).toContain('<qual:listOfQualitativeSpecies>')
        expect(xml).toContain('<qual:listOfTransitions>')
        expect(xml).toContain('<geq/>')
        expect(xml).toContain('<ci> a_node </ci>')
        expect(xml).toContain('<rdf:RDF>')
        expect(xml).toContain('<grn:annotations')
    })

    it('round-trips an internal model through SBML', async () => {
        const interchanger = new SBMLInterchanger()
        const originalModel = createRoundTripModel()
        const exported = await interchanger.export(originalModel)
        const imported = await interchanger.import(exported)

        expect(summarizeModel(imported)).toEqual(summarizeModel(originalModel))
    })

    it('round-trips the representative SBML fixture', () => {
        const imported = importSbmlModel(SAMPLE_SBML)
        const reexported = exportSbmlModel(imported)
        const reimported = importSbmlModel(reexported)

        expect(summarizeModel(reimported)).toEqual(summarizeModel(imported))
    })

    it('rejects malformed XML', () => {
        expect(() => importSbmlModel('<sbml><model></sbml>')).toThrow(
            /Invalid SBML XML/
        )
    })

    it('rejects documents without qualitative sections', () => {
        expect(() =>
            importSbmlModel(
                '<?xml version="1.0"?><sbml xmlns="http://www.sbml.org/sbml/level3/version1/core"><model id="x"/></sbml>'
            )
        ).toThrow(/qualitative species/i)
    })

    it('rejects transitions with multiple outputs', () => {
        expect(() =>
            importSbmlModel(
                SAMPLE_SBML.replace(
                    '</qual:listOfOutputs>',
                    '<qual:output qual:id="extra" qual:qualitativeSpecies="RA" qual:transitionEffect="assignmentLevel"/></qual:listOfOutputs>'
                )
            )
        ).toThrow(/multiple outputs/)
    })

    it('rejects unsupported MathML operators', () => {
        expect(() =>
            importSbmlModel(SAMPLE_SBML.replace('<and/>', '<xor/>'))
        ).toThrow(/Unsupported MathML operator/)
    })
})

function createRoundTripModel(): InternalGRNModel {
    return {
        title: 'roundtrip-model',
        annotations: {
            unstructured: {
                root: {
                    children: [
                        {
                            children: [
                                {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: 'Round-trip model notes.',
                                    type: 'text',
                                    version: 1,
                                },
                            ],
                            direction: null,
                            format: '',
                            indent: 0,
                            textFormat: 0,
                            textStyle: '',
                            type: 'paragraph',
                            version: 1,
                        },
                    ],
                    direction: null,
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1,
                },
            },
            references: ['https://example.org/model'],
        },
        nodes: [
            {
                id: 'a_node',
                position: { x: 40, y: 60 },
                data: {
                    name: 'Node A',
                    activityLevels: 2,
                    isInputNode: true,
                    isValid: true,
                    rules: [],
                    annotations: {
                        unstructured: {
                            root: {
                                children: [
                                    {
                                        children: [
                                            {
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: 'Input node A.',
                                                type: 'text',
                                                version: 1,
                                            },
                                        ],
                                        direction: null,
                                        format: '',
                                        indent: 0,
                                        textFormat: 0,
                                        textStyle: '',
                                        type: 'paragraph',
                                        version: 1,
                                    },
                                ],
                                direction: null,
                                format: '',
                                indent: 0,
                                type: 'root',
                                version: 1,
                            },
                        },
                        references: ['https://example.org/node/A'],
                    },
                },
            },
            {
                id: 'c_node',
                position: { x: 40, y: 200 },
                data: {
                    name: 'Node C',
                    activityLevels: 1,
                    isInputNode: false,
                    isValid: true,
                    rules: [],
                    annotations: undefined,
                },
            },
            {
                id: 'b_node',
                position: { x: 260, y: 120 },
                data: {
                    name: 'Node B',
                    activityLevels: 1,
                    isInputNode: false,
                    isValid: true,
                    rules: [
                        {
                            id: 'rule-b-1',
                            target: 1,
                            expression: '"Node A":1 && !"Node C"',
                            isValid: true,
                        },
                    ],
                    annotations: {
                        unstructured: {
                            root: {
                                children: [
                                    {
                                        children: [
                                            {
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: 'Target node B.',
                                                type: 'text',
                                                version: 1,
                                            },
                                        ],
                                        direction: null,
                                        format: '',
                                        indent: 0,
                                        textFormat: 0,
                                        textStyle: '',
                                        type: 'paragraph',
                                        version: 1,
                                    },
                                ],
                                direction: null,
                                format: '',
                                indent: 0,
                                type: 'root',
                                version: 1,
                            },
                        },
                        references: ['https://example.org/node/B'],
                    },
                },
            },
        ],
        edges: [
            {
                id: 'a_node->b_node',
                source: 'a_node',
                target: 'b_node',
                data: {
                    levels: [
                        {
                            id: 'edge-ab-level-1',
                            type: 'activation',
                            target: 1,
                            isValid: true,
                        },
                    ],
                    annotations: {
                        unstructured: {
                            root: {
                                children: [
                                    {
                                        children: [
                                            {
                                                detail: 0,
                                                format: 0,
                                                mode: 'normal',
                                                style: '',
                                                text: 'A activates B.',
                                                type: 'text',
                                                version: 1,
                                            },
                                        ],
                                        direction: null,
                                        format: '',
                                        indent: 0,
                                        textFormat: 0,
                                        textStyle: '',
                                        type: 'paragraph',
                                        version: 1,
                                    },
                                ],
                                direction: null,
                                format: '',
                                indent: 0,
                                type: 'root',
                                version: 1,
                            },
                        },
                        references: ['https://example.org/edge/A-B'],
                    },
                },
            },
            {
                id: 'c_node->b_node',
                source: 'c_node',
                target: 'b_node',
                data: {
                    levels: [
                        {
                            id: 'edge-cb-level-1',
                            type: 'inhibition',
                            target: 1,
                            isValid: true,
                        },
                    ],
                    annotations: undefined,
                },
            },
        ],
    }
}
