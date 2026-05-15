import { useState } from 'react'
import { ExternalLinkIcon, MinusIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyDescription } from '@/components/ui/empty'

function normalizeUrl(url: string) {
    const trimmedUrl = url.trim()

    if (trimmedUrl === '' || isUrl(trimmedUrl)) {
        return trimmedUrl
    }

    return `https://${trimmedUrl}`
}

function isUrl(value: string) {
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(value.trim())
}

function parseKeyValueReference(reference: string) {
    if (isUrl(reference)) {
        return null
    }

    const separatorIndex = reference.indexOf(':')

    if (separatorIndex <= 0) {
        return null
    }

    const key = reference.slice(0, separatorIndex).trim()
    const value = reference.slice(separatorIndex + 1).trim()

    if (key === '' || value === '') {
        return null
    }

    return { key, value }
}

function normalizeReferenceInput(input: string) {
    const trimmedInput = input.trim()

    if (trimmedInput === '') {
        return ''
    }

    const keyValueReference = parseKeyValueReference(trimmedInput)

    if (keyValueReference) {
        return `${keyValueReference.key}: ${keyValueReference.value}`
    }

    return normalizeUrl(trimmedInput)
}

function ReferenceValue({
    reference,
    showExternalIcon = false,
}: {
    reference: string
    showExternalIcon?: boolean
}) {
    const keyValueReference = parseKeyValueReference(reference)

    if (keyValueReference) {
        const valueIsUrl = isUrl(keyValueReference.value)

        return (
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="max-w-24 shrink-0 truncate rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300">
                    {keyValueReference.key}
                </span>
                {valueIsUrl ? (
                    <a
                        href={keyValueReference.value}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 flex-1 truncate text-sm hover:underline"
                    >
                        {keyValueReference.value}
                    </a>
                ) : (
                    <span className="min-w-0 flex-1 truncate text-sm">
                        {keyValueReference.value}
                    </span>
                )}
                {showExternalIcon && valueIsUrl ? (
                    <ExternalLinkIcon className="size-3 shrink-0" />
                ) : null}
            </div>
        )
    }

    if (isUrl(reference)) {
        return (
            <a
                href={reference}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm hover:underline"
            >
                <span className="min-w-0 flex-1 truncate">{reference}</span>
                {showExternalIcon ? (
                    <ExternalLinkIcon className="size-3 shrink-0" />
                ) : null}
            </a>
        )
    }

    return <span className="min-w-0 flex-1 truncate text-sm">{reference}</span>
}

export function ReferencesEditor({
    isEditing,
    references,
    onReferencesChange,
}: {
    isEditing: boolean
    references: string[]
    onReferencesChange: (references: string[]) => void
}) {
    const [referenceInput, setReferenceInput] = useState('')

    const normalizedReference = normalizeReferenceInput(referenceInput)
    const canAddReference = normalizedReference !== ''

    const addReference = () => {
        if (!canAddReference) {
            return
        }

        onReferencesChange([...references, normalizedReference])
        setReferenceInput('')
    }

    const removeReference = (referenceIndex: number) => {
        onReferencesChange(
            references.filter((_, index) => index !== referenceIndex)
        )
    }

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-col">
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                {isEditing ? (
                    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 p-3 text-sm">
                        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
                            <div className="grid min-w-0 gap-1.5">
                                {references.map((reference, index) => (
                                    <div
                                        key={`${reference}-${index}`}
                                        className="flex min-h-8 min-w-0 items-center gap-2 rounded-md border bg-background px-2 py-1 shadow-xs"
                                    >
                                        <ReferenceValue reference={reference} />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() =>
                                                removeReference(index)
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
                                    value={referenceInput}
                                    onChange={(event) =>
                                        setReferenceInput(event.target.value)
                                    }
                                    placeholder="Add URL or key:value"
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
                                    {references.map((reference, index) => (
                                        <div
                                            key={`${reference}-${index}`}
                                            className="flex min-h-8 min-w-0 items-center gap-2 rounded-md border px-2 py-1 hover:bg-accent"
                                        >
                                            <ReferenceValue
                                                reference={reference}
                                                showExternalIcon
                                            />
                                        </div>
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
