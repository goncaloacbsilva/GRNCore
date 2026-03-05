import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from '@/components/ui/menubar'

export function FileMenu() {
    return (
        <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
                <MenubarGroup>
                    <MenubarItem disabled>Export</MenubarItem>
                    {/* <MenubarSub>
                        <MenubarSubTrigger>Export</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarGroup>
                                <MenubarItem>SBML-qual</MenubarItem>
                                <MenubarItem>GINML</MenubarItem>
                                <MenubarItem>BoolNet</MenubarItem>
                            </MenubarGroup>
                            <MenubarSeparator />
                            <MenubarGroup>
                                <MenubarItem>Image (.png)</MenubarItem>
                                <MenubarItem>Image (.svg)</MenubarItem>
                            </MenubarGroup>
                        </MenubarSubContent>
                    </MenubarSub> */}
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}
