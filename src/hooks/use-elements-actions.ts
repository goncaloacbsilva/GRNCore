import { useReactFlow, useStore } from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '@/store'
import { getSelected } from '@/lib/graph'
import { getBasePosition, pasteModel } from '@/lib/graph/copy-paste'

export function useElementsActions() {
    const reactFlowInstance = useReactFlow()
    const { copySelectedElements, pasteSelectedElements, copyArea } =
        useEditorStore(
            useShallow((state) => ({
                copySelectedElements: state.copySelectedElements,
                pasteSelectedElements: state.pasteSelectedElements,
                copyArea: state.copyArea,
            }))
        )
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

    const pasteAction = () => {
        if (!copyArea) return

        const selected = getSelected(reactFlowInstance)

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

        const basePosition = getBasePosition(
            reactFlowInstance.screenToFlowPosition,
            domNode
        )

        preserveViewport(() =>
            pasteSelectedElements(reactFlowInstance, basePosition)
        )
    }

    const deleteAction = () =>
        void reactFlowInstance.deleteElements({
            nodes: getSelected(reactFlowInstance).nodes.map((node) => ({
                id: node.id,
            })),
        })

    return {
        deleteAction,
        copyAction: () => copySelectedElements(reactFlowInstance),
        pasteAction,
        duplicateAction: () => {
            const selected = getSelected(reactFlowInstance)
            if (!selected.nodes.length && !selected.edges.length) return

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

            const basePosition = getBasePosition(
                reactFlowInstance.screenToFlowPosition,
                domNode
            )

            preserveViewport(() =>
                pasteModel(selected, reactFlowInstance, basePosition)
            )
        },
        cutAction: () => {
            copySelectedElements(reactFlowInstance)

            deleteAction()
        },
    }
}
