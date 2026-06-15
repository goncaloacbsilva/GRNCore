import { getSelected, pasteModel } from '@/lib/graph'
import {
    InteractionType,
    type InternalGRNModel,
    type PersistedAnnotations,
} from '@/lib/schema'
import type { ReactFlowInstance, XYPosition } from '@xyflow/react'

import { toast } from 'sonner'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export type MenuSheetTab = 'base' | 'style'

interface EditorState {
    modelTitle: string
    modelAnnotations: PersistedAnnotations | undefined
    annotationsPanelOpen: boolean
    addNodeDialogVisible: boolean
    importModelDialogVisible: boolean
    connectModeEnabled: boolean
    connectModeInteraction: InteractionType
    selectedNodesIds: Set<string>
    menuSheetTab: MenuSheetTab
    copyArea: InternalGRNModel | null
    isDragging: boolean
    isApplyingHistory: boolean
    isSnapshotPaused: boolean

    setAddNodeDialogVisible: (visible: boolean) => void
    setImportModelDialogVisible: (visible: boolean) => void
    setConnectMode: (enabled: boolean) => void
    setConnectModeInteraction: (interaction: InteractionType) => void
    setDragging: (value: boolean) => void
    setApplyingHistory: (value: boolean) => void
    setSnapshotPaused: (value: boolean) => void
    setAnnotationsPanelOpen: (open: boolean) => void
    setModelAnnotations: (annotations: PersistedAnnotations | undefined) => void
    setModelTitle: (title: string) => void
    setMenuSheetTab: (tab: MenuSheetTab) => void

    pushSelectedNodeId: (node: string) => void
    popSelectedNodeId: (node: string) => void

    copySelectedElements: (instance: ReactFlowInstance) => void
    pasteSelectedElements: (
        instance: ReactFlowInstance,
        basePosition: XYPosition
    ) => void
}

type EditorStateSnapshot = Pick<
    EditorState,
    | 'modelTitle'
    | 'modelAnnotations'
    | 'annotationsPanelOpen'
    | 'addNodeDialogVisible'
    | 'importModelDialogVisible'
    | 'connectModeEnabled'
    | 'connectModeInteraction'
    | 'selectedNodesIds'
    | 'menuSheetTab'
    | 'copyArea'
    | 'isDragging'
    | 'isApplyingHistory'
    | 'isSnapshotPaused'
>

const initialEditorState: EditorStateSnapshot = {
    modelTitle: 'Untitled model',
    addNodeDialogVisible: false,
    connectModeEnabled: false,
    connectModeInteraction: InteractionType.Activation,
    selectedNodesIds: new Set<string>(),
    menuSheetTab: 'base',
    copyArea: null,
    isDragging: false,
    isApplyingHistory: false,
    isSnapshotPaused: false,
    annotationsPanelOpen: false,
    modelAnnotations: undefined,
    importModelDialogVisible: false,
}

export const useEditorStore = create<EditorState>()(
    combine(initialEditorState, (set, get) => ({
        setAddNodeDialogVisible: (visible) =>
            set(() => ({ addNodeDialogVisible: visible })),
        setImportModelDialogVisible: (visible) =>
            set(() => ({ importModelDialogVisible: visible })),
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
        setMenuSheetTab: (tab) => {
            set(() => ({ menuSheetTab: tab }))
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
                selectedNodesIds: new Set(state.selectedNodesIds).add(nodeId),
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
    }))
)
