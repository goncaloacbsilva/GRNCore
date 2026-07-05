import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { InterchangeFormat } from '@/lib/interchange'
import { InterchangeFormatDescription } from '@/lib/interchange/interchanger'
import { useChangesTracking, useEditorStore } from '@/store'
import { useState } from 'react'

export function FileMenu() {
    const exportModel = useChangesTracking((state) => state.export)
    const setImportDialogOpen = useEditorStore(
        (state) => state.setImportModelDialogVisible
    )
    const [importWarningOpen, setImportWarningOpen] = useState(false)

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
        <>
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
                                                onClick={() =>
                                                    exportModel(format)
                                                }
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
                        <MenubarItem
                            onSelect={() => setImportWarningOpen(true)}
                        >
                            Import
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            <Dialog
                open={importWarningOpen}
                onOpenChange={setImportWarningOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Overwrite Current Model?</DialogTitle>
                        <DialogDescription>
                            Importing from the editor will overwrite the current
                            model and replace it with the imported one. This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setImportWarningOpen(false)
                                setImportDialogOpen(true)
                            }}
                        >
                            Proceed
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
