import { z } from "zod";

export const InteractionType = {
  Activation: "activation",
  Inhibition: "inhibition",
  Dual: "dual",
} as const;

export const RegulatoryEdgeProperties = z.object({
  // Type of interaction (activation, inhibition, or dual)
  type: z.enum(InteractionType).default(InteractionType.Activation),

  // Target activity level threshold for the interaction to occur (1-9)
  target: z.int().positive().max(9).default(1),
});

export type InteractionType =
  (typeof InteractionType)[keyof typeof InteractionType];

export type RegulatoryEdgeProperties = z.infer<typeof RegulatoryEdgeProperties>;
