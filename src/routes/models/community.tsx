import { ModelsList } from '@/components/views/models/models-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/models/community')({
    component: RouteComponent,
    staticData: {
        getTitle: () => 'Community Models',
    },
})

function RouteComponent() {
    return (
        <ModelsList
            items={[]}
            onDelete={() => undefined}
            onEdit={() => undefined}
        />
    )
}
