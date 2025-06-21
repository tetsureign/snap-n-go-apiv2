import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  handleGetMyInfo,
  handleSoftDelUser,
} from "@/controllers/userController";
import { authenticator } from "@/middlewares/authenticator";
import { userSchema } from "@/models/User";
import { notFound, ok, okEmpty } from "@/types/zodResponseSchemas";

const userRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/me",
    {
      preHandler: authenticator,
      schema: {
        description: "Get current user info",
        tags: ["User"],
        response: {
          200: ok(userSchema),
          404: notFound,
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
          200: okEmpty,
          404: notFound,
        },
      },
    },
    handleSoftDelUser
  );
};

export default userRouter;
