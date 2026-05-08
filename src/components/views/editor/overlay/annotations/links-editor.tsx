import { useState } from 'react'
import { ExternalLinkIcon, MinusIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyDescription } from '@/components/ui/empty'

interface Reference {
    id: string
    title: string
    url: string
}

function normalizeUrl(url: string) {
    const trimmedUrl = url.trim()

    if (trimmedUrl === '' || /^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl)) {
        return trimmedUrl
    }

    return `https://${trimmedUrl}`
}

export function ReferencesEditor({ isEditing }: { isEditing: boolean }) {
    const [references, setReferences] = useState<Reference[]>([])
    const [url, setUrl] = useState('')

    const normalizedUrl = normalizeUrl(url)
    const canAddReference = normalizedUrl !== ''

    const addReference = () => {
        if (!canAddReference) {
            return
        }

        setReferences((currentReferences) => [
            ...currentReferences,
            {
                id: crypto.randomUUID(),
                title: normalizedUrl,
                url: normalizedUrl,
            },
        ])
        setUrl('')
    }

    const removeReference = (referenceId: string) => {
        setReferences((currentReferences) =>
            currentReferences.filter(
                (reference) => reference.id !== referenceId
            )
        )
    }

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col">
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                {isEditing ? (
                    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 p-3 text-sm">
                        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
                            <div className="grid min-w-0 gap-1.5">
                                {references.map((reference) => (
                                    <div
                                        key={reference.id}
                                        className="flex min-h-8 min-w-0 items-center gap-2 rounded-md border bg-background px-2 py-1 shadow-xs"
                                    >
                                        <a
                                            href={reference.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="min-w-0 flex-1 truncate text-sm hover:underline"
                                        >
                                            {reference.title}
                                        </a>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() =>
                                                removeReference(reference.id)
                                            }
                                            aria-label="Remove reference"
                                        >
                                            <MinusIcon className="size-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="shrink-0">
                            <div className="flex overflow-hidden rounded-md border bg-background shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50">
                                <Input
                                    value={url}
                                    onChange={(event) =>
                                        setUrl(event.target.value)
                                    }
                                    placeholder="Add reference URL"
                                    className="h-8 rounded-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault()
                                            addReference()
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    size="icon-sm"
                                    className="h-8 rounded-none px-2"
                                    onClick={addReference}
                                    disabled={!canAddReference}
                                    aria-label="Add reference"
                                >
                                    <PlusIcon className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full min-w-0 flex-col text-sm">
                        <div className="flex h-8 shrink-0 items-center border-b px-3">
                            <h3 className="text-sm font-semibold">
                                References
                            </h3>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto p-3">
                            {references.length === 0 ? (
                                <div className="flex h-full w-full flex-col items-center justify-center">
                                    <EmptyDescription className="text-center">
                                        This element has no references
                                    </EmptyDescription>
                                </div>
                            ) : (
                                <div className="grid min-w-0 gap-1">
                                    {references.map((reference) => (
                                        <a
                                            key={reference.id}
                                            href={reference.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex min-h-8 min-w-0 items-center gap-2 rounded-md border px-2 py-1 hover:bg-accent"
                                        >
                                            <span className="min-w-0 flex-1 truncate">
                                                {reference.title}
                                            </span>
                                            <ExternalLinkIcon className="size-3 shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
