import type { InternalGRNModel, PersistedAnnotations } from '../schema'
import { Interchanger } from './base'
import {
    createInternalModelFromLogicalModel,
    createLogicalModelFromInternalModel,
} from './bio-lqm-utils'
import { SBMLFormat } from 'biolqm-io-ts'
import { StringStreamProvider } from './bio-lqm-utils/string-stream-provider'
import type { SerializedEditorState } from 'lexical'

interface ParsedSbmlAnnotations {
    modelAnnotations?: PersistedAnnotations
    nodeAnnotations: Map<string, PersistedAnnotations>
    edgeAnnotations: Map<string, PersistedAnnotations>
}

function createSerializedEditorStateFromLines(
    lines: string[]
): SerializedEditorState {
    return {
        root: {
            children: lines.map((line) => ({
                children: line.length
                    ? [
                          {
                              detail: 0,
                              format: 0,
                              mode: 'normal',
                              style: '',
                              text: line,
                              type: 'text',
                              version: 1,
                          },
                      ]
                    : [],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
                textFormat: 0,
                textStyle: '',
            })),
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
        },
    } as unknown as SerializedEditorState
}

function parseNotes(element: Element | null): SerializedEditorState | undefined {
    const notesElement = element?.querySelector(':scope > notes')
    const body = notesElement?.querySelector('body')
    const source = body ?? notesElement
    if (source == null) {
        return undefined
    }

    const blockCandidates = Array.from(
        source.querySelectorAll(':scope > p, :scope > div, :scope > section')
    )
    const rawLines =
        blockCandidates.length > 0
            ? blockCandidates.map((node) => node.textContent?.trim() ?? '')
            : source.textContent
                  ?.split(/\r?\n/u)
                  .map((line) => line.trim())
                  .filter((line, _lineIndex, lines) =>
                      line.length > 0 || lines.length === 1
                  ) ?? []

    const lines = rawLines.filter((line) => line.length > 0)
    if (lines.length === 0) {
        return undefined
    }

    return createSerializedEditorStateFromLines(lines)
}

function parseReferences(element: Element | null): string[] {
    if (element == null) {
        return []
    }

    const references = new Set<string>()
    for (const annotatedElement of element.querySelectorAll('annotation *')) {
        for (const attribute of Array.from(annotatedElement.attributes)) {
            if (attribute.localName !== 'resource') {
                continue
            }

            const value = attribute.value.trim()
            if (value.length > 0) {
                references.add(value)
            }
        }
    }

    return Array.from(references)
}

function parsePersistedAnnotations(
    element: Element | null
): PersistedAnnotations | undefined {
    const unstructured = parseNotes(element)
    const references = parseReferences(element)

    if (unstructured == null && references.length === 0) {
        return undefined
    }

    return {
        unstructured,
        references,
    }
}

function getDirectChild(
    parent: Element,
    localNames: string[]
): Element | undefined {
    return Array.from(parent.children).find((child) =>
        localNames.includes(child.localName)
    )
}

function parseSbmlAnnotations(content: string): ParsedSbmlAnnotations {
    const document = new DOMParser().parseFromString(content, 'application/xml')
    const modelElement = document.querySelector('model')
    const nodeAnnotations = new Map<string, PersistedAnnotations>()
    const edgeAnnotations = new Map<string, PersistedAnnotations>()

    if (modelElement == null) {
        return { modelAnnotations: undefined, nodeAnnotations, edgeAnnotations }
    }

    const modelPersistedAnnotations = parsePersistedAnnotations(modelElement)

    for (const speciesElement of Array.from(
        modelElement.querySelectorAll('qualitativeSpecies')
    )) {
        const speciesId =
            speciesElement.getAttribute('qual:id') ??
            speciesElement.getAttribute('id')
        if (speciesId == null) {
            continue
        }

        const annotations = parsePersistedAnnotations(speciesElement)
        if (annotations != null) {
            nodeAnnotations.set(speciesId, annotations)
        }
    }

    for (const transitionElement of Array.from(
        modelElement.querySelectorAll('transition')
    )) {
        const outputsContainer = getDirectChild(transitionElement, [
            'listOfOutputs',
        ])
        const outputElement = outputsContainer?.querySelector('output')
        const targetId =
            outputElement?.getAttribute('qual:qualitativeSpecies') ??
            outputElement?.getAttribute('qualitativeSpecies')
        if (targetId == null) {
            continue
        }

        const inputsContainer = getDirectChild(transitionElement, ['listOfInputs'])
        for (const inputElement of Array.from(
            inputsContainer?.querySelectorAll('input') ?? []
        )) {
            const sourceId =
                inputElement.getAttribute('qual:qualitativeSpecies') ??
                inputElement.getAttribute('qualitativeSpecies')
            if (sourceId == null) {
                continue
            }

            const annotations = parsePersistedAnnotations(inputElement)
            if (annotations != null) {
                edgeAnnotations.set(`${sourceId}:${targetId}`, annotations)
            }
        }
    }

    return {
        modelAnnotations: modelPersistedAnnotations,
        nodeAnnotations,
        edgeAnnotations,
    }
}

export class SBMLInterchanger extends Interchanger {
    readonly mimeType = 'application/sbml+xml'
    private readonly sbmlFormat = new SBMLFormat()

    protected async _export(snapshot: InternalGRNModel): Promise<string> {
        const outputStreamProvider = new StringStreamProvider()
        const model = createLogicalModelFromInternalModel(snapshot)
        await this.sbmlFormat.exportToProvider(model, outputStreamProvider)

        return outputStreamProvider.getString()
    }

    async import(content: string): Promise<InternalGRNModel> {
        const inputStreamProvider = new StringStreamProvider()
        inputStreamProvider.setString(content)
        const model =
            await this.sbmlFormat.loadFromProvider(inputStreamProvider)
        const importedModel = createInternalModelFromLogicalModel(model)
        const parsedAnnotations = parseSbmlAnnotations(content)

        return {
            ...importedModel,
            annotations: parsedAnnotations.modelAnnotations,
            nodes: importedModel.nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    annotations: parsedAnnotations.nodeAnnotations.get(node.id),
                },
            })),
            edges: importedModel.edges.map((edge) => ({
                ...edge,
                data: {
                    ...edge.data!,
                    annotations: parsedAnnotations.edgeAnnotations.get(
                        `${edge.source}:${edge.target}`
                    ),
                },
            })),
        }
    }
}
