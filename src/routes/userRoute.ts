import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { authenticator } from "@/middlewares/authenticator";
import {
  handleGetMyInfo,
  handleSoftDelUser,
} from "@/controllers/userController";

const userSchema = z.object({
  id: z.string(),
  googleId: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
});

const userRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/me",
    {
      preHandler: authenticator,
      schema: {
        description: "Get current user info",
        tags: ["User"],
        response: {
          200: z.object({
            success: z.boolean(),
            data: userSchema,
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    handleGetMyInfo
  );
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/me/delete",
    {
      preHandler: authenticator,
      schema: {
        description: "Soft delete current user",
        tags: ["User"],
        response: {
          200: z.object({
            success: z.boolean(),
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    handleSoftDelUser
  );
};

export default userRouter;
