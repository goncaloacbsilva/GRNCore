import type { RegulatoryNodeProperties } from '@/lib/schema'
import { useEditorTransientStore } from '@/store'
import { useCallback } from 'react'
import type { Node } from '@xyflow/react'

type DragHandler = (
    event: unknown,
    node: Node<RegulatoryNodeProperties>,
    draggedNodes: Node<RegulatoryNodeProperties>[]
) => void

type DragStopHandler = () => void

interface UseGraphDragHandlersParams {
    onNodeDragStart: DragHandler
    onNodeDrag: DragHandler
    onNodeDragStop: DragStopHandler
    onDragStateChange: (isDragging: boolean) => void
}

export function useGraphDragHandlers({
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    onDragStateChange,
}: UseGraphDragHandlersParams) {
    const setDragging = useEditorTransientStore((state) => state.setDragging)

    const handleNodeDragStart = useCallback(
        (
            event: unknown,
            node: Node<RegulatoryNodeProperties>,
            draggedNodes: Node<RegulatoryNodeProperties>[]
        ) => {
            onDragStateChange(true)
            setDragging(true)
            onNodeDragStart(event, node, draggedNodes)
        },
        [onDragStateChange, onNodeDragStart, setDragging]
    )

    const handleNodeDrag = useCallback(
        (
            event: unknown,
            node: Node<RegulatoryNodeProperties>,
            draggedNodes: Node<RegulatoryNodeProperties>[]
        ) => {
            onNodeDrag(event, node, draggedNodes)
        },
        [onNodeDrag]
    )

    const handleNodeDragStop = useCallback(() => {
        onNodeDragStop()
        setDragging(false)
        onDragStateChange(false)
    }, [onDragStateChange, onNodeDragStop, setDragging])

    const handleSelectionDragStart = useCallback(() => {
        onDragStateChange(true)
        setDragging(true)
    }, [onDragStateChange, setDragging])

    const handleSelectionDrag = useCallback(() => undefined, [])

    const handleSelectionDragStop = useCallback(() => {
        setDragging(false)
        onDragStateChange(false)
    }, [onDragStateChange, setDragging])

    return {
        handleNodeDragStart,
        handleNodeDrag,
        handleNodeDragStop,
        handleSelectionDragStart,
        handleSelectionDrag,
        handleSelectionDragStop,
    }
}
