import { z } from "zod/v4";

export const tokenBodySchema = z.object({
  token: z.string(),
});
