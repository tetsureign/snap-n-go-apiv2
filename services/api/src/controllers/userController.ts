import { FastifyReply } from "fastify";

import { userSchema } from "@/models/User";
import userService from "@/services/userService";

import { AuthenticatedRequest } from "@/types";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";

export const handleGetMyInfo = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const user = await userService.getUserById(req.user!.userId);

    if (!user) {
      return reply
        .status(404)
        .send(zodResponseSchemas.notFound.parse({ message: "User not found" }));
    }

    return reply.send(
      zodResponseSchemas.ok(userSchema).parse({ data: user.toDTO() })
    );
  } catch (error) {
    req.log.error(error, "Error fetching user");

    return reply.status(500).send(zodResponseSchemas.internalError.parse({}));
  }
};

export const handleSoftDelUser = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const result = await userService.softDeleteUser(req.user!.userId);

    if (!result) {
      return reply.status(404).send(
        zodResponseSchemas.notFound.parse({
          message: "User not found or already deleted",
        })
      );
    }

    return reply.send(zodResponseSchemas.okEmpty.parse({}));
  } catch (error) {
    req.log.error(error, "Error soft deleting user.");
    return reply.status(500).send(zodResponseSchemas.internalError.parse({}));
  }
};
