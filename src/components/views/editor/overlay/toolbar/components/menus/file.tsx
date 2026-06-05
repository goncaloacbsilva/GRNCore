import {
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from '@/components/ui/menubar'
import { InterchangeFormat } from '@/lib/interchange'
import { useChangesTracking, useEditorStore } from '@/store'

export function FileMenu() {
    const exportModel = useChangesTracking((state) => state.export)
    const setImportDialogOpen = useEditorStore(
        (state) => state.setImportModelDialogVisible
    )

    return (
        <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
                <MenubarGroup>
                    <MenubarSub>
                        <MenubarSubTrigger>Export</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarGroup>
                                {Object.values(InterchangeFormat).map(
                                    (format) => (
                                        <MenubarItem
                                            onClick={() => exportModel(format)}
                                            key={format}
                                        >
                                            {format.toUpperCase()}
                                        </MenubarItem>
                                    )
                                )}
                            </MenubarGroup>
                            {/* <MenubarSeparator />
                            <MenubarGroup>
                                <MenubarItem>Image (.png)</MenubarItem>
                                <MenubarItem>Image (.svg)</MenubarItem>
                            </MenubarGroup> */}
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarItem onSelect={() => setImportDialogOpen(true)}>
                        Import
                    </MenubarItem>
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}
