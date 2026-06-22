import type { PersistedAnnotations } from '@/lib/schema'
import { GRN_ANNOTATIONS_TAG, GRN_PAYLOAD_TAG } from './constants'
import {
    asRecord,
    compactText,
    ensureArray,
    getAttribute,
    getNodeText,
} from './xml'

const EMPTY_EDITOR_STATE = {
    root: {
        children: [
            {
                children: [],
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
} as const

export function parseSbmlAnnotations({
    notes,
    annotation,
}: {
    notes: unknown
    annotation: unknown
}): PersistedAnnotations | undefined {
    const customAnnotations = parseCustomAnnotations(annotation)
    const references = parseAnnotationReferences(annotation)
    const noteText = compactText(extractNotesText(notes))

    const mergedReferences = mergeReferences(
        customAnnotations?.references,
        references
    )
    const unstructured: unknown =
        customAnnotations?.unstructured ??
        (noteText.length > 0 ? createPlainTextEditorState(noteText) : undefined)

    if (!unstructured && mergedReferences.length === 0) {
        return undefined
    }

    return {
        ...(unstructured ? { unstructured } : {}),
        references: mergedReferences,
    }
}

export function mergeAnnotations(
    left: PersistedAnnotations | undefined,
    right: PersistedAnnotations | undefined
): PersistedAnnotations | undefined {
    if (!left) {
        return right
    }

    if (!right) {
        return left
    }

    const leftText = annotationsToPlainText(left)
    const rightText = annotationsToPlainText(right)
    const mergedText =
        leftText && rightText && leftText !== rightText
            ? `${leftText}\n\n${rightText}`
            : leftText || rightText

    const mergedReferences = mergeReferences(left.references, right.references)

    if (!mergedText && mergedReferences.length === 0) {
        return undefined
    }

    return {
        ...(mergedText
            ? { unstructured: createPlainTextEditorState(mergedText) }
            : {}),
        references: mergedReferences,
    }
}

export function annotationsToPlainText(
    annotations: PersistedAnnotations | undefined
): string {
    const unstructured: unknown = annotations?.unstructured

    if (!unstructured || typeof unstructured !== 'object') {
        return ''
    }

    const root = asRecord(unstructured)?.root
    const rootRecord = asRecord(root)

    if (!rootRecord) {
        return ''
    }

    const children = ensureArray(rootRecord.children)
        .map((child) => collectEditorText(child))
        .filter((text) => text.length > 0)

    return children.join('\n\n').trim()
}

export function createPlainTextEditorState(text: string) {
    const paragraphs = text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0)

    if (paragraphs.length === 0) {
        return EMPTY_EDITOR_STATE
    }

    return {
        root: {
            ...EMPTY_EDITOR_STATE.root,
            children: paragraphs.map((paragraph) => ({
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: paragraph,
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
            })),
        },
    }
}

export function parseAnnotationReferences(annotation: unknown): string[] {
    const annotationRecord = asRecord(annotation)
    const rdf = asRecord(annotationRecord?.['rdf:RDF'])
    const description = asRecord(rdf?.['rdf:Description'])
    const qualifiers = ensureArray(description?.['bqbiol:unknownQualifier'])

    return mergeReferences(
        ...qualifiers.map((qualifier) => {
            const bag = asRecord(asRecord(qualifier)?.['rdf:Bag'])
            const items = ensureArray(bag?.['rdf:li'])

            return items
                .map((item) => getAttribute(asRecord(item), 'rdf:resource'))
                .filter((resource): resource is string => !!resource)
        })
    )
}

function parseCustomAnnotations(
    annotation: unknown
): PersistedAnnotations | undefined {
    const annotationRecord = asRecord(annotation)
    const customAnnotation = asRecord(annotationRecord?.[GRN_ANNOTATIONS_TAG])
    const payloadNode: unknown = customAnnotation?.[GRN_PAYLOAD_TAG]

    if (!payloadNode) {
        return undefined
    }

    const payloadText = compactText(getNodeText(payloadNode))

    if (payloadText.length === 0) {
        return undefined
    }

    try {
        return JSON.parse(payloadText) as PersistedAnnotations
    } catch {
        throw new Error('Invalid GRN annotation payload in SBML annotation.')
    }
}

function extractNotesText(notes: unknown): string {
    const notesRecord = asRecord(notes)
    const body = notesRecord?.body

    if (!body) {
        return ''
    }

    return collectNotesText(body).join('\n\n')
}

function collectNotesText(value: unknown): string[] {
    if (typeof value === 'string') {
        const text = compactText(value)
        return text.length > 0 ? [text] : []
    }

    if (Array.isArray(value)) {
        return value.flatMap((entry) => collectNotesText(entry))
    }

    const record = asRecord(value)

    if (!record) {
        return []
    }

    const directText = compactText(
        Object.entries(record)
            .filter(([key]) => key === '#text')
            .map(([, child]) => getNodeText(child))
            .join('')
    )

    const nested = Object.entries(record)
        .filter(([key]) => !key.startsWith('@_') && key !== '#text')
        .flatMap(([, child]) => collectNotesText(child))

    if (nested.length > 0) {
        return nested
    }

    return directText.length > 0 ? [directText] : []
}

function collectEditorText(value: unknown): string {
    if (typeof value === 'string') {
        return value
    }

    if (Array.isArray(value)) {
        return value.map((entry) => collectEditorText(entry)).join('')
    }

    const record = asRecord(value)

    if (!record) {
        return ''
    }

    if (typeof record.text === 'string') {
        return record.text
    }

    const children = ensureArray(record.children)
        .map((child) => collectEditorText(child))
        .join('')

    return children
}

function mergeReferences(...referenceSets: (string[] | undefined)[]): string[] {
    return Array.from(
        new Set(
            referenceSets.flatMap((references) =>
                (references ?? []).map((reference) => reference.trim())
            )
        )
    ).filter((reference) => reference.length > 0)
}
