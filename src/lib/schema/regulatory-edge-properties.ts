import { z } from 'zod'
import { nanoid } from 'nanoid'

export const InteractionType = {
    Activation: 'activation',
    Inhibition: 'inhibition',

    // TODO: Remove dual, an edge will be dual if it has both activation and inhibition properties
    /* Dual: 'dual', */
} as const

const RegulatoryEdgeLevelBaseSchema = z.object({
    id: z.string(),

    // Type of interaction (activation, inhibition, or dual)
    type: z.enum(InteractionType),

    // Target activity level threshold for the interaction to occur (1-9)
    target: z.int().positive().max(9).min(1),
})

export const RegulatoryEdgeLevelSchema = RegulatoryEdgeLevelBaseSchema

export const RegulatoryEdgeLevelWithDefaultsSchema =
    RegulatoryEdgeLevelBaseSchema.extend({
        id: RegulatoryEdgeLevelBaseSchema.shape.id.default(() => nanoid()),

        // Type of interaction (activation, inhibition, or dual)
        type: RegulatoryEdgeLevelBaseSchema.shape.type.default(
            InteractionType.Activation
        ),

        // Target activity level threshold for the interaction to occur (1-9)
        target: RegulatoryEdgeLevelBaseSchema.shape.target.default(1),
    })

export const RegulatoryEdgeProperties = z.object({
    levels: z.array(RegulatoryEdgeLevelWithDefaultsSchema),
})

export type InteractionType =
    (typeof InteractionType)[keyof typeof InteractionType]

export type RegulatoryEdgeProperties = z.infer<typeof RegulatoryEdgeProperties>
