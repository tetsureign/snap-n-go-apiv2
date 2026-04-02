import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  handleGetMyInfo,
  handleSoftDelUser,
} from "@/modules/users/user.controller";
import zodResponseSchemas from "@/shared/http/responseSchemas";
import { userSchema } from "@/modules/users/user.schemas";

const userRouter: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/me",
    {
      preHandler: fastify.authenticate,
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

  app.delete(
    "/me/delete",
    {
      preHandler: fastify.authenticate,
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
