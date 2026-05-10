import { useMemo, useState } from 'react'

import {
    getPersistedReferences,
    getPersistedUnstructured,
    type AnnotationDraft,
    type PersistedAnnotations,
} from '../lib/annotation-state'

interface UseAnnotationEditingOptions {
    annotationKey: string
    annotations: PersistedAnnotations | undefined
    onSave: (annotations: AnnotationDraft) => void
}

export function useAnnotationEditing({
    annotationKey,
    annotations,
    onSave,
}: UseAnnotationEditingOptions) {
    const persistedUnstructured = getPersistedUnstructured(annotations)
    const persistedReferences = getPersistedReferences(annotations)
    const [editingAnnotationKey, setEditingAnnotationKey] = useState<
        string | null
    >(null)
    const [draftUnstructured, setDraftUnstructured] = useState(
        () => persistedUnstructured
    )
    const [draftReferences, setDraftReferences] = useState(
        () => persistedReferences
    )
    const isEditing = editingAnnotationKey === annotationKey
    const references = isEditing ? draftReferences : persistedReferences
    const viewEditorStateKey = useMemo(
        () => JSON.stringify(persistedUnstructured),
        [persistedUnstructured]
    )
    const editorKey = isEditing
        ? `${annotationKey}-editing`
        : `${annotationKey}-${viewEditorStateKey}`

    const toggleEditMode = () => {
        if (!isEditing) {
            setDraftUnstructured(persistedUnstructured)
            setDraftReferences(persistedReferences)
            setEditingAnnotationKey(annotationKey)
            return
        }

        onSave({
            unstructured: draftUnstructured,
            references: draftReferences,
        })
        setEditingAnnotationKey(null)
    }

    return {
        editorKey,
        editorSerializedState: persistedUnstructured,
        isEditing,
        references,
        setDraftReferences,
        setDraftUnstructured,
        toggleEditMode,
    }
}
