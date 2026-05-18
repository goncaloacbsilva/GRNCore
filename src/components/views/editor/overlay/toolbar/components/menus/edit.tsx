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
    const getBaselinePosition = useChangesTracking(
        (state) => state.getBaselinePosition
    )
    const getHistoryPosition = useChangesTracking(
        (state) => state.getHistoryPosition
    )
    const canHistoryForward = useChangesTracking(
        (state) => state.canHistoryForward
    )
    useChangesTracking((state) => state.baselineVersion)
    const { undo, redo } = useHistory()
    const baselinePosition = getBaselinePosition()
    const canUndo = snapshot ? getHistoryPosition() > baselinePosition : false
    const canRedo = snapshot ? canHistoryForward() : false

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
