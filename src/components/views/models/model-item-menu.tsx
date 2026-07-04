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
import { useNavigate } from '@tanstack/react-router'
import { EllipsisIcon, PencilIcon, TrashIcon } from 'lucide-react'

interface ModelItemMenuProps {
    item: ModelMetadata
}

export function ModelItemMenu({ item }: ModelItemMenuProps) {
    const navigate = useNavigate()

    return (
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
                        <DropdownMenuItem>
                            <PencilIcon />
                            Edit Details
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem variant="destructive">
                            <TrashIcon />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
