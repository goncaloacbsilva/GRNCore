import { FilterableModelsList } from '@/components/views/models'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { TriangleAlertIcon } from 'lucide-react'
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
        <div className="flex flex-col">
            <div className="sticky top-14 z-10 px-4 pt-4 pb-2">
                <Alert className="border-amber-300 bg-amber-50 text-amber-950 shadow-sm">
                    <TriangleAlertIcon className="text-amber-600" />
                    <AlertTitle>Local storage is temporary</AlertTitle>
                    <AlertDescription className="text-amber-900">
                        <p>
                            Local models are kept in browser storage and may be
                            cleared after a few days. Export copies of any
                            models you want to keep ({' '}
                            <strong>File -&gt; Export model</strong>) <br />A
                            future GRN Core Desktop app will provide persistent
                            storage.
                        </p>
                    </AlertDescription>
                </Alert>
            </div>
            <FilterableModelsList
                items={items}
                availableTags={MODEL_METADATA_TAG_VALUES}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
        </div>
    )
}
