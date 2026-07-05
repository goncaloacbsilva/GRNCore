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
            label="Upload Model"
            className="cursor-pointer"
            onClick={() => {
                context.setOpen(false)
                setDestination(
                    location.pathname.startsWith('/edit/') ? 'editor' : 'list'
                )
                setOpen(true)
            }}
        />
    )
}
