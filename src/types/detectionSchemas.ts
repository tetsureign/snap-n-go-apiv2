import { z } from "zod/v4";

export const detectionResult = z.object({
  object: z.string(),
  score: z.number(),
  coordinate: z.object({
    x0: z.number(),
    y0: z.number(),
    x1: z.number(),
    y1: z.number(),
  }),
});
