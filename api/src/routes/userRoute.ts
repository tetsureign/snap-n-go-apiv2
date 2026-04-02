import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  handleGetMyInfo,
  handleSoftDelUser,
} from "@/controllers/userController";
import { authenticator } from "@/middlewares/authenticator";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";
import { userSchema } from "@/schemas/userSchemas";

const userRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/me",
    {
      preHandler: authenticator,
      schema: {
        description: "Get current user info",
        tags: ["User"],
        response: {
          200: zodResponseSchemas.ok(userSchema),
          404: zodResponseSchemas.notFound,
        },
      },
    },
    handleGetMyInfo,
  );
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/me/delete",
    {
      preHandler: authenticator,
      schema: {
        description: "Soft delete current user",
        tags: ["User"],
        response: {
          200: zodResponseSchemas.okEmpty,
          404: zodResponseSchemas.notFound,
        },
      },
    },
    handleSoftDelUser,
  );
};

export default userRouter;
