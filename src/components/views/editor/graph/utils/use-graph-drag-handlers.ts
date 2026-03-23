import type { RegulatoryNodeProperties } from '@/lib/schema'
import { useEditorStore } from '@/store'
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
}

export function useGraphDragHandlers({
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
}: UseGraphDragHandlersParams) {
    const setDragging = useEditorStore((state) => state.setDragging)

    const handleNodeDragStart = useCallback(
        (
            event: unknown,
            node: Node<RegulatoryNodeProperties>,
            draggedNodes: Node<RegulatoryNodeProperties>[]
        ) => {
            setDragging(true)
            onNodeDragStart(event, node, draggedNodes)
        },
        [onNodeDragStart, setDragging]
    )

    const handleNodeDrag = useCallback(
        (
            event: unknown,
            node: Node<RegulatoryNodeProperties>,
            draggedNodes: Node<RegulatoryNodeProperties>[]
        ) => {
            setDragging(true)
            onNodeDrag(event, node, draggedNodes)
        },
        [onNodeDrag, setDragging]
    )

    const handleNodeDragStop = useCallback(() => {
        onNodeDragStop()
        setDragging(false)
    }, [onNodeDragStop, setDragging])

    const handleSelectionDragStart = useCallback(() => {
        setDragging(true)
    }, [setDragging])

    const handleSelectionDrag = useCallback(() => {
        setDragging(true)
    }, [setDragging])

    const handleSelectionDragStop = useCallback(() => {
        setDragging(false)
    }, [setDragging])

    return {
        handleNodeDragStart,
        handleNodeDrag,
        handleNodeDragStop,
        handleSelectionDragStart,
        handleSelectionDrag,
        handleSelectionDragStop,
    }
}
