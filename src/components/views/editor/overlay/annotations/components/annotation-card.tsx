import type { ReactNode } from 'react'
import { ChevronUpIcon, PencilIcon, SaveIcon } from 'lucide-react'
import { twJoin } from 'tailwind-merge'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface AnnotationCardProps {
    children: ReactNode
    isEditing: boolean
    isOpen: boolean
    onEditButtonClick: () => void
    onOpenChange: (open: boolean) => void
    title: string
    widthClassName: string
}

export function AnnotationCard({
    children,
    isEditing,
    isOpen,
    onEditButtonClick,
    onOpenChange,
    title,
    widthClassName,
}: AnnotationCardProps) {
    return (
        <Collapsible
            open={isOpen}
            onOpenChange={onOpenChange}
            className={twJoin(
                'bg-background pointer-events-auto flex h-10 min-h-0 flex-col overflow-hidden rounded-lg border transition-all duration-200 ease-out data-[state=open]:h-full',
                widthClassName
            )}
        >
            <TooltipProvider>
                <div className="flex h-10 shrink-0 items-center gap-2 overflow-auto border-b p-1">
                    <button
                        type="button"
                        className="flex flex-1 select-none items-center gap-2 rounded-sm px-2 py-1 text-left text-sm font-medium hover:bg-accent"
                        onClick={() => onOpenChange(!isOpen)}
                        aria-expanded={isOpen}
                        aria-label={
                            isOpen ? `Collapse ${title}` : `Expand ${title}`
                        }
                    >
                        <ChevronUpIcon
                            size={18}
                            className={twJoin(
                                'shrink-0',
                                isOpen && 'rotate-180'
                            )}
                        />
                        <h3 className="font-semibold">{title}</h3>
                    </button>
                    {isOpen ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-2"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        onEditButtonClick()
                                    }}
                                    aria-label={
                                        isEditing
                                            ? 'Save annotation details'
                                            : 'Edit annotation details'
                                    }
                                >
                                    {isEditing ? (
                                        <SaveIcon className="size-4" />
                                    ) : (
                                        <PencilIcon className="size-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isEditing
                                    ? 'Save changes'
                                    : 'Edit annotations'}
                            </TooltipContent>
                        </Tooltip>
                    ) : null}
                </div>
            </TooltipProvider>
            <CollapsibleContent
                forceMount
                className="min-h-0 overflow-hidden data-[state=closed]:h-0 data-[state=closed]:grow-0 data-[state=closed]:shrink-0 data-[state=open]:flex-1"
            >
                {children}
            </CollapsibleContent>
        </Collapsible>
    )
}
