import { z } from 'zod'
import { ModelMetadataSchema } from './model-metadata'

export const CommunityCatalogSchema = z.object({
    models: z.array(ModelMetadataSchema),
})

export type CommunityCatalog = z.infer<typeof CommunityCatalogSchema>
