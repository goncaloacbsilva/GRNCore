import { useMemo, useState } from 'react'
import { useStore, type Node, type Edge, useReactFlow } from '@xyflow/react'
import { ChevronDownIcon, PencilIcon, SaveIcon } from 'lucide-react'
import { shallow } from 'zustand/shallow'

import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Editor } from './tiptap-editor'
import { ReferencesEditor } from './links-editor'
import { useEditorStore } from '@/store'
import { twJoin } from 'tailwind-merge'
import type { SerializedEditorState } from 'lexical'

const emptySerializedEditorState = {
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

const EMPTY_REFERENCES: string[] = []

function useAnnotationsPersistence(
    selectedNodes: Node<RegulatoryNodeProperties>[],
    selectedEdges: Edge<EditableRegulatoryEdge>[]
) {
    const { updateNodeData, updateEdgeData } = useReactFlow<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >()
    const modelAnnotations = useEditorStore((state) => state.modelAnnotations)
    const setModelAnnotations = useEditorStore(
        (state) => state.setModelAnnotations
    )

    const hasSingleSelectedElement =
        selectedNodes.length == 1 || selectedEdges.length == 1

    if (hasSingleSelectedElement) {
        if (selectedEdges.length == 1) {
            return {
                annotations: selectedEdges[0].data?.annotations,
                updateAnnotations: (newAnnotations: {
                    unstructured: SerializedEditorState
                    references: string[]
                }) => {
                    updateEdgeData(selectedEdges[0].id, {
                        annotations: newAnnotations,
                    })
                },
            }
        } else {
            // If there's a single selected node, use its annotations
            return {
                annotations: selectedNodes[0].data.annotations,
                updateAnnotations: (newAnnotations: {
                    unstructured: SerializedEditorState
                    references: string[]
                }) => {
                    updateNodeData(selectedNodes[0].id, {
                        annotations: newAnnotations,
                    })
                },
            }
        }
    } else {
        // If there are no selected elements, use the model annotations
        return {
            annotations: {
                unstructured: modelAnnotations,
                references: EMPTY_REFERENCES,
            },
            updateAnnotations: (newAnnotations: {
                unstructured: SerializedEditorState
                references: string[]
            }) => {
                setModelAnnotations(newAnnotations.unstructured)
            },
        }
    }
}

export function Annotations() {
    const { selectedNodes, selectedEdges } = useStore(
        (state) => ({
            selectedNodes: state.nodes.filter(
                (node) => node.selected
            ) as Node<RegulatoryNodeProperties>[],
            selectedEdges: state.edges.filter(
                (edge) => edge.selected
            ) as Edge<EditableRegulatoryEdge>[],
        }),
        shallow
    )

    const { annotations, updateAnnotations } = useAnnotationsPersistence(
        selectedNodes,
        selectedEdges
    )
    const persistedUnstructured = annotations?.unstructured
    const persistedReferences = annotations?.references ?? EMPTY_REFERENCES

    const isOpen = useEditorStore((state) => state.annotationsPanelOpen)
    const setIsOpen = useEditorStore((state) => state.setAnnotationsPanelOpen)
    const [editingAnnotationKey, setEditingAnnotationKey] = useState<
        string | null
    >(null)
    const [draftUnstructured, setDraftUnstructured] =
        useState<SerializedEditorState>(
            () => persistedUnstructured ?? emptySerializedEditorState
        )
    const [draftReferences, setDraftReferences] = useState<string[]>(
        () => persistedReferences
    )
    const selectedElements = selectedNodes.length + selectedEdges.length
    const hasSingleSelectedElement =
        selectedNodes.length == 1 || selectedEdges.length == 1
    const annotationTitle =
        selectedElements == 0
            ? 'Model Annotations'
            : selectedNodes.length == 1
              ? `${selectedNodes[0].data.name} Annotations`
              : 'Edge Annotations'
    const annotationKey =
        selectedEdges[0]?.id ?? selectedNodes[0]?.id ?? 'model'
    const isEditing = editingAnnotationKey === annotationKey
    const viewUnstructured = persistedUnstructured ?? emptySerializedEditorState
    const references = isEditing ? draftReferences : persistedReferences
    const viewEditorStateKey = useMemo(
        () => JSON.stringify(viewUnstructured),
        [viewUnstructured]
    )
    const editorKey = isEditing
        ? `${annotationKey}-editing`
        : `${annotationKey}-${viewEditorStateKey}`

    const handleEditButtonClick = () => {
        if (!isEditing) {
            setDraftUnstructured(viewUnstructured)
            setDraftReferences(persistedReferences)
            setEditingAnnotationKey(annotationKey)
            return
        }

        updateAnnotations({
            unstructured: draftUnstructured,
            references: draftReferences,
        })
        setEditingAnnotationKey(null)
    }

    if (selectedElements >= 2) {
        return null
    }

    return (
        <div
            data-annotation-editor="true"
            className="pointer-events-none flex h-60 items-end"
        >
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className={twJoin(
                    'bg-background pointer-events-auto flex h-10 min-h-0 flex-col overflow-hidden rounded-lg border transition-all duration-200 ease-out data-[state=open]:h-full',
                    selectedElements === 0 ? 'w-140' : 'w-200'
                )}
            >
                <TooltipProvider>
                    <div className="flex h-10 shrink-0 items-center justify-between gap-2 overflow-auto border-b p-1">
                        <CollapsibleTrigger className="group flex items-center rounded-sm px-2 py-1 text-sm font-medium hover:bg-accent data-[state=open]:bg-accent">
                            <ChevronDownIcon
                                size={18}
                                className="ml-auto group-data-[state=open]:rotate-180"
                            />
                            <h3 className="pl-2 font-semibold">
                                {annotationTitle}
                            </h3>
                        </CollapsibleTrigger>
                        {isOpen ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-2"
                                        onClick={handleEditButtonClick}
                                        aria-label={
                                            isEditing
                                                ? 'Save annotation details'
                                                : 'Edit annotation details'
                                        }
                                    >
                                        {isEditing ? (
                                            <SaveIcon className="size-4" />
                                        ) : (
                                            <PencilIcon className="size-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isEditing
                                        ? 'Save changes'
                                        : 'Edit details'}
                                </TooltipContent>
                            </Tooltip>
                        ) : null}
                    </div>
                </TooltipProvider>
                <CollapsibleContent
                    forceMount
                    className="min-h-0 overflow-hidden data-[state=closed]:h-0 data-[state=closed]:grow-0 data-[state=closed]:shrink-0 data-[state=open]:flex-1"
                >
                    {hasSingleSelectedElement ? (
                        <div className="flex h-full min-h-0 min-w-0">
                            <div className="min-h-0 min-w-0 flex-[1.4]">
                                <Editor
                                    key={editorKey}
                                    editorSerializedState={viewUnstructured}
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
                    ) : (
                        <div className="h-full min-h-0">
                            <Editor
                                key={editorKey}
                                editorSerializedState={viewUnstructured}
                                onSerializedChange={setDraftUnstructured}
                                isEditing={isEditing}
                            />
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
