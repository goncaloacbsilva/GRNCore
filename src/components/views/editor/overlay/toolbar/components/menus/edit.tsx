import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'
import { useElementsActions } from '@/hooks'

export function EditMenu() {
    const { copyAction, pasteAction, cutAction } = useElementsActions()

    return (
        <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
                <MenubarGroup>
                    <MenubarItem disabled>
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled>
                        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                    </MenubarItem>
                </MenubarGroup>
                <MenubarSeparator />
                <MenubarGroup>
                    <MenubarItem onSelect={cutAction}>
                        Cut
                        <MenubarShortcut>⌘+X</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onSelect={copyAction}>
                        Copy <MenubarShortcut>⌘+C</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onSelect={pasteAction}>
                        Paste <MenubarShortcut>⌘+V</MenubarShortcut>
                    </MenubarItem>
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}
