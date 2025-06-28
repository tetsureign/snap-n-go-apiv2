import { FastifyReply } from "fastify";

import { userSchema } from "@/models/User";
import { getUserById, softDeleteUser } from "@/services/userService";
import { AuthenticatedRequest } from "@/types";
import {
  internalError,
  notFound,
  ok,
  okEmpty,
} from "@/types/zodResponseSchemas";

export const handleGetMyInfo = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const user = await getUserById(req.user!.userId);

    if (!user) {
      return reply
        .status(404)
        .send(notFound.parse({ message: "User not found" }));
    }

    return reply.send(ok(userSchema).parse({ data: user.toDTO() }));
  } catch (error) {
    req.log.error(error, "Error fetching user");

    return reply.status(500).send(internalError.parse({}));
  }
};

export const handleSoftDelUser = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const result = await softDeleteUser(req.user!.userId);

    if (!result) {
      return reply
        .status(404)
        .send(notFound.parse({ message: "User not found or already deleted" }));
    }

    return reply.send(okEmpty.parse({}));
  } catch (error) {
    req.log.error(error, "Error soft deleting user.");
    return reply.status(500).send(internalError.parse({}));
  }
};
