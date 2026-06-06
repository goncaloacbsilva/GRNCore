import { Button } from '@/components/ui/button'
import { useStore, useViewport } from '@xyflow/react'
import { shallow } from 'zustand/shallow'
import { ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { useViewActions } from '@/hooks'

export function ZoomControls() {
    // Get Zoom limits
    const { minZoom, maxZoom } = useStore(
        (state) => ({ minZoom: state.minZoom, maxZoom: state.maxZoom }),
        shallow
    )

    // Zoom actions
    const { zoomIn, zoomOut } = useViewActions()

    // Current zoom
    const { zoom } = useViewport()

    return (
        <div className="flex flex-col gap-2">
            <Button
                disabled={zoom == maxZoom}
                onClick={zoomIn}
                variant="outline"
                size="icon"
            >
                <ZoomInIcon />
            </Button>
            <Button
                disabled={zoom == minZoom}
                onClick={zoomOut}
                variant="outline"
                size="icon"
            >
                <ZoomOutIcon />
            </Button>
        </div>
    )
}
