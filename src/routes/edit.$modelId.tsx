import { EditorLoadingView, EditorView } from '@/components/views'
import { getLocalModelSnapshot } from '@/lib/persistence'
import { useChangesTracking } from '@/store'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

const EditModelLoaderContextSchema = z.object({
    params: z.object({
        modelId: z.string(),
    }),
    preload: z.boolean().optional(),
})

export const Route = createFileRoute('/edit/$modelId')({
    loader: async (loaderContext) => {
        const {
            params: { modelId },
            preload,
        } = EditModelLoaderContextSchema.parse(loaderContext)
        const { clearLoadedModel, loadModel } = useChangesTracking.getState()

        const snapshot = await getLocalModelSnapshot(modelId)

        if (!snapshot) {
            if (!preload) {
                clearLoadedModel()
            }
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: '/models/local', replace: true })
        }

        if (!preload) {
            loadModel(modelId, snapshot)
        }
        return { modelId }
    },
    pendingMs: 0,
    pendingMinMs: 250,
    pendingComponent: EditorLoadingView,
    component: RouteComponent,
})

function RouteComponent() {
    Route.useLoaderData()
    return <EditorView />
}
