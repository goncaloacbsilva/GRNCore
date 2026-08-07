import { UploadIcon } from 'lucide-react'
import type { SidebarContextProps } from '@/components/ui/sidebar'
import { useLocalModelImportStore } from '@/store'
import { useLocation } from '@tanstack/react-router'
import { SidebarActionButton } from './sidebar-action-button'

export interface ImportModelButtonProps {
    context: SidebarContextProps
}

export function ImportModelButton({ context }: ImportModelButtonProps) {
    const location = useLocation()
    const { setOpen, setDestination } = useLocalModelImportStore((state) => ({
        setOpen: state.setOpen,
        setDestination: state.setDestination,
    }))

    return (
        <SidebarActionButton
            context={context}
            icon={UploadIcon}
            label="Load Model"
            tooltip="Load a model from a file"
            className="cursor-pointer"
            onClick={() => {
                const destination = location.pathname.startsWith('/edit/')
                    ? 'editor'
                    : 'list'

                if (destination === 'editor') {
                    context.setOpen(false)
                }

                setDestination(destination)
                setOpen(true)
            }}
        />
    )
}
