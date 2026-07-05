import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
} from '@/components/ui/input-group'
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover'
import { MODEL_METADATA_TAG_GROUPS, type ModelMetadataTag } from '@/lib/schema'
import { useModelsFiltersStore } from '@/store'
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

export function ModelsFilters() {
    const { query, selectedTags, setQuery, toggleTag, clearTags, reset } =
        useModelsFiltersStore(
            useShallow((state) => ({
                query: state.query,
                selectedTags: state.selectedTags,
                setQuery: state.setQuery,
                toggleTag: state.toggleTag,
                clearTags: state.clearTags,
                reset: state.reset,
            }))
        )
    const activeFiltersCount = selectedTags.length + (query.trim() ? 1 : 0)

    return (
        <div className="flex items-center gap-2">
            <InputGroup className="w-[320px] max-w-[40vw] bg-background has-[[data-slot=input-group-control]:focus-visible]:border-[#2f81ed89] has-[[data-slot=input-group-control]:focus-visible]:ring-[#2f81ed89]/50">
                <InputGroupAddon>
                    <InputGroupText>
                        <SearchIcon className="size-4" />
                    </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search for model..."
                    aria-label="Search models"
                />
                {query ? (
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton
                            size="icon-xs"
                            className="rounded-full"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                        >
                            <XIcon className="size-3.5" />
                        </InputGroupButton>
                    </InputGroupAddon>
                ) : null}
            </InputGroup>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <FilterIcon className="size-4" />
                        Filters
                        {selectedTags.length > 0 ? (
                            <Badge
                                variant="secondary"
                                className="h-5 rounded-full px-1.5"
                            >
                                {selectedTags.length}
                            </Badge>
                        ) : null}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 space-y-4">
                    <PopoverHeader>
                        <PopoverTitle>Filter by tags</PopoverTitle>
                    </PopoverHeader>
                    <div className="space-y-4">
                        {MODEL_METADATA_TAG_GROUPS.map((group) => (
                            <div key={group.value} className="space-y-2">
                                <p className="text-sm font-medium">
                                    {group.value}
                                </p>
                                <div className="space-y-2">
                                    {group.items.map((tag) => (
                                        <label
                                            key={tag}
                                            className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
                                        >
                                            <span className="text-sm">
                                                {tag}
                                            </span>
                                            <Checkbox
                                                checked={selectedTags.includes(
                                                    tag as ModelMetadataTag
                                                )}
                                                onCheckedChange={() =>
                                                    toggleTag(
                                                        tag as ModelMetadataTag
                                                    )
                                                }
                                                aria-label={`Toggle ${tag} tag filter`}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                            {activeFiltersCount > 0
                                ? `${activeFiltersCount} active filter${activeFiltersCount === 1 ? '' : 's'}`
                                : 'No active filters'}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearTags}
                                disabled={selectedTags.length === 0}
                            >
                                Clear tags
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={reset}
                                disabled={activeFiltersCount === 0}
                            >
                                Reset all
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
