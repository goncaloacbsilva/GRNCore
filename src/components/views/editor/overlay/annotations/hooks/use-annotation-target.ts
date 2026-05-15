import { useReactFlow, useStore, type Edge, type Node } from '@xyflow/react'
import { shallow } from 'zustand/shallow'

import type {
    EditableRegulatoryEdge,
    RegulatoryNodeProperties,
} from '@/lib/schema'
import { useEditorStore } from '@/store'
import type {
    AnnotationDraft,
    PersistedAnnotations,
} from '../lib/annotation-state'
import { EMPTY_REFERENCES } from '../lib/annotation-state'

export function useAnnotationTarget() {
    const { selectedNodes, selectedEdges } = useStore(
        (state) => ({
            selectedNodes: state.nodes.filter(
                (node) => node.selected
            ) as Node<RegulatoryNodeProperties>[],
            selectedEdges: state.edges.filter(
                (edge) => edge.selected
            ) as Edge<EditableRegulatoryEdge>[],
        }),
        shallow
    )
    const { updateNodeData, updateEdgeData, getNode } = useReactFlow<
        Node<RegulatoryNodeProperties>,
        Edge<EditableRegulatoryEdge>
    >()
    const modelAnnotations = useEditorStore((state) => state.modelAnnotations)
    const setModelAnnotations = useEditorStore(
        (state) => state.setModelAnnotations
    )

    const selectedElements = selectedNodes.length + selectedEdges.length
    const hasSingleSelectedElement = selectedElements === 1
    const selectedNode = selectedNodes[0]
    const selectedEdge = selectedEdges[0]

    if (selectedEdge && selectedElements === 1) {
        const src = getNode(selectedEdge.source)
        const trgt = getNode(selectedEdge.target)

        return {
            annotations: selectedEdge.data?.annotations as
                | PersistedAnnotations
                | undefined,
            hasSingleSelectedElement,
            isModelTarget: false,
            key: selectedEdge.id,
            selectedElements,
            title: `Edge Annotations (${src?.data.name} → ${trgt?.data.name})`,
            updateAnnotations: (newAnnotations: AnnotationDraft) => {
                updateEdgeData(selectedEdge.id, {
                    annotations: newAnnotations,
                })
            },
            widthClassName: 'w-170',
        }
    }

    if (selectedNode && selectedElements === 1) {
        return {
            annotations: selectedNode.data.annotations as
                | PersistedAnnotations
                | undefined,
            hasSingleSelectedElement,
            isModelTarget: false,
            key: selectedNode.id,
            selectedElements,
            title: `Node Annotations (${selectedNode.data.name})`,
            updateAnnotations: (newAnnotations: AnnotationDraft) => {
                console.log(JSON.stringify(newAnnotations))
                updateNodeData(selectedNode.id, {
                    annotations: newAnnotations,
                })
            },
            widthClassName: 'w-170',
        }
    }

    return {
        annotations: {
            unstructured: modelAnnotations,
            references: EMPTY_REFERENCES,
        },
        hasSingleSelectedElement,
        isModelTarget: true,
        key: 'model',
        selectedElements,
        title: 'Model Annotations',
        updateAnnotations: (newAnnotations: AnnotationDraft) => {
            setModelAnnotations(newAnnotations.unstructured)
        },
        widthClassName: 'w-140',
    }
}
