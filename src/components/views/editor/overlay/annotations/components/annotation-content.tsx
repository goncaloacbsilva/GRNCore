import { ReferencesEditor } from './references-editor'
import { Editor } from '../tiptap-editor'
import type { useAnnotationEditing } from '../hooks/use-annotation-editing'

interface AnnotationContentProps extends ReturnType<
    typeof useAnnotationEditing
> {
    hasReferences: boolean
}

export function AnnotationContent({
    editorKey,
    editorSerializedState,
    hasReferences,
    isEditing,
    references,
    setDraftReferences,
    setDraftUnstructured,
}: AnnotationContentProps) {
    if (!hasReferences) {
        return (
            <div className="h-full min-h-0">
                <Editor
                    key={editorKey}
                    editorSerializedState={editorSerializedState}
                    onSerializedChange={setDraftUnstructured}
                    isEditing={isEditing}
                />
            </div>
        )
    }

    return (
        <div className="flex h-full min-h-0 min-w-0">
            <div className="min-h-0 min-w-0 flex-[1.8]">
                <Editor
                    key={editorKey}
                    editorSerializedState={editorSerializedState}
                    onSerializedChange={setDraftUnstructured}
                    isEditing={isEditing}
                />
            </div>
            <div className="min-h-0 w-px shrink-0 bg-border" />
            <div className="min-h-0 min-w-0 flex-1">
                <ReferencesEditor
                    isEditing={isEditing}
                    references={references}
                    onReferencesChange={setDraftReferences}
                />
            </div>
        </div>
    )
}
