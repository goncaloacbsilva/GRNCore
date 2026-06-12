import { z } from 'zod'

export const AnnotationsSchema = z
    .object({
        unstructured: z.any(),
        references: z.array(z.string()).default([]),
    })
    .optional()
