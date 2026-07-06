import { Button } from '@/components/ui/button'
import type { ModelMetadata } from '@/lib/schema'
import { usePageTransitionNavigate } from '@/hooks/use-page-transition'
import { useChangesTracking } from '@/store'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { EditModelDetailsDialog } from './edit-model-details-dialog'

interface ModelItemMenuProps {
    item: ModelMetadata
    onDelete: (modelId: string) => Promise<void> | void
    onEdit: (item: ModelMetadata) => Promise<void> | void
}

export function ModelItemMenu({ item, onDelete, onEdit }: ModelItemMenuProps) {
    const navigate = useNavigate()
    const navigateWithTransition = usePageTransitionNavigate()
    const location = useLocation()
    const clearLoadedModel = useChangesTracking(
        (state) => state.clearLoadedModel
    )
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    const handleDelete = async () => {
        await onDelete(item.id)

        if (location.pathname === `/edit/${item.id}`) {
            clearLoadedModel()
            void navigate({ to: '/models/local', replace: true })
        }
    }

    return (
        <>
            <div className="flex flex-row items-center gap-2">
                <Button
                    className="cursor-pointer"
                    onClick={() =>
                        void navigateWithTransition('forward', () =>
                            navigate({
                                to: '/edit/$modelId',
                                params: { modelId: item.id },
                            })
                        )
                    }
                >
                    Open Model
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setEditDialogOpen(true)}
                >
                    <PencilIcon />
                    Edit Details
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => void handleDelete()}
                >
                    <TrashIcon />
                    Delete
                </Button>
            </div>
            <EditModelDetailsDialog
                item={item}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                onSave={(updatedItem) => {
                    void onEdit(updatedItem)
                }}
            />
        </>
    )
}
