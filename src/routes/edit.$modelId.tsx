import { EditorView } from '@/components/views'
import { getLocalModelSnapshot } from '@/lib/persistence'
import { useChangesTracking } from '@/store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/edit/$modelId')({
    loader: async ({ params }) => {
        const { activeModelId, clearLoadedModel, loadModel } =
            useChangesTracking.getState()

        if (activeModelId !== params.modelId) {
            clearLoadedModel()
        }

        const snapshot = await getLocalModelSnapshot(params.modelId)

        if (!snapshot) {
            clearLoadedModel()
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: '/models/local', replace: true })
        }

        loadModel(params.modelId, snapshot)
        return { modelId: params.modelId }
    },
    component: RouteComponent,
})

function RouteComponent() {
    Route.useLoaderData()
    return <EditorView />
}
