import { ModelsList } from '@/components/views/models/models-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/models/local')({
    component: RouteComponent,
    staticData: {
        getTitle: () => 'Local Models',
    },
})

function RouteComponent() {
    return <ModelsList />
}
