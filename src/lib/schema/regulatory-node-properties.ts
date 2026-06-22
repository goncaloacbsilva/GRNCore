import { nanoid } from 'nanoid'
import * as z from 'zod'
import { AnnotationsSchema } from './annotations'

export const RegulatoryNodeNameSchema = z
    .string()
    .min(1, { error: 'Name must be at least 1 character long' })
    .max(60, { error: 'Name must be at most 60 characters long' })

export const RegulatoryNodeNameDraftSchema = z.string().default('')

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
    name: RegulatoryNodeNameDraftSchema,

    // Maximum activity level
    activityLevels: z.int().positive().max(9).min(1).default(1),

    // Whether the node acts as an external input
    isInputNode: z.boolean().default(false),

    // Logical rules
    rules: z.array(RegulatoryNodeRuleDraftSchema).default([]),

    // Internal validity flag for the current graph context
    isValid: z.boolean().optional(),

    annotations: AnnotationsSchema,
})

function getSafeValue<T>({
    schema,
    value,
    fallback,
}: {
    schema: z.ZodType<T>
    value: unknown
    fallback: T
}) {
    const parsedValue = schema.safeParse(value)

    return parsedValue.success ? parsedValue.data : fallback
}

export function normalizeRegulatoryNodeProperties(
    value: unknown
): RegulatoryNodeProperties {
    const parsedValue = RegulatoryNodePropertiesSchema.safeParse(value)

    if (parsedValue.success) {
        return parsedValue.data
    }

    const rawValue =
        value && typeof value === 'object'
            ? (value as Record<string, unknown>)
            : {}

    return {
        // Preserve the raw name so invalid user input remains editable.
        name: typeof rawValue.name === 'string' ? rawValue.name : '',
        activityLevels: getSafeValue({
            schema: RegulatoryNodePropertiesSchema.shape.activityLevels.unwrap(),
            value: rawValue.activityLevels,
            fallback: 1,
        }),
        isInputNode: getSafeValue({
            schema: RegulatoryNodePropertiesSchema.shape.isInputNode.unwrap(),
            value: rawValue.isInputNode,
            fallback: false,
        }),
        rules: getSafeValue({
            schema: RegulatoryNodePropertiesSchema.shape.rules,
            value: rawValue.rules,
            fallback: [],
        }),
        isValid: getSafeValue({
            schema: RegulatoryNodePropertiesSchema.shape.isValid,
            value: rawValue.isValid,
            fallback: RegulatoryNodeNameSchema.safeParse(rawValue.name).success,
        }),
        annotations: getSafeValue({
            schema: RegulatoryNodePropertiesSchema.shape.annotations,
            value: rawValue.annotations,
            fallback: undefined,
        }),
    }
}

export type RegulatoryNodeProperties = z.infer<
    typeof RegulatoryNodePropertiesSchema
>
export type RegulatoryNodeRule = z.infer<typeof RegulatoryNodeRuleSchema>
