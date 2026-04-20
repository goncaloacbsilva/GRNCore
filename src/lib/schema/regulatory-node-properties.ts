import * as z from 'zod'

export const RegulatoryNodeRuleSchema = z.object({
    id: z.string(),

    // Target level if rule is satisfied
    target: z.int().positive().max(9).min(1),

    expression: z.string().nonempty({ message: 'Expression cannot be empty' }),
})

export const RegulatoryNodePropertiesSchema = z.object({
    // Name of the Gene
    name: z
        .string()
        .min(1, { error: 'Name must be at least 1 character long' })
        .max(20, { error: 'Name must be at most 20 characters long' }),

    // Maximum activity level
    activityLevels: z.int().positive().max(9).min(1).default(1),

    // Whether the node acts as an external input
    isInputNode: z.boolean().default(false),

    // Logical rules
    rules: z.array(RegulatoryNodeRuleSchema).default([]),
})

export type RegulatoryNodeProperties = z.infer<
    typeof RegulatoryNodePropertiesSchema
>
export type RegulatoryNodeRule = z.infer<typeof RegulatoryNodeRuleSchema>
