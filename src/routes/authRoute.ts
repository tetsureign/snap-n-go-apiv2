import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  handleLoginByGoogleId,
  handleRefreshToken,
} from "@/controllers/authController";
import { userSchema } from "@/models/User";
import { tokenBodySchema } from "@/types/authSchemas";
import {
  badRequest,
  tokenRefreshed,
  userCreated,
} from "@/types/zodResponseSchemas";

const authRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/login/google",
    {
      schema: {
        description: "Login with Google OAuth2 token",
        tags: ["Auth"],
        body: tokenBodySchema,
        response: {
          201: userCreated(userSchema),
          401: badRequest,
        },
      },
    },
    handleLoginByGoogleId
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
