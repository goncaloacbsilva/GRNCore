import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { MODEL_SORT_OPTIONS, type ModelsSortOption } from '@/store'

const SORT_OPTION_LABELS: Record<ModelsSortOption, string> = {
    [MODEL_SORT_OPTIONS.LastChangedDesc]: 'Recently updated',
    [MODEL_SORT_OPTIONS.LastChangedAsc]: 'Least recently updated',
    [MODEL_SORT_OPTIONS.TitleAsc]: 'Name A-Z',
    [MODEL_SORT_OPTIONS.TitleDesc]: 'Name Z-A',
}

interface ModelsSortSelectProps {
    sortBy: ModelsSortOption
    onSortChange: (sortBy: ModelsSortOption) => void
}

export function ModelsSortSelect({
    sortBy,
    onSortChange,
}: ModelsSortSelectProps) {
    return (
        <Select
            value={sortBy}
            onValueChange={(value) => onSortChange(value as ModelsSortOption)}
        >
            <SelectTrigger
                size="default"
                className="w-50 bg-background"
                aria-label="Sort models"
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
                {Object.values(MODEL_SORT_OPTIONS).map((option) => (
                    <SelectItem key={option} value={option}>
                        {SORT_OPTION_LABELS[option]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
