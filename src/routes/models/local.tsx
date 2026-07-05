import { ModelsList } from '@/components/views/models/models-list'
import { ImportModelDialog } from '@/components/views/editor/dialogs'
import { deleteLocalModel, listLocalModels } from '@/lib/persistence'
import type { ModelMetadata } from '@/lib/schema'
import { useLocalModelImportStore } from '@/store'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

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
    const [items, setItems] = useState(loaderItems)
    const setOnImported = useLocalModelImportStore(
        (state) => state.setOnImported
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

    return (
        <>
            <ModelsList
                items={items}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
            <ImportModelDialog mode="local-models" />
        </>
    )
}
