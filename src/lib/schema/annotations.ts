import type { SerializedEditorState } from 'lexical'
import { z } from 'zod'

export const AnnotationsSchema = z
    .object({
        unstructured: z.any() as z.ZodType<SerializedEditorState>,
        references: z.array(z.string()).default([]),
    })
    .optional()
