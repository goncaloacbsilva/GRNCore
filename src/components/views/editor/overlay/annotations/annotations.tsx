import { useState } from 'react'
import { useStore, type Node, type Edge } from '@xyflow/react'
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

    const isOpen = useEditorStore((state) => state.annotationsPanelOpen)
    const setIsOpen = useEditorStore((state) => state.setAnnotationsPanelOpen)

    const [isEditing, setIsEditing] = useState(false)

    const selectedElements = selectedNodes.length + selectedEdges.length
    const hasSingleSelectedElement =
        selectedNodes.length == 1 || selectedEdges.length == 1
    const annotationTitle =
        selectedElements == 0
            ? 'Model Annotations'
            : selectedNodes.length == 1
              ? `${selectedNodes[0].data.name} Annotations`
              : 'Edge Annotations'

    if (selectedElements >= 2) {
        return null
    }

    return (
        <div className="pointer-events-none flex h-60 items-end">
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className={twJoin(
                    'bg-background pointer-events-auto flex h-10 min-h-0 flex-col overflow-hidden rounded-lg border transition-all duration-200 ease-out data-[state=open]:h-full',
                    selectedElements === 0 ? 'w-160' : 'w-200'
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
                                        onClick={() =>
                                            setIsEditing(
                                                (currentIsEditing) =>
                                                    !currentIsEditing
                                            )
                                        }
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
                                    onSerializedChange={console.log}
                                    isEditing={isEditing}
                                />
                            </div>
                            <div className="min-h-0 w-px shrink-0 bg-border" />
                            <div className="min-h-0 min-w-0 flex-1">
                                <ReferencesEditor isEditing={isEditing} />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-0">
                            <Editor isEditing={isEditing} />
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
