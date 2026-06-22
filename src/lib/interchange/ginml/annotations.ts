import type { PersistedAnnotations } from '@/lib/schema'
import {
    GINML_ANNOTATIONS_TAG,
    GINML_PAYLOAD_TAG,
    GINML_NAMESPACES,
} from './constants'
import {
    asRecord,
    compactText,
    ensureArray,
    getAttribute,
    getNodeText,
    type XmlRecord,
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

export function parseGinmlAnnotations(
    annotation: unknown
): PersistedAnnotations | undefined {
    const annotationRecord = asRecord(annotation)

    if (!annotationRecord) {
        return undefined
    }

    const customAnnotations = parseCustomAnnotations(annotationRecord)
    const references = parseAnnotationReferences(annotationRecord)
    const comment = compactText(getNodeText(annotationRecord.comment))

    const mergedReferences = mergeReferences(
        customAnnotations?.references,
        references
    )
    const unstructured: unknown =
        customAnnotations?.unstructured ??
        (comment.length > 0 ? createPlainTextEditorState(comment) : undefined)

    if (!unstructured && mergedReferences.length === 0) {
        return undefined
    }

    return {
        unstructured: unstructured ?? createPlainTextEditorState(''),
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

export function buildGinmlAnnotationObject(
    annotations: PersistedAnnotations | undefined
): Record<string, unknown> | undefined {
    if (!annotations) {
        return undefined
    }

    const references = (annotations.references ?? []).filter(
        (reference) => reference.trim().length > 0
    )
    const comment = annotationsToPlainText(annotations)

    const annotation: Record<string, unknown> = {}

    if (references.length > 0) {
        annotation.linklist = {
            link: references.map((reference) => ({
                '@_xlink:href': reference,
            })),
        }
    }

    if (comment.length > 0) {
        annotation.comment = comment
    }

    annotation[GINML_ANNOTATIONS_TAG] = {
        '@_xmlns:grn': GINML_NAMESPACES.grn,
        '@_grn:version': '1',
        [GINML_PAYLOAD_TAG]: JSON.stringify(annotations),
    }

    return annotation
}

function parseAnnotationReferences(annotationRecord: XmlRecord): string[] {
    const links = ensureArray(asRecord(annotationRecord.linklist)?.link)

    return mergeReferences(
        links
            .map((link) => getAttribute(asRecord(link), 'xlink:href'))
            .filter((reference): reference is string => !!reference)
    )
}

function parseCustomAnnotations(
    annotationRecord: XmlRecord
): PersistedAnnotations | undefined {
    const customAnnotation = asRecord(annotationRecord[GINML_ANNOTATIONS_TAG])
    const payloadNode: unknown = customAnnotation?.[GINML_PAYLOAD_TAG]

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
        throw new Error('Invalid GRN annotation payload in GINML annotation.')
    }
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

    return ensureArray(record.children)
        .map((child) => collectEditorText(child))
        .join('')
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
