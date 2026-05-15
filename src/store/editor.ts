import { getSelected, pasteModel } from '@/lib/graph'
import { InteractionType, type InternalGRNModel } from '@/lib/schema'
import type { ReactFlowInstance, XYPosition } from '@xyflow/react'
import type { SerializedEditorState } from 'lexical'

import { toast } from 'sonner'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

interface EditorState {
    modelTitle: string
    modelAnnotations: SerializedEditorState | null
    annotationsPanelOpen: boolean
    addNodeDialogVisible: boolean
    connectModeEnabled: boolean
    connectModeInteraction: InteractionType
    selectedNodesIds: Set<string>
    copyArea: InternalGRNModel | null
    isDragging: boolean
    isApplyingHistory: boolean
    isSnapshotPaused: boolean

    setAddNodeDialogVisible: (visible: boolean) => void
    setConnectMode: (enabled: boolean) => void
    setConnectModeInteraction: (interaction: InteractionType) => void
    setDragging: (value: boolean) => void
    setApplyingHistory: (value: boolean) => void
    setSnapshotPaused: (value: boolean) => void
    setAnnotationsPanelOpen: (open: boolean) => void
    setModelAnnotations: (annotations: SerializedEditorState | null) => void
    setModelTitle: (title: string) => void

    pushSelectedNodeId: (node: string) => void
    popSelectedNodeId: (node: string) => void

    copySelectedElements: (instance: ReactFlowInstance) => void
    pasteSelectedElements: (
        instance: ReactFlowInstance,
        basePosition: XYPosition
    ) => void
}

export const useEditorStore = create<EditorState>()(
    combine(
        {
            modelTitle: 'Untitled model',
            addNodeDialogVisible: false,
            connectModeEnabled: false,
            connectModeInteraction: 'activation' as InteractionType,
            selectedNodesIds: new Set<string>(),
            copyArea: null as InternalGRNModel | null,
            isDragging: false,
            isApplyingHistory: false,
            isSnapshotPaused: false,
            annotationsPanelOpen: false,
            modelAnnotations: null as SerializedEditorState | null,
        },
        (set, get) => ({
            setAddNodeDialogVisible: (visible) =>
                set(() => ({ addNodeDialogVisible: visible })),
            setConnectMode: (enabled) => {
                if (enabled) {
                    toast.info('Switched to Connect Mode', {
                        position: 'top-right',
                        description:
                            'Edges can be created between nodes until this mode gets disabled',
                    })
                } else {
                    toast.info('Switched to Default Mode', {
                        position: 'top-right',
                    })
                }

                set(() => ({ connectModeEnabled: enabled }))
            },
            setConnectModeInteraction: (interaction) => {
                set(() => ({ connectModeInteraction: interaction }))
            },
            setDragging: (value) => {
                set(() => ({ isDragging: value }))
            },
            setApplyingHistory: (value) => {
                set(() => ({ isApplyingHistory: value }))
            },
            setSnapshotPaused: (value) => {
                set(() => ({ isSnapshotPaused: value }))
            },
            pushSelectedNodeId: (nodeId) => {
                set((state) => ({
                    selectedNodesIds: new Set(state.selectedNodesIds).add(
                        nodeId
                    ),
                }))
            },
            popSelectedNodeId: (nodeId) => {
                set((state) => {
                    const next = new Set(state.selectedNodesIds)
                    next.delete(nodeId)
                    return { selectedNodesIds: next }
                })
            },
            copySelectedElements: (instance) => {
                set(() => ({
                    copyArea: getSelected(instance),
                }))
            },
            pasteSelectedElements: (instance, basePosition) => {
                const model = get().copyArea
                if (model) {
                    pasteModel(model, instance, basePosition)
                }
            },
            setAnnotationsPanelOpen: (open) => {
                set(() => ({ annotationsPanelOpen: open }))
            },
            setModelAnnotations: (annotations) => {
                set(() => ({ modelAnnotations: annotations }))
            },
            setModelTitle: (title) => {
                set(() => ({ modelTitle: title }))
            },
        })
    )
)
