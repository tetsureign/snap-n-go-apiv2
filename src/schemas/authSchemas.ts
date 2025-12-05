import { z } from "zod/v4";

const tokenBodySchema = z.object({
  token: z.string(),
});

const authSchemas = {
  tokenBodySchema,
};

export default authSchemas;
