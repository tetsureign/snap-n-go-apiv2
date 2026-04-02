import { z } from "zod";

export const detectionResultSchema = z.object({
  object: z.string(),
  score: z.number(),
  coordinate: z.object({
    x0: z.number(),
    y0: z.number(),
    x1: z.number(),
    y1: z.number(),
  }),
});

export const detectionResultListSchema = z.array(detectionResultSchema);

const detectionSchemas = {
  detectionResult: detectionResultSchema,
  detectionResultList: detectionResultListSchema,
};

export default detectionSchemas;
