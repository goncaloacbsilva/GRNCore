import { useEditorStore } from '@/store'
import { twJoin } from 'tailwind-merge'
import { AnnotationCard, AnnotationContent } from './components'
import { useAnnotationEditing, useAnnotationTarget } from './hooks'

export function Annotations() {
    const annotationTarget = useAnnotationTarget()
    const isOpen = useEditorStore((state) => state.annotationsPanelOpen)
    const setIsOpen = useEditorStore((state) => state.setAnnotationsPanelOpen)
    const isConnectModeEnabled = useEditorStore(
        (state) => state.connectModeEnabled
    )
    const editingState = useAnnotationEditing({
        annotationKey: annotationTarget.key,
        annotations: annotationTarget.annotations,
        onSave: annotationTarget.updateAnnotations,
    })

    if (annotationTarget.selectedElements >= 2) {
        return null
    }

    return (
        <div
            data-annotation-editor="true"
            className={twJoin(
                'pointer-events-none flex h-70 items-end',
                !annotationTarget.isModelTarget && '-translate-x-20',
                isConnectModeEnabled && 'hidden'
            )}
        >
            <AnnotationCard
                isEditing={editingState.isEditing}
                isOpen={isOpen}
                onEditButtonClick={editingState.toggleEditMode}
                onOpenChange={setIsOpen}
                title={annotationTarget.title}
                widthClassName={annotationTarget.widthClassName}
            >
                <AnnotationContent
                    {...editingState}
                    hasReferences={annotationTarget.hasSingleSelectedElement}
                />
            </AnnotationCard>
        </div>
    )
}
