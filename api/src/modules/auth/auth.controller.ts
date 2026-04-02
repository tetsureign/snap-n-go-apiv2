import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { sendAuthSuccess, sendTokenRefresh } from "@/shared/http/responses";
import authSchemas from "@/modules/auth/auth.schemas";
import { toUserDTO, userSchema } from "@/modules/users/user.schemas";
import authService from "@/modules/auth/auth.service";
import { OAuthProvider } from "@/modules/auth/auth.types";

type TokenBody = z.infer<typeof authSchemas.tokenBodySchema>;

export const handleOAuthLogin = async (
  req: FastifyRequest<{ Body: TokenBody; Params: { provider: OAuthProvider } }>,
  reply: FastifyReply,
) => {
  const { provider } = req.params;
  const {
    user,
    accessToken,
    refreshToken: refresh,
  } = await authService.loginWithOAuthToken(provider, req.body.token);

  return sendAuthSuccess(
    reply,
    userSchema,
    toUserDTO(user),
    accessToken,
    refresh,
  );
};

export const handleRefreshToken = async (
  req: FastifyRequest<{ Body: TokenBody }>,
  reply: FastifyReply,
) => {
  const { accessToken, refreshToken: refresh } =
    await authService.refreshToken(req.body.token);

  return sendTokenRefresh(reply, accessToken, refresh);
};
