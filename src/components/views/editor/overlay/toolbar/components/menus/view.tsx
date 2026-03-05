import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'
import { FIT_VIEW_OPTIONS } from '@/components/views/editor/graph/config'
import { useReactFlow } from '@xyflow/react'
import { useHotkeys } from 'react-hotkeys-hook'

export function ViewMenu() {
    const { fitView } = useReactFlow()

    const resetZoom = () => {
        void fitView({
            duration: 300,
            interpolate: 'smooth',
            ...FIT_VIEW_OPTIONS,
        })
    }

    useHotkeys('mod+r', resetZoom, {
        preventDefault: true,
    })

    return (
        <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent className="w-44">
                <MenubarGroup>
                    <MenubarItem onSelect={resetZoom}>
                        Reset Zoom <MenubarShortcut>⌘+R</MenubarShortcut>
                    </MenubarItem>
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}
