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
    const getBaselinePosition = useChangesTracking(
        (state) => state.getBaselinePosition
    )
    useChangesTracking((state) => state.baselineVersion)
    const setApplyingHistory = useEditorStore((state) => state.setApplyingHistory)
    const setSnapshotPaused = useEditorStore((state) => state.setSnapshotPaused)

    return {
        undo: () => {
            const controls = useChangesTracking.getControls()
            const baselinePosition = getBaselinePosition()
            if (controls.position <= baselinePosition) {
                return
            }

            setApplyingHistory(true)
            setSnapshotPaused(true)
            undo(instance)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setApplyingHistory(false)
                    setSnapshotPaused(false)
                })
            })
        },
        redo: () => {
            const controls = useChangesTracking.getControls()
            if (!controls.canForward()) {
                return
            }

            setApplyingHistory(true)
            setSnapshotPaused(true)
            redo(instance)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setApplyingHistory(false)
                    setSnapshotPaused(false)
                })
            })
        },
    }
}
