import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { useChangesTracking, useEditorStore } from '@/store'
import { useReactFlow, type Node, type Edge } from '@xyflow/react'
import { useRef } from 'react'

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
    const releaseTimeoutRef = useRef<number | null>(null)
    const releaseHistoryGuards = () => {
        if (releaseTimeoutRef.current !== null) {
            window.clearTimeout(releaseTimeoutRef.current)
            releaseTimeoutRef.current = null
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                releaseTimeoutRef.current = window.setTimeout(() => {
                    setApplyingHistory(false)
                    setSnapshotPaused(false)
                    releaseTimeoutRef.current = null
                }, 250)
            })
        })
    }

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
            releaseHistoryGuards()
        },
        redo: () => {
            const controls = useChangesTracking.getControls()
            if (!controls.canForward()) {
                return
            }

            setApplyingHistory(true)
            setSnapshotPaused(true)
            redo(instance)
            releaseHistoryGuards()
        },
    }
}
