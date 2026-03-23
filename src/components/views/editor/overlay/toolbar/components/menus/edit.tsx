import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'
import { useElementsActions, useHistory } from '@/hooks'
import { useChangesTracking } from '@/store'

export function EditMenu() {
    const { copyAction, pasteAction, cutAction } = useElementsActions()
    const snapshot = useChangesTracking((state) => state.snapshot)
    const controls = useChangesTracking.getControls()
    const { undo, redo } = useHistory()
    const canUndo = snapshot ? controls.position > 1 : false
    const canRedo = snapshot ? controls.canForward() : false

    return (
        <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
                <MenubarGroup>
                    <MenubarItem disabled={!canUndo} onClick={() => undo()}>
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled={!canRedo} onClick={() => redo()}>
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
