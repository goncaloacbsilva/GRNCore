import { ModelsList } from '@/components/views/models/models-list'
import { ImportModelDialog } from '@/components/views/editor/dialogs'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { deleteLocalModel, listLocalModels } from '@/lib/persistence'
import type { ModelMetadata } from '@/lib/schema'
import {
    MODEL_SORT_OPTIONS,
    type ModelsSortOption,
    useLocalModelImportStore,
    useModelsFiltersStore,
} from '@/store'
import { createFileRoute } from '@tanstack/react-router'
import { SearchXIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

export const Route = createFileRoute('/models/local')({
    loader: async () => listLocalModels(),
    shouldReload: true,
    component: RouteComponent,
    staticData: {
        getTitle: () => 'Local Models',
    },
})

function RouteComponent() {
    const loaderItems = Route.useLoaderData()

    return (
        <LocalModelsContent
            key={JSON.stringify(loaderItems)}
            initialItems={loaderItems}
        />
    )
}

interface LocalModelsContentProps {
    initialItems: ModelMetadata[]
}

const sortModels = (items: ModelMetadata[], sortBy: ModelsSortOption) =>
    [...items].sort((left, right) => {
        switch (sortBy) {
            case MODEL_SORT_OPTIONS.LastChangedAsc:
                return left.lastChangedAt - right.lastChangedAt
            case MODEL_SORT_OPTIONS.TitleAsc:
                return left.title.localeCompare(right.title, undefined, {
                    sensitivity: 'base',
                })
            case MODEL_SORT_OPTIONS.TitleDesc:
                return right.title.localeCompare(left.title, undefined, {
                    sensitivity: 'base',
                })
            case MODEL_SORT_OPTIONS.LastChangedDesc:
            default:
                return right.lastChangedAt - left.lastChangedAt
        }
    })

function LocalModelsContent({ initialItems }: LocalModelsContentProps) {
    const [items, setItems] = useState(initialItems)
    const setOnImported = useLocalModelImportStore(
        (state) => state.setOnImported
    )
    const { query, selectedTags, sortBy } = useModelsFiltersStore(
        useShallow((state) => ({
            query: state.query,
            selectedTags: state.selectedTags,
            sortBy: state.sortBy,
        }))
    )

    useEffect(() => {
        setOnImported((metadata) => {
            setItems((currentItems) => [...currentItems, metadata])
        })

        return () => {
            setOnImported(null)
        }
    }, [setOnImported])

    const handleDelete = async (modelId: string) => {
        await deleteLocalModel(modelId)
        setItems((currentItems) =>
            currentItems.filter((item) => item.id !== modelId)
        )
    }

    const handleEdit = (updatedItem: ModelMetadata) => {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
            )
        )
    }

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        return sortModels(
            items.filter((item) => {
                const matchesQuery =
                    normalizedQuery.length === 0 ||
                    item.title.toLowerCase().includes(normalizedQuery) ||
                    item.description.toLowerCase().includes(normalizedQuery)

                const matchesTags =
                    selectedTags.length === 0 ||
                    selectedTags.every((tag) => item.tags.includes(tag))

                return matchesQuery && matchesTags
            }),
            sortBy
        )
    }, [items, query, selectedTags, sortBy])

    return (
        <>
            {filteredItems.length === 0 && items.length > 0 ? (
                <Empty className="p-4">
                    <EmptyHeader>
                        <EmptyMedia
                            variant="icon"
                            className="bg-[#2F80ED] text-sidebar-primary-foreground"
                        >
                            <SearchXIcon className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>No models match your filters</EmptyTitle>
                        <EmptyDescription>
                            Adjust the search query or selected tags to find a
                            model.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent />
                </Empty>
            ) : (
                <ModelsList
                    items={filteredItems}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            )}
            <ImportModelDialog mode="local-models" />
        </>
    )
}
