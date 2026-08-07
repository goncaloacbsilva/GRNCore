import { Badge } from '@/components/ui/badge'
import {
    getModelDisplayTags,
    isModelDisplayTag,
    type ModelMetadata,
    type ModelDisplayTag,
} from '@/lib/schema'
import { twJoin } from 'tailwind-merge'

const MODEL_TAG_THEME_CLASSES: Record<ModelDisplayTag, string> = {
    'SBML-qual':
        'border-[#3B82F6] bg-[#EFF6FF] text-[#1E40AF] hover:bg-[#DBEAFE]',
    GINML: 'border-[#22C55E] bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7]',
    BNET: 'border-[#F59E0B] bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7]',
    GRNCore: 'border-[#8B5CF6] bg-[#F5F3FF] text-[#5B21B6] hover:bg-[#EDE9FE]',
    Annotated:
        'border-[#14B8A6] bg-[#F0FDFA] text-[#0F766E] hover:bg-[#CCFBF1]',
    BioModels:
        'border-[#F43F5E] bg-[#FFF1F2] text-[#BE123C] hover:bg-[#FFE4E6]',
    GINsim: 'border-[#84CC16] bg-[#F7FEE7] text-[#4D7C0F] hover:bg-[#ECFCCB]',
}

export function ModelItemTags({ item }: { item: ModelMetadata }) {
    return (
        <div className="flex flex-wrap gap-2">
            {getModelDisplayTags(item).map((tag) => {
                const themeClass = isModelDisplayTag(tag)
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
