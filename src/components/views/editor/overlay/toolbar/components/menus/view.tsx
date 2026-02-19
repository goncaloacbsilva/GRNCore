import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'

export function ViewMenu() {
    return (
        <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent className="w-44">
                <MenubarGroup>
                    <MenubarItem>
                        Reset Zoom <MenubarShortcut>⌘R</MenubarShortcut>
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
