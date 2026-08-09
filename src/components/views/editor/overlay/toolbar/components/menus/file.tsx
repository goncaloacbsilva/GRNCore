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
import { InterchangeFormatDescription } from '@/lib/interchange/interchanger'
import { useChangesTracking } from '@/store'

export function FileMenu() {
    const exportModel = useChangesTracking((state) => state.export)

    const getDescription = (format: InterchangeFormat) => {
        const desc = InterchangeFormatDescription[format].split(' ')

        return (
            <>
                {desc.slice(0, -1).join(' ')}
                <strong>{desc[desc.length - 1]}</strong>
            </>
        )
    }

    return (
        <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
                <MenubarGroup>
                    <MenubarSub>
                        <MenubarSubTrigger>Export model</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarGroup>
                                {Object.values(InterchangeFormat).map(
                                    (format) => (
                                        <MenubarItem
                                            onClick={() => exportModel(format)}
                                            key={format}
                                        >
                                            {getDescription(format)}
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
                </MenubarGroup>
            </MenubarContent>
        </MenubarMenu>
    )
}
