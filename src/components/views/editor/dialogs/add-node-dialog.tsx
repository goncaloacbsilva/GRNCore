import { Button } from '@/components/ui/button'
import {
    Command,
    CommandDialog,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { useDebounce } from '@/components/editor/editor-hooks/use-debounce'
import { useNodeSetup } from '@/hooks'
import { useEditorStore } from '@/store'
import { LoaderCircleIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

const MIN_GENE_QUERY_LENGTH = 2
const GENE_AUTOCOMPLETE_DEBOUNCE_MS = 300
const GENE_AUTOCOMPLETE_URL =
    'https://www.ncbi.nlm.nih.gov/portal/utils/autocomp.fcgi?dict=gene&q='

declare global {
    interface Window {
        NSuggest_CreateData?: (
            query: string,
            suggestions: string[],
            isComplete: number
        ) => void
    }
}

function normalizeGeneSuggestions(rawSuggestions: string[]): string[] {
    const seen = new Set<string>()
    const suggestions: string[] = []

    for (const rawSuggestion of rawSuggestions) {
        const [label] = rawSuggestion.split('@')
        const suggestion = label?.trim()
        const normalizedSuggestion = suggestion?.toLowerCase()

        if (!suggestion || !normalizedSuggestion) {
            continue
        }

        if (seen.has(normalizedSuggestion)) {
            continue
        }

        seen.add(normalizedSuggestion)
        suggestions.push(suggestion)
    }

    return suggestions
}

export function AddNodeDialog() {
    const [nodeName, setNodeName] = useState<string>('')
    const [geneSuggestions, setGeneSuggestions] = useState<string[]>([])
    const [searchingGenes, setSearchingGenes] = useState<boolean>(false)
    const [geneSearchCompleted, setGeneSearchCompleted] =
        useState<boolean>(false)
    const suggestionsCacheRef = useRef<Map<string, string[]>>(new Map())
    const activeScriptRef = useRef<HTMLScriptElement | null>(null)
    const originalCallbackRef = useRef<Window['NSuggest_CreateData']>(undefined)
    const requestIdRef = useRef<number>(0)
    const latestQueryRef = useRef<string>('')
    const { addNode } = useNodeSetup()
    const { open, setOpen } = useEditorStore(
        useShallow((state) => ({
            open: state.addNodeDialogVisible,
            setOpen: state.setAddNodeDialogVisible,
        }))
    )

    const fetchGeneSuggestions = useCallback(async (query: string) => {
        const normalizedQuery = query.trim().toLowerCase()

        if (normalizedQuery.length < MIN_GENE_QUERY_LENGTH) {
            latestQueryRef.current = ''
            activeScriptRef.current?.remove()
            activeScriptRef.current = null
            setSearchingGenes(false)
            setGeneSearchCompleted(false)
            setGeneSuggestions([])
            return
        }

        latestQueryRef.current = normalizedQuery

        const cachedSuggestions =
            suggestionsCacheRef.current.get(normalizedQuery)

        if (cachedSuggestions) {
            activeScriptRef.current?.remove()
            activeScriptRef.current = null
            setSearchingGenes(false)
            setGeneSearchCompleted(true)
            setGeneSuggestions(cachedSuggestions)
            return
        }

        activeScriptRef.current?.remove()
        const requestId = requestIdRef.current + 1
        requestIdRef.current = requestId

        await new Promise<void>((resolve) => {
            const script = document.createElement('script')
            let settled = false

            activeScriptRef.current = script

            function cleanup() {
                if (activeScriptRef.current === script) {
                    activeScriptRef.current = null
                }

                script.remove()
                window.NSuggest_CreateData = originalCallbackRef.current
            }

            function completeSearch(rawSuggestions: string[]) {
                if (settled) {
                    return
                }

                settled = true
                cleanup()

                const suggestions = normalizeGeneSuggestions(rawSuggestions)

                if (suggestions.length > 0) {
                    suggestionsCacheRef.current.set(
                        normalizedQuery,
                        suggestions
                    )
                }

                if (
                    requestIdRef.current === requestId &&
                    latestQueryRef.current === normalizedQuery
                ) {
                    setSearchingGenes(false)
                    setGeneSearchCompleted(true)
                    setGeneSuggestions(suggestions)
                }

                resolve()
            }

            window.NSuggest_CreateData = (_responseQuery, rawSuggestions) => {
                completeSearch(rawSuggestions)
            }

            script.onerror = () => {
                completeSearch([])
            }

            script.onload = () => {
                setTimeout(() => completeSearch([]), 0)
            }

            script.async = true
            script.src = `${GENE_AUTOCOMPLETE_URL}${encodeURIComponent(normalizedQuery)}`
            document.head.append(script)
        })
    }, [])

    const cancelActiveGeneSuggestionsRequest = useCallback(() => {
        requestIdRef.current += 1

        if (activeScriptRef.current) {
            activeScriptRef.current.remove()
            activeScriptRef.current = null
        }

        window.NSuggest_CreateData = originalCallbackRef.current
    }, [])

    useEffect(() => {
        originalCallbackRef.current = window.NSuggest_CreateData

        return () => {
            window.NSuggest_CreateData = originalCallbackRef.current
        }
    }, [])

    const queueGeneSuggestionsFetch = useCallback(
        (query: string) => {
            void fetchGeneSuggestions(query)
        },
        [fetchGeneSuggestions]
    )

    const debouncedFetchGeneSuggestions = useDebounce(
        queueGeneSuggestionsFetch,
        GENE_AUTOCOMPLETE_DEBOUNCE_MS
    )
    const trimmedNodeName = nodeName.trim()
    const showNoGenesFound =
        trimmedNodeName.length >= MIN_GENE_QUERY_LENGTH &&
        geneSearchCompleted &&
        !searchingGenes &&
        geneSuggestions.length === 0
    const showGeneBasedNodeGroup =
        searchingGenes || showNoGenesFound || geneSuggestions.length > 0

    const handleNodeNameChange = useCallback(
        (value: string) => {
            setNodeName(value)

            const query = value.trim()

            if (query.length < MIN_GENE_QUERY_LENGTH) {
                latestQueryRef.current = ''
                cancelActiveGeneSuggestionsRequest()
                debouncedFetchGeneSuggestions.cancel()
                setSearchingGenes(false)
                setGeneSearchCompleted(false)
                setGeneSuggestions([])
                return
            }

            const normalizedQuery = query.toLowerCase()
            latestQueryRef.current = normalizedQuery

            const cachedSuggestions =
                suggestionsCacheRef.current.get(normalizedQuery)

            if (cachedSuggestions) {
                cancelActiveGeneSuggestionsRequest()
                debouncedFetchGeneSuggestions.cancel()
                setSearchingGenes(false)
                setGeneSearchCompleted(true)
                setGeneSuggestions(cachedSuggestions)
                return
            }

            cancelActiveGeneSuggestionsRequest()
            setSearchingGenes(true)
            setGeneSearchCompleted(false)
            setGeneSuggestions([])
            debouncedFetchGeneSuggestions(query)
        },
        [cancelActiveGeneSuggestionsRequest, debouncedFetchGeneSuggestions]
    )

    useEffect(() => {
        function resetField() {
            return new Promise<void>((resolve) => {
                setNodeName('')
                setGeneSuggestions([])
                setSearchingGenes(false)
                setGeneSearchCompleted(false)
                resolve()
            })
        }

        if (open) {
            void resetField()
        } else {
            cancelActiveGeneSuggestionsRequest()
            debouncedFetchGeneSuggestions.cancel()
        }
    }, [
        cancelActiveGeneSuggestionsRequest,
        debouncedFetchGeneSuggestions,
        open,
    ])

    useEffect(() => {
        return () => {
            cancelActiveGeneSuggestionsRequest()
            debouncedFetchGeneSuggestions.cancel()
        }
    }, [cancelActiveGeneSuggestionsRequest, debouncedFetchGeneSuggestions])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <Command shouldFilter={false}>
                <CommandInput
                    onValueChange={handleNodeNameChange}
                    placeholder="Search for gene or type custom node name..."
                />
                <CommandList>
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

                    {showGeneBasedNodeGroup && (
                        <CommandGroup heading="Gene Suggestions">
                            {searchingGenes && (
                                <CommandItem disabled>
                                    <LoaderCircleIcon className="animate-spin" />
                                    Searching genes...
                                </CommandItem>
                            )}

                            {showNoGenesFound && (
                                <div className="px-2 py-3 text-sm text-muted-foreground">
                                    No genes found in NCBI
                                </div>
                            )}

                            {geneSuggestions.map((geneSuggestion) => (
                                <CommandItem
                                    className="justify-between"
                                    key={geneSuggestion}
                                    value={geneSuggestion}
                                    onSelect={() => addNode(geneSuggestion)}
                                >
                                    {geneSuggestion}
                                    <Button
                                        className="bg-[#2F80ED] hover:bg-[#2f81edeb]"
                                        size="xs"
                                    >
                                        Add to graph
                                    </Button>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    )
}
