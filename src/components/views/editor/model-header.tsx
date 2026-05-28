import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAppForm } from '@/components/forms'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { usePersistenceStatus } from '@/lib/persistence'
import { useChangesTracking, useEditorStore } from '@/store'
import { useStore as useFormStore } from '@tanstack/react-form'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CheckIcon } from 'lucide-react'

function SavingIndicator() {
    const isSaving = usePersistenceStatus((state) => state.isSaving)
    const contentRef = useRef<HTMLSpanElement | null>(null)
    const [contentWidth, setContentWidth] = useState<number | null>(null)

    useLayoutEffect(() => {
        if (!contentRef.current) {
            return
        }

        setContentWidth(contentRef.current.offsetWidth)
    }, [isSaving])

    return (
        <Badge
            variant={isSaving ? 'secondary' : 'ghost'}
            className={
                isSaving ? '' : ' text-black hover:bg-muted transition-all'
            }
        >
            <span
                className="inline-flex items-center overflow-hidden transition-[width] duration-100 ease-in-out"
                style={{
                    width: contentWidth === null ? 'auto' : `${contentWidth}px`,
                }}
            >
                <span
                    ref={contentRef}
                    key={isSaving ? 'saving' : 'saved'}
                    className="inline-flex items-center gap-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-100 whitespace-nowrap"
                >
                    {isSaving ? (
                        <Spinner className="size-3.5 text-blue-500" />
                    ) : (
                        <CheckIcon className="size-3.5 text-blue-500" />
                    )}
                    {isSaving ? 'Saving changes' : 'Saved'}
                </span>
            </span>
        </Badge>
    )
}

export function ModelHeader() {
    const modelTitle = useEditorStore((state) => state.modelTitle)
    const setModelTitle = useEditorStore((state) => state.setModelTitle)
    const setSnapshotTitle = useChangesTracking(
        (state) => state.setSnapshotTitle
    )
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const form = useAppForm({
        defaultValues: {
            title: modelTitle,
        },
    })
    const draftTitle = useFormStore(form.store, (state) => state.values.title)

    useEffect(() => {
        form.reset({
            title: modelTitle,
        })
    }, [form, modelTitle])

    const finishTitleEdit = () => {
        const trimmed = draftTitle.trim()
        const nextTitle = trimmed || 'Untitled model'
        setModelTitle(nextTitle)
        setSnapshotTitle(nextTitle)
        setIsEditingTitle(false)
    }

    return (
        <div className="flex flex-row items-center justify-center gap-2">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink>Local Models</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        {isEditingTitle ? (
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault()
                                    finishTitleEdit()
                                }}
                            >
                                <form.AppField
                                    name="title"
                                    children={(field) => (
                                        <field.TextField
                                            label="Model title"
                                            showLabel={false}
                                            placeholder="Model title"
                                            inputClassName="h-8 min-w-52 px-2 text-sm text-foreground"
                                            inputProps={{
                                                autoFocus: true,
                                                onBlur: finishTitleEdit,
                                                onKeyDown: (event) => {
                                                    if (
                                                        event.key === 'Escape'
                                                    ) {
                                                        form.reset({
                                                            title: modelTitle,
                                                        })
                                                        setIsEditingTitle(false)
                                                    }
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </form>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <BreadcrumbPage
                                        className="cursor-pointer flex flex-col align-top hover:bg-muted p-2 rounded-sm font-semibold"
                                        onClick={() => setIsEditingTitle(true)}
                                    >
                                        {modelTitle}
                                    </BreadcrumbPage>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    Press to edit model name
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <SavingIndicator />
        </div>
    )
}
