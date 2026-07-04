import { EditorView } from '@/components/views'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/edit/$modelId')({
    component: EditorView,
})
