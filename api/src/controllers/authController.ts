import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { sendAuthSuccess, sendTokenRefresh } from "@/http/responses";
import authSchemas from "@/schemas/authSchemas";
import { toUserDTO, userSchema } from "@/schemas/userSchemas";
import authService from "@/services/authService";
import { OAuthProvider } from "@/types/auth";

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
