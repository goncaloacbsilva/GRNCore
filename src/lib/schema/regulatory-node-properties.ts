import * as z from 'zod'

export const RegulatoryNodePropertiesSchema = z.object({
    // Name of the Gene
    name: z
        .string()
        .min(1, { error: 'Name must be at least 1 character long' })
        .max(20, { error: 'Name must be at most 20 characters long' }),

    // Maximum activity level
    activityLevels: z.int().positive().max(9).default(1),

    // Whether the node acts as an external input
    isInputNode: z.boolean().default(false),
})

export type RegulatoryNodeProperties = z.input<
    typeof RegulatoryNodePropertiesSchema
>
