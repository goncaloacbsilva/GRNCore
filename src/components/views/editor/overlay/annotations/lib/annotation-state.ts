import type { SerializedEditorState } from 'lexical'

export interface AnnotationDraft {
    unstructured: SerializedEditorState
    references: string[]
}

export interface PersistedAnnotations {
    unstructured?: SerializedEditorState | null
    references?: string[]
}

export const emptySerializedEditorState = {
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
} as unknown as SerializedEditorState

export const EMPTY_REFERENCES: string[] = []

export function getPersistedUnstructured(
    annotations: PersistedAnnotations | undefined
) {
    return annotations?.unstructured ?? emptySerializedEditorState
}

export function getPersistedReferences(
    annotations: PersistedAnnotations | undefined
) {
    return annotations?.references ?? EMPTY_REFERENCES
}
