import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover'
import { MODEL_METADATA_TAG_GROUPS, type ModelMetadataTag } from '@/lib/schema'
import { FilterIcon } from 'lucide-react'

interface ModelsFiltersPopoverProps {
    selectedTags: ModelMetadataTag[]
    onToggleTag: (tag: ModelMetadataTag) => void
    onClearTags: () => void
    onReset: () => void
    hasSearchQuery: boolean
}

export function ModelsFiltersPopover({
    selectedTags,
    onToggleTag,
    onClearTags,
    onReset,
    hasSearchQuery,
}: ModelsFiltersPopoverProps) {
    const activeFiltersCount = selectedTags.length + (hasSearchQuery ? 1 : 0)

    return (
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
                            <p className="text-sm font-medium">{group.value}</p>
                            <div className="space-y-2">
                                {group.items.map((tag) => (
                                    <label
                                        key={tag}
                                        className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
                                    >
                                        <span className="text-sm">{tag}</span>
                                        <Checkbox
                                            checked={selectedTags.includes(
                                                tag as ModelMetadataTag
                                            )}
                                            onCheckedChange={() =>
                                                onToggleTag(
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
                            onClick={onClearTags}
                            disabled={selectedTags.length === 0}
                        >
                            Clear tags
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            disabled={activeFiltersCount === 0}
                        >
                            Reset all
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
