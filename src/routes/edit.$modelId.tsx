import { EditorView } from '@/components/views'
import { getLocalModelSnapshot } from '@/lib/persistence'
import { useChangesTracking } from '@/store'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

const EditModelLoaderContextSchema = z.object({
    params: z.object({
        modelId: z.string(),
    }),
})

export const Route = createFileRoute('/edit/$modelId')({
    loader: async (loaderContext) => {
        const {
            params: { modelId },
        } = EditModelLoaderContextSchema.parse(loaderContext)
        const { activeModelId, clearLoadedModel, loadModel } =
            useChangesTracking.getState()

        if (activeModelId !== modelId) {
            clearLoadedModel()
        }

        const snapshot = await getLocalModelSnapshot(modelId)

        if (!snapshot) {
            clearLoadedModel()
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: '/models/local', replace: true })
        }

        loadModel(modelId, snapshot)
        return { modelId }
    },
    component: RouteComponent,
})

function RouteComponent() {
    Route.useLoaderData()
    return <EditorView />
}
