import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { useChangesTracking, useEditorStore } from '@/store'
import { useReactFlow, type Node, type Edge } from '@xyflow/react'

export function useHistory() {
    const instance = useReactFlow<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >()
    const undo = useChangesTracking((state) => state.undo)
    const redo = useChangesTracking((state) => state.redo)
    const setApplyingHistory = useEditorStore(
        (state) => state.setApplyingHistory
    )

    return {
        undo: () => {
            const controls = useChangesTracking.getControls()
            if (controls.position <= 1) {
                return
            }

            setApplyingHistory(true)
            undo(instance)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setApplyingHistory(false)
                })
            })
        },
        redo: () => {
            setApplyingHistory(true)
            redo(instance)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setApplyingHistory(false)
                })
            })
        },
    }
}
