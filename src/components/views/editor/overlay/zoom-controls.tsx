import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/store'
import type { Graph as G6Graph } from '@antv/g6'
import { ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

const getZoomStateFromGraph = (graph: G6Graph | undefined) => {
    const ranges = graph?.getZoomRange()
    const currentZoom = graph?.getZoom()
    if (!ranges || currentZoom === undefined) {
        return { canZoomIn: false, canZoomOut: false }
    }

    return {
        canZoomIn: currentZoom < ranges[1],
        canZoomOut: currentZoom > ranges[0],
    }
}

export function ZoomControls() {
    const graphRef = useEditorStore((state) => state.graphRef)
    const [{ canZoomIn, canZoomOut }, setZoomState] = useState({
        canZoomIn: false,
        canZoomOut: false,
    })

    useEffect(() => {
        const graph = graphRef?.current
        if (!graph) return

        const syncZoomState = () => {
            setZoomState(getZoomStateFromGraph(graph))
        }

        graph.on('aftertransform', syncZoomState)
        graph.on('afterrender', syncZoomState)

        return () => {
            graph.off('aftertransform', syncZoomState)
            graph.off('afterrender', syncZoomState)
        }
    }, [graphRef])

    const handleZoomIn = () => {
        const graph = graphRef?.current
        if (!graph) return

        void graph.zoomBy(1.2).then(() => {
            setZoomState(getZoomStateFromGraph(graph))
        })
    }

    const handleZoomOut = () => {
        const graph = graphRef?.current
        if (!graph) return

        void graph.zoomBy(0.8).then(() => {
            setZoomState(getZoomStateFromGraph(graph))
        })
    }

    return (
        <div className="absolute bottom-5 left-5">
            <div className="flex flex-col gap-2">
                <Button
                    onClick={handleZoomIn}
                    disabled={!canZoomIn}
                    variant="outline"
                    size="icon"
                >
                    <ZoomInIcon />
                </Button>
                <Button
                    onClick={handleZoomOut}
                    disabled={!canZoomOut}
                    variant="outline"
                    size="icon"
                >
                    <ZoomOutIcon />
                </Button>
            </div>
        </div>
    )
}
