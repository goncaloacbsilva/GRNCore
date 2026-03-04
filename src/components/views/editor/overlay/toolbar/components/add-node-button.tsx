import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/store'
import { CirclePlus } from 'lucide-react'

export function AddNodeButton() {
    const setDialogVisible = useEditorStore(
        (state) => state.setAddNodeDialogVisible
    )

    return (
        <Button
            onClick={() => setDialogVisible(true)}
            variant="default"
            size="default"
            className="rounded-full text-sm cursor-pointer"
        >
            <CirclePlus /> Add Node
        </Button>
    )
}
