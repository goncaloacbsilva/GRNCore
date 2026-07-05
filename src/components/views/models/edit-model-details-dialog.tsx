'use client'

import { useAppForm } from '@/components/forms'
import { Editor } from '@/components/views/editor/overlay/annotations/tiptap-editor'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
} from '@/components/ui/field'
import {
    getLocalModelSnapshot,
    updateLocalModelDetails,
} from '@/lib/persistence'
import {
    emptySerializedEditorState,
    getPersistedUnstructured,
} from '@/components/views/editor/overlay/annotations/lib/annotation-state'
import {
    MODEL_METADATA_TAG_GROUPS,
    ModelMetadataDetailsSchema,
    type ModelMetadata,
} from '@/lib/schema'
import type { SerializedEditorState } from 'lexical'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface EditModelDetailsDialogProps {
    item: ModelMetadata
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (item: ModelMetadata) => void
}

export function EditModelDetailsDialog({
    item,
    open,
    onOpenChange,
    onSave,
}: EditModelDetailsDialogProps) {
    const [initialDescription, setInitialDescription] =
        useState<SerializedEditorState>(emptySerializedEditorState)
    const [draftDescription, setDraftDescription] =
        useState<SerializedEditorState>(emptySerializedEditorState)
    const [editorKey, setEditorKey] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const form = useAppForm({
        defaultValues: {
            title: item.title,
            author: item.author,
            tags: item.tags,
        },
        validators: {
            onSubmit: ({ formApi }) =>
                formApi.parseValuesWithSchema(ModelMetadataDetailsSchema),
        },
        onSubmit: async ({ value }) => {
            setIsSaving(true)

            try {
                const updatedItem = await updateLocalModelDetails(item.id, {
                    ...value,
                    description: draftDescription,
                })

                onSave(updatedItem)
                onOpenChange(false)
                toast.success('Model details updated')
            } catch (error) {
                toast.error('Failed to update model details', {
                    description:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                    position: 'top-right',
                })
            } finally {
                setIsSaving(false)
            }
        },
    })
    useEffect(() => {
        if (!open) {
            return
        }

        let cancelled = false

        void Promise.resolve().then(async () => {
            if (cancelled) {
                return
            }

            setIsLoading(true)
            setLoadError(null)

            try {
                const snapshot = await getLocalModelSnapshot(item.id)

                if (!snapshot) {
                    throw new Error('Model snapshot not found.')
                }

                form.reset({
                    title: item.title,
                    author: item.author,
                    tags: item.tags,
                })
                const nextDescription =
                    getPersistedUnstructured(snapshot.annotations) ??
                    emptySerializedEditorState

                setInitialDescription(nextDescription)
                setDraftDescription(nextDescription)
                setEditorKey((current) => current + 1)
            } catch (error) {
                if (cancelled) {
                    return
                }

                setLoadError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to load model details.'
                )
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        })

        return () => {
            cancelled = true
        }
    }, [form, item.author, item.id, item.tags, item.title, open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                size="full"
                className="flex max-h-[78vh] w-2xl flex-col gap-0 overflow-hidden p-0"
            >
                <DialogHeader className="sticky top-0 z-20 shrink-0 border-b bg-background px-6 pt-6 pb-4">
                    <DialogTitle>Edit Details</DialogTitle>
                    <DialogDescription>
                        Update the model title, description, author, and tags.
                    </DialogDescription>
                </DialogHeader>
                {loadError ? (
                    <div className="m-6 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                        {loadError}
                    </div>
                ) : (
                    <form
                        className="flex min-h-0 flex-1 flex-col overflow-hidden"
                        onSubmit={(event) => {
                            event.preventDefault()
                            void form.handleSubmit()
                        }}
                    >
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                            <div className="space-y-5 overflow-y-auto px-6 py-5">
                                <form.AppField
                                    name="title"
                                    children={(field) => (
                                        <field.TextField
                                            orientation="vertical"
                                            label="Title"
                                            placeholder="Model title"
                                        />
                                    )}
                                />
                                <form.AppField
                                    name="author"
                                    children={(field) => (
                                        <field.TextField
                                            orientation="vertical"
                                            label="Author"
                                            placeholder="Author"
                                        />
                                    )}
                                />
                                <form.AppField
                                    name="tags"
                                    children={(field) => (
                                        <field.TagsField
                                            label="Tags"
                                            description="Select one or more metadata tags for this model."
                                            options={MODEL_METADATA_TAG_GROUPS}
                                        />
                                    )}
                                />
                                <Field className="min-h-0 overflow-hidden border-t pt-5">
                                    <FieldContent className="min-h-0 overflow-hidden">
                                        <FieldLabel>Description</FieldLabel>
                                        <FieldDescription className="pb-3">
                                            Edit the model description using the
                                            rich text editor.
                                        </FieldDescription>
                                        <div className="h-[min(36vh,24rem)] min-h-[14rem] overflow-hidden rounded-md border bg-background">
                                            {isLoading ? (
                                                <div className="flex h-full min-h-[14rem] items-center justify-center text-sm text-muted-foreground">
                                                    Loading description...
                                                </div>
                                            ) : (
                                                <Editor
                                                    key={editorKey}
                                                    autoFocus={false}
                                                    editorSerializedState={
                                                        initialDescription
                                                    }
                                                    onSerializedChange={
                                                        setDraftDescription
                                                    }
                                                    isEditing={true}
                                                />
                                            )}
                                        </div>
                                    </FieldContent>
                                </Field>
                            </div>
                        </div>
                        <DialogFooter className="shrink-0 border-t bg-background px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="hover:cursor-pointer"
                                disabled={isLoading || isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
