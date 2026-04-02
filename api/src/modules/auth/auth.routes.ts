import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  handleOAuthLogin,
  handleRefreshToken,
} from "@/modules/auth/auth.controller";
import authSchemas from "@/modules/auth/auth.schemas";
import zodResponseSchemas from "@/shared/http/responseSchemas";
import { userSchema } from "@/modules/users/user.schemas";

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
