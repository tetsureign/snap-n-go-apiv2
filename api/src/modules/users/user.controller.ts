import { NotFoundError } from "@/shared/errors/appError";
import { FastifyReply, FastifyRequest } from "fastify";

import { sendOk, sendOkEmpty } from "@/shared/http/responses";
import userService from "@/modules/users/user.service";

import { toUserDTO, userSchema } from "@/modules/users/user.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/requireAuthenticatedUser";

export const handleGetMyInfo = async (
  req: FastifyRequest,
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
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = requireAuthenticatedUser(req);
  await userService.softDeleteUser(user.userId);

  return sendOkEmpty(reply);
};
