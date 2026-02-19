import { Button } from '@/components/ui/button'
import { ZoomInIcon, ZoomOutIcon } from 'lucide-react'

export function ZoomControls() {
    return (
        <div className="absolute bottom-5 left-5">
            <div className="flex flex-col gap-2">
                <Button variant="outline" size="icon">
                    <ZoomInIcon />
                </Button>
                <Button variant="outline" size="icon">
                    <ZoomOutIcon />
                </Button>
            </div>
        </div>
    )
}
