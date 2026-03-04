import { Button } from '@/components/ui/button'
import { useReactFlow, useStore, useViewport } from '@xyflow/react'
import { shallow } from 'zustand/shallow'
import { ZoomInIcon, ZoomOutIcon } from 'lucide-react'

export function ZoomControls() {
    // Get Zoom limits
    const { minZoom, maxZoom } = useStore(
        (state) => ({ minZoom: state.minZoom, maxZoom: state.maxZoom }),
        shallow
    )

    // Zoom actions
    const { zoomIn, zoomOut } = useReactFlow()

    // Current zoom
    const { zoom } = useViewport()

    return (
        <div className="absolute bottom-5 left-5">
            <div className="flex flex-col gap-2">
                <Button
                    disabled={zoom == maxZoom}
                    onClick={() =>
                        void zoomIn({
                            duration: 300,
                            interpolate: 'smooth',
                        })
                    }
                    variant="outline"
                    size="icon"
                >
                    <ZoomInIcon />
                </Button>
                <Button
                    disabled={zoom == minZoom}
                    onClick={() =>
                        void zoomOut({
                            duration: 300,
                            interpolate: 'smooth',
                        })
                    }
                    variant="outline"
                    size="icon"
                >
                    <ZoomOutIcon />
                </Button>
            </div>
        </div>
    )
}
