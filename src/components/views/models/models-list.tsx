import type { ModelMetadata } from '@/lib/schema'
import { ModelItem } from './model-item'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { DnaOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateModel } from '@/hooks/use-create-model'
import { useLocalModelImportStore } from '@/store'

export interface ModelsListProps {
    items: ModelMetadata[]
    onDelete: (modelId: string) => Promise<void> | void
    onEdit: (item: ModelMetadata) => Promise<void> | void
}

function ModelsListEmpty() {
    const { createModel } = useCreateModel()
    const { setOpen, setDestination } = useLocalModelImportStore((state) => ({
        setOpen: state.setOpen,
        setDestination: state.setDestination,
    }))

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia
                    variant="icon"
                    className="bg-[#2F80ED] text-sidebar-primary-foreground"
                >
                    <DnaOffIcon className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No Models Available</EmptyTitle>
                <EmptyDescription>
                    You don&apos;t have any models yet. <br /> Get started by
                    adding your first model.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
                <Button
                    className="hover:cursor-pointer"
                    onClick={() => void createModel()}
                >
                    Create Model
                </Button>
                <Button
                    className="hover:cursor-pointer"
                    variant="outline"
                    onClick={() => {
                        setDestination('list')
                        setOpen(true)
                    }}
                >
                    Upload Model
                </Button>
            </EmptyContent>
        </Empty>
    )
}

export function ModelsList({ items, onDelete, onEdit }: ModelsListProps) {
    return (
        <div className="flex flex-col gap-6 p-4">
            {items.length === 0 ? (
                <ModelsListEmpty />
            ) : (
                items.map((model) => (
                    <ModelItem
                        key={model.id}
                        item={model}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                ))
            )}
        </div>
    )
}
