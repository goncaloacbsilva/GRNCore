import { FilterableModelsList } from '@/components/views/models'
import { emptySerializedEditorState } from '@/components/views/editor/overlay/annotations/lib/annotation-state'
import {
    deleteLocalModel,
    getLocalModelSnapshot,
    listLocalModels,
} from '@/lib/persistence'
import {
    MODEL_METADATA_TAG_VALUES,
    ModelMetadataSchema,
    type ModelMetadata,
} from '@/lib/schema'
import { useChangesTracking, useLocalModelImportStore } from '@/store'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'

const LocalModelsLoaderDataSchema = z.array(ModelMetadataSchema)

export const Route = createFileRoute('/models/local')({
    loader: async () => listLocalModels(),
    shouldReload: true,
    component: RouteComponent,
    staticData: {
        getTitle: () => 'Local Models',
    },
})

function RouteComponent() {
    const loaderItems = LocalModelsLoaderDataSchema.parse(Route.useLoaderData())

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

function LocalModelsContent({ initialItems }: LocalModelsContentProps) {
    const [items, setItems] = useState(initialItems)
    const activeModelId = useChangesTracking((state) => state.activeModelId)
    const autoDeleteEmptyModelId = useChangesTracking(
        (state) => state.autoDeleteEmptyModelId
    )
    const clearLoadedModel = useChangesTracking(
        (state) => state.clearLoadedModel
    )
    const markAutoDeleteEmptyModel = useChangesTracking(
        (state) => state.markAutoDeleteEmptyModel
    )
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

    useEffect(() => {
        if (!autoDeleteEmptyModelId) {
            return
        }

        let cancelled = false

        const isEmptyDraftSnapshot = async () => {
            const savedSnapshot = await getLocalModelSnapshot(
                autoDeleteEmptyModelId
            )

            if (!savedSnapshot) {
                return false
            }

            const hasEmptyAnnotations =
                savedSnapshot.annotations === undefined ||
                ((savedSnapshot.annotations.references?.length ?? 0) === 0 &&
                    JSON.stringify(
                        savedSnapshot.annotations.unstructured ??
                            emptySerializedEditorState
                    ) === JSON.stringify(emptySerializedEditorState))

            return (
                savedSnapshot.nodes.length === 0 &&
                savedSnapshot.edges.length === 0 &&
                hasEmptyAnnotations
            )
        }

        void isEmptyDraftSnapshot().then((shouldDeleteEmptyDraft) => {
            if (cancelled) {
                return
            }

            if (!shouldDeleteEmptyDraft) {
                markAutoDeleteEmptyModel(null)
                return
            }

            void deleteLocalModel(autoDeleteEmptyModelId).then(() => {
                if (cancelled) {
                    return
                }

                if (activeModelId === autoDeleteEmptyModelId) {
                    clearLoadedModel()
                }

                markAutoDeleteEmptyModel(null)
                setItems((currentItems) =>
                    currentItems.filter(
                        (item) => item.id !== autoDeleteEmptyModelId
                    )
                )
            })
        })

        return () => {
            cancelled = true
        }
    }, [
        activeModelId,
        autoDeleteEmptyModelId,
        clearLoadedModel,
        markAutoDeleteEmptyModel,
    ])

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
        <FilterableModelsList
            items={items}
            availableTags={MODEL_METADATA_TAG_VALUES}
            onDelete={handleDelete}
            onEdit={handleEdit}
        />
    )
}
