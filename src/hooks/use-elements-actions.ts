import { useReactFlow, useStore } from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '@/store'
import { getSelected } from '@/lib/graph'
import { pasteModel } from '@/lib/graph/copy-paste'

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

        pasteSelectedElements(reactFlowInstance)
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

            pasteModel(selected, reactFlowInstance)
        },
        cutAction: () => {
            copySelectedElements(reactFlowInstance)

            deleteAction()
        },
    }
}
