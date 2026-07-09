import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'
import { EditModelDetailsDialog } from '@/components/views/models/edit-model-details-dialog'
import { useElementsActions, useHistory } from '@/hooks'
import { getLocalModelSnapshot, listLocalModels } from '@/lib/persistence'
import type { ModelMetadata } from '@/lib/schema'
import { useChangesTracking } from '@/store'
import { formatForDisplay } from '@tanstack/react-hotkeys'
import { useEditorStore } from '@/store'
import { useState } from 'react'
import { toast } from 'sonner'

export function EditMenu() {
    const { copyAction, pasteAction, cutAction } = useElementsActions()
    const activeModelId = useChangesTracking((state) => state.activeModelId)
    const snapshot = useChangesTracking((state) => state.snapshot)
    const getBaselinePosition = useChangesTracking(
        (state) => state.getBaselinePosition
    )
    const getHistoryPosition = useChangesTracking(
        (state) => state.getHistoryPosition
    )
    const canHistoryForward = useChangesTracking(
        (state) => state.canHistoryForward
    )
    useChangesTracking((state) => state.baselineVersion)
    const setSnapshotAnnotations = useChangesTracking(
        (state) => state.setSnapshotAnnotations
    )
    const setSnapshotTitle = useChangesTracking(
        (state) => state.setSnapshotTitle
    )
    const setModelTitle = useEditorStore((state) => state.setModelTitle)
    const { undo, redo } = useHistory()
    const [editDetailsOpen, setEditDetailsOpen] = useState(false)
    const [editDetailsItem, setEditDetailsItem] =
        useState<ModelMetadata | null>(null)
    const baselinePosition = getBaselinePosition()
    const canUndo = snapshot ? getHistoryPosition() > baselinePosition : false
    const canRedo = snapshot ? canHistoryForward() : false

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
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem disabled={!canUndo} onClick={() => undo()}>
                            Undo{' '}
                            <MenubarShortcut>
                                {formatForDisplay('Mod+Z')}
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem disabled={!canRedo} onClick={() => redo()}>
                            Redo{' '}
                            <MenubarShortcut>
                                {formatForDisplay('Mod+Shift+Z')}
                            </MenubarShortcut>
                        </MenubarItem>
                    </MenubarGroup>
                    <MenubarSeparator />
                    <MenubarGroup>
                        <MenubarItem onSelect={cutAction}>
                            Cut
                            <MenubarShortcut>
                                {formatForDisplay('Mod+X')}
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onSelect={copyAction}>
                            Copy{' '}
                            <MenubarShortcut>
                                {formatForDisplay('Mod+C')}
                            </MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onSelect={pasteAction}>
                            Paste{' '}
                            <MenubarShortcut>
                                {formatForDisplay('Mod+V')}
                            </MenubarShortcut>
                        </MenubarItem>
                    </MenubarGroup>
                    <MenubarSeparator />
                    <MenubarGroup>
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
