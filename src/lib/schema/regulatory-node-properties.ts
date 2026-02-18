import * as z from "zod";

export const RegulatoryNodeProperties = z.object({
  // Name of the Gene
  name: z.string().min(1).max(20),

  // Maximum activity level
  activityLevels: z.int().positive().max(9).default(1),

  // Whether the node acts as an external input
  isInputNode: z.boolean().default(false),
});

export type RegulatoryNodeProperties = z.infer<typeof RegulatoryNodeProperties>;
