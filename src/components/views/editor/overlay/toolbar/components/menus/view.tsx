import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'
import { useEditorStore } from '@/store'
import { useHotkeys } from 'react-hotkeys-hook'

export function ViewMenu() {
    const graphRef = useEditorStore((state) => state.graphRef)

    const resetZoom = () => {
        void graphRef?.current.zoomTo(1)
    }

    useHotkeys('ctrl+r', resetZoom, {
        preventDefault: true,
    })

    return (
        <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent className="w-44">
                <MenubarGroup>
                    <MenubarItem onSelect={resetZoom}>
                        Reset Zoom <MenubarShortcut>Ctrl+R</MenubarShortcut>
                    </MenubarItem>
                </MenubarGroup>
                <MenubarSeparator />
                <MenubarGroup>
                    <MenubarItem>Toggle Fullscreen</MenubarItem>
                </MenubarGroup>
                <MenubarSeparator />
                <MenubarGroup>
                    <MenubarItem>Hide Sidebar</MenubarItem>
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}
