import { PlusIcon } from 'lucide-react'
import type { SidebarContextProps } from '@/components/ui/sidebar'
import { useCreateModel } from '@/hooks/use-create-model'
import { SidebarActionButton } from './sidebar-action-button'

export interface CreateModelButtonProps {
    context: SidebarContextProps
}

export function CreateModelButton({ context }: CreateModelButtonProps) {
    const { createModel } = useCreateModel({
        onCreated: () => context.setOpen(false),
    })

    return (
        <SidebarActionButton
            context={context}
            icon={PlusIcon}
            label="New Model"
            tooltip="Create a new model (saved to browser local storage)"
            className="cursor-pointer bg-primary text-[#F8FAFC] transition-all hover:bg-primary/80 hover:text-[#F8FAFC]"
            onClick={() => void createModel()}
        />
    )
}
