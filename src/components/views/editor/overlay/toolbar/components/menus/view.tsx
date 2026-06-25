import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'
import { useViewActions } from '@/hooks'
import { formatForDisplay } from '@tanstack/react-hotkeys'

export function ViewMenu() {
    const { resetZoom } = useViewActions()

    return (
        <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent className="w-44">
                <MenubarGroup>
                    <MenubarItem onSelect={resetZoom}>
                        Reset Zoom{' '}
                        <MenubarShortcut>
                            {formatForDisplay('R')}
                        </MenubarShortcut>
                    </MenubarItem>
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}
