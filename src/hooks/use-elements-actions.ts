import { useReactFlow, useStore } from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '@/store'
import { getSelected } from '@/lib/graph'

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

    return {
        deleteAction: () =>
            void reactFlowInstance.deleteElements({
                nodes: getSelected(reactFlowInstance).nodes.map((node) => ({
                    id: node.id,
                })),
            }),
        copyAction: () => copySelectedElements(reactFlowInstance),
        pasteAction,
        duplicateAction: () => {
            copySelectedElements(reactFlowInstance)
            pasteAction()
        },
    }
}
