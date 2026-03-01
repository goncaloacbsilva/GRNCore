import { z } from 'zod'

export const InteractionType = {
    Activation: 'activation',
    Inhibition: 'inhibition',

    // TODO: Remove dual, an edge will be dual if it has both activation and inhibition properties
    Dual: 'dual',
} as const

export const RegulatoryEdgeProperties = z.object({
    // Type of interaction (activation, inhibition, or dual)
    type: z.enum(InteractionType).default(InteractionType.Activation),

    // Target activity level threshold for the interaction to occur (1-9)
    target: z.int().positive().max(9).default(1),

    // Optional list of draggable control points used to shape the edge path.
    controlPoints: z.array(z.tuple([z.number(), z.number()])).default([]),

    // Selection state used by the editor interaction layer.
    selected: z.boolean().default(false),

    // Guides that control where the edge attaches to source/target node boundaries.
    sourceControlPoint: z.tuple([z.number(), z.number()]).optional(),
    targetControlPoint: z.tuple([z.number(), z.number()]).optional(),
})

export type InteractionType =
    (typeof InteractionType)[keyof typeof InteractionType]

export type RegulatoryEdgeProperties = z.infer<typeof RegulatoryEdgeProperties>
