export const ModelMetadataSourceTags = {
    SBMLqual: 'SBML-qual',
    GINML: 'GINML',
    BNET: 'BNET',
} as const

export type ModelMetadataSourceTag =
    (typeof ModelMetadataSourceTags)[keyof typeof ModelMetadataSourceTags]

export const ModelMetadataAdditionalTags = {
    Annotated: 'Annotated',
} as const

export type ModelMetadataAdditionalTag =
    (typeof ModelMetadataAdditionalTags)[keyof typeof ModelMetadataAdditionalTags]

export type ModelMetadataTag =
    | ModelMetadataSourceTag
    | ModelMetadataAdditionalTag

export interface ModelMetadata {
    id: string
    title: string
    description: string
    author: string
    tags: ModelMetadataTag[]
}
