import { z } from 'zod'

export const ModelMetadataSourceTags = {
    SBMLqual: 'SBML-qual',
    GINML: 'GINML',
    BNET: 'BNET',
    GRNCore: 'GRNCore',
} as const

export type ModelMetadataSourceTag =
    (typeof ModelMetadataSourceTags)[keyof typeof ModelMetadataSourceTags]

export const MODEL_METADATA_SOURCE_TAG_VALUES = Object.values(
    ModelMetadataSourceTags
) as [ModelMetadataSourceTag, ...ModelMetadataSourceTag[]]

export const ModelMetadataAdditionalTags = {
    Annotated: 'Annotated',
} as const

export type ModelMetadataAdditionalTag =
    (typeof ModelMetadataAdditionalTags)[keyof typeof ModelMetadataAdditionalTags]

export const MODEL_METADATA_ADDITIONAL_TAG_VALUES = Object.values(
    ModelMetadataAdditionalTags
) as [ModelMetadataAdditionalTag, ...ModelMetadataAdditionalTag[]]

export type ModelMetadataTag =
    | ModelMetadataSourceTag
    | ModelMetadataAdditionalTag

export const MODEL_METADATA_TAG_VALUES = [
    ...MODEL_METADATA_SOURCE_TAG_VALUES,
    ...MODEL_METADATA_ADDITIONAL_TAG_VALUES,
] as [ModelMetadataTag, ...ModelMetadataTag[]]

export const MODEL_METADATA_TAG_GROUPS = [
    {
        value: 'Model representation',
        items: MODEL_METADATA_SOURCE_TAG_VALUES,
    },
    {
        value: 'Additional Tags',
        items: MODEL_METADATA_ADDITIONAL_TAG_VALUES,
    },
] as {
    value: string
    items: string[]
}[]

export const CommunityModelSourceTags = {
    BioModels: 'BioModels',
    GINsim: 'GINsim',
} as const

export type CommunityModelSourceTag =
    (typeof CommunityModelSourceTags)[keyof typeof CommunityModelSourceTags]

export const COMMUNITY_MODEL_SOURCE_TAG_VALUES = Object.values(
    CommunityModelSourceTags
) as [CommunityModelSourceTag, ...CommunityModelSourceTag[]]

export type ModelDisplayTag = ModelMetadataTag | CommunityModelSourceTag

export const MODEL_DISPLAY_TAG_VALUES = [
    ...MODEL_METADATA_TAG_VALUES,
    ...COMMUNITY_MODEL_SOURCE_TAG_VALUES,
] as [ModelDisplayTag, ...ModelDisplayTag[]]

export const MODEL_DISPLAY_TAG_GROUPS = [
    ...MODEL_METADATA_TAG_GROUPS,
    {
        value: 'Community source',
        items: COMMUNITY_MODEL_SOURCE_TAG_VALUES,
    },
] as {
    value: string
    items: string[]
}[]

const COMMUNITY_MODEL_SOURCE_TAGS_BY_SOURCE: Record<
    string,
    CommunityModelSourceTag | undefined
> = {
    biomodels: CommunityModelSourceTags.BioModels,
    ginsim: CommunityModelSourceTags.GINsim,
}

export const ModelMetadataSourceTagSchema = z.enum(
    MODEL_METADATA_SOURCE_TAG_VALUES
)

export const ModelMetadataAdditionalTagSchema = z.enum(
    MODEL_METADATA_ADDITIONAL_TAG_VALUES
)

export const ModelMetadataTagSchema = z.enum(MODEL_METADATA_TAG_VALUES)

export function isModelMetadataSourceTag(
    tag: string
): tag is ModelMetadataSourceTag {
    return (MODEL_METADATA_SOURCE_TAG_VALUES as readonly string[]).includes(tag)
}

export function isModelDisplayTag(tag: string): tag is ModelDisplayTag {
    return (MODEL_DISPLAY_TAG_VALUES as readonly string[]).includes(tag)
}

export function getModelDisplayTags(
    item: Pick<ModelMetadata, 'tags'> & { source?: string }
): ModelDisplayTag[] {
    const sourceTag = item.source
        ? COMMUNITY_MODEL_SOURCE_TAGS_BY_SOURCE[item.source]
        : undefined

    return sourceTag
        ? [...new Set<ModelDisplayTag>([...item.tags, sourceTag])]
        : item.tags
}

export function normalizeModelMetadataTags(
    tags: ModelMetadataTag[],
    options?: {
        preferredSourceTag?: ModelMetadataSourceTag
    }
): ModelMetadataTag[] {
    let preferredSourceTag = options?.preferredSourceTag
    if (!preferredSourceTag) {
        for (let index = tags.length - 1; index >= 0; index -= 1) {
            const tag = tags[index]
            if (tag && isModelMetadataSourceTag(tag)) {
                preferredSourceTag = tag
                break
            }
        }
    }
    const additionalTags: ModelMetadataTag[] = []
    const seenAdditionalTags = new Set<ModelMetadataTag>()

    for (const tag of tags) {
        if (isModelMetadataSourceTag(tag)) {
            continue
        }

        if (!seenAdditionalTags.has(tag)) {
            additionalTags.push(tag)
            seenAdditionalTags.add(tag)
        }
    }

    return preferredSourceTag
        ? [preferredSourceTag, ...additionalTags]
        : additionalTags
}

export const ModelMetadataSchema = z.object({
    id: z.string(),
    title: z.string(),
    filename: z.string().optional(),
    description: z.string(),
    author: z.string(),
    tags: z.array(ModelMetadataTagSchema),
    createdAt: z.number(),
    lastChangedAt: z.number(),
})

export const ModelMetadataDetailsSchema = z.object({
    title: z.string(),
    author: z.string(),
    tags: z.array(ModelMetadataTagSchema),
})

export type ModelMetadata = z.infer<typeof ModelMetadataSchema>
export type ModelMetadataDetails = z.infer<typeof ModelMetadataDetailsSchema>

export function normalizeModelMetadataDetails(
    value: ModelMetadataDetails
): ModelMetadataDetails {
    return {
        title: value.title.trim() || 'Untitled model',
        author: value.author.trim(),
        tags: normalizeModelMetadataTags(value.tags),
    }
}
