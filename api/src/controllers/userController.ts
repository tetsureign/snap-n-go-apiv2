import { NotFoundError } from "@/errors/appError";
import { FastifyReply } from "fastify";

import { sendOk, sendOkEmpty } from "@/http/responses";
import userService from "@/services/userService";

import { AuthenticatedRequest } from "@/types";
import { toUserDTO, userSchema } from "@/schemas/userSchemas";
import { requireAuthenticatedUser } from "@/utils/requireAuthenticatedUser";

export const handleGetMyInfo = async (
  req: AuthenticatedRequest,
  reply: FastifyReply,
) => {
  const user = requireAuthenticatedUser(req);
  const foundUser = await userService.getUserById(user.userId);

  if (!foundUser) {
    throw new NotFoundError("User not found");
  }

  return sendOk(reply, userSchema, toUserDTO(foundUser));
};

export const handleSoftDelUser = async (
  req: AuthenticatedRequest,
  reply: FastifyReply,
) => {
  const user = requireAuthenticatedUser(req);
  await userService.softDeleteUser(user.userId);

  return sendOkEmpty(reply);
};
