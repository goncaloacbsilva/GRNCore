import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from '@/components/ui/menubar'
import { Button } from '@/components/ui/button'
import { InterchangeFormat } from '@/lib/interchange'
import { InterchangeFormatDescription } from '@/lib/interchange/interchanger'
import { getLocalModelSnapshot, listLocalModels } from '@/lib/persistence'
import type { ModelMetadata } from '@/lib/schema'
import { useChangesTracking, useEditorStore } from '@/store'
import { EditModelDetailsDialog } from '@/components/views/models/edit-model-details-dialog'
import { useState } from 'react'
import { toast } from 'sonner'

export function FileMenu() {
    const activeModelId = useChangesTracking((state) => state.activeModelId)
    const exportModel = useChangesTracking((state) => state.export)
    const setSnapshotAnnotations = useChangesTracking(
        (state) => state.setSnapshotAnnotations
    )
    const setSnapshotTitle = useChangesTracking(
        (state) => state.setSnapshotTitle
    )
    const setModelTitle = useEditorStore((state) => state.setModelTitle)
    const setImportDialogOpen = useEditorStore(
        (state) => state.setImportModelDialogVisible
    )
    const [importWarningOpen, setImportWarningOpen] = useState(false)
    const [editDetailsOpen, setEditDetailsOpen] = useState(false)
    const [editDetailsItem, setEditDetailsItem] =
        useState<ModelMetadata | null>(null)

    const getDescription = (format: InterchangeFormat) => {
        const desc = InterchangeFormatDescription[format].split(' ')

        return (
            <>
                {desc.slice(0, -1).join(' ')}
                <strong>{desc[desc.length - 1]}</strong>
            </>
        )
    }

    const handleOpenEditDetails = async () => {
        if (!activeModelId) {
            return
        }

        const items = await listLocalModels()
        const item = items.find((entry) => entry.id === activeModelId)

        if (!item) {
            toast.error('Failed to load model details', {
                description: 'The current model metadata could not be found.',
                position: 'top-right',
            })
            return
        }

        setEditDetailsItem(item)
        setEditDetailsOpen(true)
    }

    return (
        <>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarSub>
                            <MenubarSubTrigger>Export</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarGroup>
                                    {Object.values(InterchangeFormat).map(
                                        (format) => (
                                            <MenubarItem
                                                onClick={() =>
                                                    exportModel(format)
                                                }
                                                key={format}
                                            >
                                                {getDescription(format)}
                                            </MenubarItem>
                                        )
                                    )}
                                </MenubarGroup>
                                {/* <MenubarSeparator />
                                <MenubarGroup>
                                    <MenubarItem>Image (.png)</MenubarItem>
                                    <MenubarItem>Image (.svg)</MenubarItem>
                                </MenubarGroup> */}
                            </MenubarSubContent>
                        </MenubarSub>
                        <MenubarItem
                            onSelect={() => setImportWarningOpen(true)}
                        >
                            Import
                        </MenubarItem>
                        <MenubarItem
                            disabled={!activeModelId}
                            onSelect={() => {
                                void handleOpenEditDetails()
                            }}
                        >
                            Model Details
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            <Dialog
                open={importWarningOpen}
                onOpenChange={setImportWarningOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Overwrite Current Model?</DialogTitle>
                        <DialogDescription>
                            Importing from the editor will overwrite the current
                            model and replace it with the imported one. This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setImportWarningOpen(false)
                                setImportDialogOpen(true)
                            }}
                        >
                            Proceed
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {editDetailsItem ? (
                <EditModelDetailsDialog
                    item={editDetailsItem}
                    open={editDetailsOpen}
                    onOpenChange={setEditDetailsOpen}
                    onSave={(updatedItem) => {
                        setEditDetailsItem(updatedItem)
                        setModelTitle(updatedItem.title)
                        setSnapshotTitle(updatedItem.title)

                        void getLocalModelSnapshot(updatedItem.id).then(
                            (snapshot) => {
                                if (!snapshot) {
                                    return
                                }

                                setSnapshotAnnotations(snapshot.annotations)
                            }
                        )
                    }}
                />
            ) : null}
        </>
    )
}
