import { Button } from '@/components/ui/button'
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { useNodeSetup } from '@/hooks'
import { useEditorStore } from '@/store'
import { GlobeXIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

export function AddNodeDialog() {
    const [nodeName, setNodeName] = useState<string>('')
    const { addNode } = useNodeSetup()
    const { open, setOpen } = useEditorStore(
        useShallow((state) => ({
            open: state.addNodeDialogVisible,
            setOpen: state.setAddNodeDialogVisible,
        }))
    )

    useEffect(() => {
        function resetField() {
            return new Promise<void>((resolve) => {
                setNodeName('')
                resolve()
            })
        }

        if (open) {
            void resetField()
        }
    }, [open])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <Command shouldFilter={false}>
                <CommandInput
                    onValueChange={setNodeName}
                    placeholder="Search for gene or type custom node name..."
                />
                <CommandList>
                    <CommandEmpty>
                        <div className="flex flex-row items-center justify-center gap-2 text-muted-foreground">
                            <GlobeXIcon />
                            <span className="font-semibold">
                                Search feature is unavailable on offline mode
                            </span>
                        </div>
                    </CommandEmpty>

                    {nodeName?.length > 0 && (
                        <CommandGroup heading="Custom Node">
                            <CommandItem onSelect={() => addNode(nodeName)}>
                                {nodeName}
                                <Button
                                    className="bg-[#2F80ED] hover:bg-[#2f81edeb]"
                                    size="xs"
                                >
                                    Add to graph
                                </Button>
                            </CommandItem>
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    )
}
