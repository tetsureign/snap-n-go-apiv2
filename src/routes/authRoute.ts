import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  handleOAuthLogin,
  handleRefreshToken,
} from "@/controllers/authController";
import { userSchema } from "@/models/User";
import { tokenBodySchema } from "@/schemas/authSchemas";
import {
  badRequest,
  tokenRefreshed,
  userCreated,
} from "@/schemas/response/zodResponseSchemas";

const authRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/login/oauth/:provider",
    {
      schema: {
        description: "Login with OAuth2 token (supports multiple providers)",
        tags: ["Auth"],
        params: {
          type: "object",
          properties: {
            provider: { type: "string", enum: ["google"] },
          },
          required: ["provider"],
        },
        body: tokenBodySchema,
        response: {
          201: userCreated(userSchema),
          400: badRequest,
          401: badRequest,
        },
      },
    },
    handleOAuthLogin
  );

  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/refresh",
    {
      schema: {
        description: "Refresh JWT access token",
        tags: ["Auth"],
        body: tokenBodySchema,
        response: {
          200: tokenRefreshed,
          401: badRequest,
        },
      },
    },
    handleRefreshToken
  );
};

export default authRouter;
