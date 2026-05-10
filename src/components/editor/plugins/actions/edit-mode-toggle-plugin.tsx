import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'

import { PencilIcon, SaveIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export function EditModeTogglePlugin() {
    const [editor] = useLexicalComposerContext()
    const isEditable = useLexicalEditable()

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={'ghost'}
                    onClick={() => {
                        editor.setEditable(!isEditable)
                    }}
                    aria-label={`${!isEditable ? 'Unlock' : 'Lock'} read-only mode`}
                    size={'sm'}
                    className="p-2"
                >
                    {isEditable ? (
                        <SaveIcon className="size-4" />
                    ) : (
                        <PencilIcon className="size-4" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {isEditable ? 'Save changes' : 'Edit Annotations'}
            </TooltipContent>
        </Tooltip>
    )
}
