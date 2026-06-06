import { FIT_VIEW_OPTIONS } from '@/components/views/editor/graph/config'
import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { useReactFlow, type Edge, type Node } from '@xyflow/react'

export function useViewActions() {
    const { fitView, zoomIn, zoomOut } = useReactFlow<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >()

    const resetZoom = () => {
        void fitView({
            duration: 300,
            interpolate: 'smooth',
            ...FIT_VIEW_OPTIONS,
        })
    }

    const zoomInAction = () => {
        void zoomIn({
            duration: 300,
            interpolate: 'smooth',
        })
    }

    const zoomOutAction = () => {
        void zoomOut({
            duration: 300,
            interpolate: 'smooth',
        })
    }

    return {
        resetZoom,
        zoomIn: zoomInAction,
        zoomOut: zoomOutAction,
    }
}
