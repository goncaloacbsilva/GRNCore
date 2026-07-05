import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ModelMetadata } from '@/lib/schema'
import { useChangesTracking } from '@/store'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { EllipsisIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { EditModelDetailsDialog } from './edit-model-details-dialog'

interface ModelItemMenuProps {
    item: ModelMetadata
    onDelete: (modelId: string) => Promise<void> | void
    onEdit: (item: ModelMetadata) => Promise<void> | void
}

export function ModelItemMenu({ item, onDelete, onEdit }: ModelItemMenuProps) {
    const navigate = useNavigate()
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
                        void navigate({
                            to: '/edit/$modelId',
                            params: { modelId: item.id },
                        })
                    }
                >
                    Open Model
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full focus-visible:ring-transparent focus-visible:border-"
                        >
                            <EllipsisIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onSelect={(event) => {
                                    event.preventDefault()
                                    setEditDialogOpen(true)
                                }}
                            >
                                <PencilIcon />
                                Edit Details
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={(event) => {
                                    event.preventDefault()
                                    void handleDelete()
                                }}
                            >
                                <TrashIcon />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
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
