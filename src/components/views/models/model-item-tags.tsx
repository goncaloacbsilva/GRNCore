import { Badge } from '@/components/ui/badge'
import {
    MODEL_METADATA_TAG_VALUES,
    type ModelMetadata,
    type ModelMetadataTag,
} from '@/lib/schema'
import { twJoin } from 'tailwind-merge'

const MODEL_TAG_THEME_CLASSES: Record<ModelMetadataTag, string> = {
    'SBML-qual':
        'border-[#6EC1FF] bg-[#EFF8FF] text-[#1D4F91] hover:bg-[#E2F2FF]',
    GINML: 'border-[#86E3C3] bg-[#ECFDF5] text-[#16624B] hover:bg-[#DCFCEB]',
    BNET: 'border-[#F4C46A] bg-[#FFF8E8] text-[#8A5A00] hover:bg-[#FDF0C9]',
    GRNCore: 'border-[#C6B4FF] bg-[#F5F1FF] text-[#5B3FA3] hover:bg-[#ECE4FF]',
    Annotated:
        'border-[#9DE8DA] bg-[#E9FFFB] text-[#1E6B61] hover:bg-[#D7FBF3]',
}

function isModelMetadataTag(tag: string): tag is ModelMetadataTag {
    return MODEL_METADATA_TAG_VALUES.includes(tag)
}

export function ModelItemTags({ item }: { item: ModelMetadata }) {
    return (
        <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => {
                const themeClass = isModelMetadataTag(tag)
                    ? MODEL_TAG_THEME_CLASSES[tag]
                    : 'border-border bg-muted text-foreground'

                return (
                    <Badge
                        key={tag}
                        variant="outline"
                        className={twJoin('h-6', themeClass)}
                    >
                        {tag}
                    </Badge>
                )
            })}
        </div>
    )
}
