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
import { useEditorStore } from '@/store'
import { useStore as useFormStore } from '@tanstack/react-form'
import { useEffect, useState } from 'react'

export function ModelHeader() {
    const modelTitle = useEditorStore((state) => state.modelTitle)
    const setModelTitle = useEditorStore((state) => state.setModelTitle)
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
        setModelTitle(trimmed || 'Untitled model')
        setIsEditingTitle(false)
    }

    return (
        <div className="flex flex-col justify-center">
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
                                            inputClassName="h-8 min-w-52 px-2 text-sm font-medium text-foreground"
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
                                        className="cursor-pointer flex flex-col align-top hover:bg-muted p-2 rounded-sm"
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
        </div>
    )
}
