import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import {
    useReactFlow,
    useStore,
    type Edge,
    type Node,
    type ReactFlowInstance,
} from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import { useChangesTracking, useEditorStore } from '@/store'
import { getSelected } from '@/lib/graph'
import { getBasePosition, pasteModel } from '@/lib/graph/copy-paste'

export function useElementsActions() {
    const reactFlowInstance = useReactFlow<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >()
    const baseInstance = reactFlowInstance as unknown as ReactFlowInstance
    const { copySelectedElements, pasteSelectedElements, copyArea } =
        useEditorStore(
            useShallow((state) => ({
                copySelectedElements: state.copySelectedElements,
                pasteSelectedElements: state.pasteSelectedElements,
                copyArea: state.copyArea,
            }))
        )
    const setSnapshotPaused = useEditorStore((state) => state.setSnapshotPaused)
    const takeSnapshot = useChangesTracking((state) => state.takeSnapshot)
    const { triggerNodeChanges, triggerEdgeChanges } = useStore(
        useShallow((state) => ({
            triggerNodeChanges: state.triggerNodeChanges,
            triggerEdgeChanges: state.triggerEdgeChanges,
        }))
    )
    const domNode = useStore((state) => state.domNode)

    const preserveViewport = (fn: () => void) => {
        const viewport = reactFlowInstance.getViewport()

        fn()

        requestAnimationFrame(() => {
            void reactFlowInstance.setViewport(viewport, { duration: 0 })
            requestAnimationFrame(() => {
                void reactFlowInstance.setViewport(viewport, { duration: 0 })
            })
        })
    }

    const runAsSingleHistoryStep = (fn: () => void) => {
        takeSnapshot(reactFlowInstance.getNodes(), reactFlowInstance.getEdges())
        setSnapshotPaused(true)
        fn()

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setSnapshotPaused(false)
            })
        })
    }

    const pasteAction = () => {
        if (!copyArea) return

        const selected = getSelected(baseInstance)
        const basePosition = getBasePosition(
            reactFlowInstance.screenToFlowPosition,
            domNode
        )

        runAsSingleHistoryStep(() => {
            triggerNodeChanges(
                selected.nodes.map((node) => ({
                    id: node.id,
                    type: 'select',
                    selected: false,
                }))
            )

            triggerEdgeChanges(
                selected.edges.map((edge) => ({
                    id: edge.id,
                    type: 'select',
                    selected: false,
                }))
            )

            preserveViewport(() =>
                pasteSelectedElements(baseInstance, basePosition)
            )
        })
    }

    const deleteAction = () => {
        const selected = getSelected(baseInstance, true)

        void reactFlowInstance.deleteElements({
            nodes: selected.nodes.map((node) => ({
                id: node.id,
            })),
            edges: selected.edges.map((edge) => ({
                id: edge.id,
            })),
        })
    }

    return {
        deleteAction,
        copyAction: () => copySelectedElements(baseInstance),
        pasteAction,
        duplicateAction: () => {
            const selected = getSelected(baseInstance)
            if (!selected.nodes.length && !selected.edges.length) return

            const basePosition = getBasePosition(
                reactFlowInstance.screenToFlowPosition,
                domNode
            )

            runAsSingleHistoryStep(() => {
                triggerNodeChanges(
                    selected.nodes.map((node) => ({
                        id: node.id,
                        type: 'select',
                        selected: false,
                    }))
                )

                triggerEdgeChanges(
                    selected.edges.map((edge) => ({
                        id: edge.id,
                        type: 'select',
                        selected: false,
                    }))
                )

                preserveViewport(() =>
                    pasteModel(selected, baseInstance, basePosition)
                )
            })
        },
        cutAction: () => {
            copySelectedElements(baseInstance)

            deleteAction()
        },
    }
}
