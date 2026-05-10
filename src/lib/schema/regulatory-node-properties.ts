import { nanoid } from 'nanoid'
import * as z from 'zod'
import { AnnotationsSchema } from './annotations'

export const RegulatoryNodeRuleSchema = z.object({
    id: z.string(),

    // Target level if rule is satisfied
    target: z.int().positive().max(9).min(1),

    expression: z.string().nonempty({ message: 'Expression cannot be empty' }),

    // Internal validity flag for the current graph context
    isValid: z.boolean(),
})

export const RegulatoryNodeRuleDraftSchema = z.object({
    id: RegulatoryNodeRuleSchema.shape.id.default(() => nanoid()),
    target: RegulatoryNodeRuleSchema.shape.target.default(1),
    expression: z.string().default(''),
    isValid: RegulatoryNodeRuleSchema.shape.isValid.default(false),
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
    rules: z.array(RegulatoryNodeRuleDraftSchema).default([]),

    annotations: AnnotationsSchema,
})

export type RegulatoryNodeProperties = z.infer<
    typeof RegulatoryNodePropertiesSchema
>
export type RegulatoryNodeRule = z.infer<typeof RegulatoryNodeRuleSchema>
