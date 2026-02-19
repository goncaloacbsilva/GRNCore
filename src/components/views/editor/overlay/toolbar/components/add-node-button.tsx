import { Button } from '@/components/ui/button'
import { CirclePlus } from 'lucide-react'

export function AddNodeButton() {
    return (
        <Button
            variant="default"
            size="default"
            className="rounded-full text-sm cursor-pointer"
        >
            <CirclePlus /> Add Node
        </Button>
    )
}
