import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  handleOAuthLogin,
  handleRefreshToken,
} from "@/controllers/authController";
import authSchemas from "@/schemas/authSchemas";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";
import { userSchema } from "@/schemas/userSchemas";

const authRouter: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    "/login/oauth/:provider",
    {
      schema: {
        description: "Login with OAuth2 token (supports multiple providers)",
        tags: ["Auth"],
        body: authSchemas.tokenBodySchema,
        response: {
          201: zodResponseSchemas.userCreated(userSchema),
          400: zodResponseSchemas.badRequest,
          401: zodResponseSchemas.unauthorized,
        },
      },
    },
    handleOAuthLogin,
  );

  app.post(
    "/refresh",
    {
      schema: {
        description: "Refresh JWT access token",
        tags: ["Auth"],
        body: authSchemas.tokenBodySchema,
        response: {
          200: zodResponseSchemas.tokenRefreshed,
          401: zodResponseSchemas.unauthorized,
        },
      },
    },
    handleRefreshToken,
  );
};

export default authRouter;
