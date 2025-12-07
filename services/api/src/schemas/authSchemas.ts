import { z } from "zod";

const tokenBodySchema = z.object({
  token: z.string(),
});

const authSchemas = {
  tokenBodySchema,
};

export default authSchemas;
