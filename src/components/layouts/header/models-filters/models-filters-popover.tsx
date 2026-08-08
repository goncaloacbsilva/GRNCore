import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import type { ModelDisplayTag } from '@/lib/schema'
import { FilterIcon } from 'lucide-react'
import { twJoin } from 'tailwind-merge'

interface ModelsFiltersPopoverProps {
    tagGroups: {
        value: string
        items: readonly ModelDisplayTag[]
    }[]
    selectedTags: ModelDisplayTag[]
    onToggleTag: (tag: ModelDisplayTag) => void
    onClearTags: () => void
    onReset: () => void
    hasSearchQuery: boolean
}

export function ModelsFiltersPopover({
    tagGroups,
    selectedTags,
    onToggleTag,
    onClearTags,
    onReset,
    hasSearchQuery,
}: ModelsFiltersPopoverProps) {
    const activeFiltersCount = selectedTags.length + (hasSearchQuery ? 1 : 0)
    const tagCheckboxClasses: Record<ModelDisplayTag, string> = {
        'SBML-qual':
            'data-[state=checked]:border-[#3B82F6] data-[state=checked]:bg-[#3B82F6]',
        GINML: 'data-[state=checked]:border-[#22C55E] data-[state=checked]:bg-[#22C55E]',
        BNET: 'data-[state=checked]:border-[#F59E0B] data-[state=checked]:bg-[#F59E0B]',
        GRNCore:
            'data-[state=checked]:border-[#8B5CF6] data-[state=checked]:bg-[#8B5CF6]',
        Annotated:
            'data-[state=checked]:border-[#14B8A6] data-[state=checked]:bg-[#14B8A6]',
        BioModels:
            'data-[state=checked]:border-[#F43F5E] data-[state=checked]:bg-[#F43F5E]',
        GINsim: 'data-[state=checked]:border-[#84CC16] data-[state=checked]:bg-[#84CC16]',
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 focus-visible:border-[#2f81ed89] focus-visible:ring-[#2f81ed89]/50"
                >
                    <FilterIcon className="size-4" />
                    Filters
                    {activeFiltersCount > 0 ? (
                        <Badge
                            variant="secondary"
                            className="h-5 rounded-full px-1.5"
                        >
                            {activeFiltersCount}
                        </Badge>
                    ) : null}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-4">
                <div className="space-y-4">
                    {tagGroups.map((group) => (
                        <div
                            key={group.value}
                            className="space-y-2 rounded-md border px-3 py-2.5"
                        >
                            <p className="text-sm font-semibold">
                                {group.value}
                            </p>
                            <div className="space-y-2">
                                {group.items.map((tag) => (
                                    <label
                                        key={tag}
                                        className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
                                    >
                                        <span className="text-sm">{tag}</span>
                                        <Checkbox
                                            className={twJoin(
                                                tagCheckboxClasses[tag],
                                                'data-[state=checked]:text-white'
                                            )}
                                            checked={selectedTags.includes(tag)}
                                            onCheckedChange={() =>
                                                onToggleTag(tag)
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
