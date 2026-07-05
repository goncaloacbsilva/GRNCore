import { z } from 'zod'

export const ModelMetadataSourceTags = {
    SBMLqual: 'SBML-qual',
    GINML: 'GINML',
    BNET: 'BNET',
    GRNCore: 'GRNCore',
} as const

export const MODEL_METADATA_SOURCE_TAG_VALUES = Object.values(
    ModelMetadataSourceTags
) as [string, ...string[]]

export type ModelMetadataSourceTag =
    (typeof ModelMetadataSourceTags)[keyof typeof ModelMetadataSourceTags]

export const ModelMetadataAdditionalTags = {
    Annotated: 'Annotated',
} as const

export const MODEL_METADATA_ADDITIONAL_TAG_VALUES = Object.values(
    ModelMetadataAdditionalTags
) as [string, ...string[]]

export type ModelMetadataAdditionalTag =
    (typeof ModelMetadataAdditionalTags)[keyof typeof ModelMetadataAdditionalTags]

export type ModelMetadataTag =
    | ModelMetadataSourceTag
    | ModelMetadataAdditionalTag

export const MODEL_METADATA_TAG_VALUES = [
    ...MODEL_METADATA_SOURCE_TAG_VALUES,
    ...MODEL_METADATA_ADDITIONAL_TAG_VALUES,
] as [string, ...string[]]

export const MODEL_METADATA_TAG_GROUPS = [
    {
        value: 'Model Original Source',
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

export const ModelMetadataSourceTagSchema = z.enum(
    MODEL_METADATA_SOURCE_TAG_VALUES
)

export const ModelMetadataAdditionalTagSchema = z.enum(
    MODEL_METADATA_ADDITIONAL_TAG_VALUES
)

export const ModelMetadataTagSchema = z.enum(MODEL_METADATA_TAG_VALUES)

export const ModelMetadataSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    author: z.string(),
    tags: z.array(ModelMetadataTagSchema),
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
        tags: [...new Set(value.tags)],
    }
}
