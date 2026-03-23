import { getSelected, pasteModel } from '@/lib/graph'
import { InteractionType, type InternalGRNModel } from '@/lib/schema'
import type { ReactFlowInstance, XYPosition } from '@xyflow/react'

import { toast } from 'sonner'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

interface EditorState {
    addNodeDialogVisible: boolean
    connectModeEnabled: boolean
    connectModeInteraction: InteractionType
    selectedNodesIds: Set<string>
    copyArea: InternalGRNModel | null
    isDragging: boolean
    isApplyingHistory: boolean

    setAddNodeDialogVisible: (visible: boolean) => void
    setConnectMode: (enabled: boolean) => void
    setConnectModeInteraction: (interaction: InteractionType) => void
    setDragging: (value: boolean) => void
    setApplyingHistory: (value: boolean) => void

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
            addNodeDialogVisible: false,
            connectModeEnabled: false,
            connectModeInteraction: 'activation' as InteractionType,
            selectedNodesIds: new Set<string>(),
            copyArea: null as InternalGRNModel | null,
            isDragging: false,
            isApplyingHistory: false,
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
        })
    )
)
