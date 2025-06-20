import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import {
  handleLoginByGoogleId,
  handleRefreshToken,
} from "@/controllers/authController";

const userSchema = z.object({
  id: z.string(),
  googleId: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
});

const tokenBodySchema = z.object({
  token: z.string(),
});

const authRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/login/google",
    {
      schema: {
        description: "Login with Google OAuth2 token",
        tags: ["Auth"],
        body: tokenBodySchema,
        response: {
          201: z.object({
            success: z.boolean(),
            data: userSchema,
            accessToken: z.string(),
            refreshToken: z.string(),
          }),
          400: z.object({
            success: z.boolean(),
            errors: z.array(z.unknown()),
          }),
          401: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
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
          200: z.object({
            success: z.boolean(),
            accessToken: z.string(),
            refreshToken: z.string(),
          }),
          400: z.object({
            success: z.boolean(),
            errors: z.array(z.unknown()),
          }),
          401: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    handleRefreshToken
  );
};

export default authRouter;
