import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import authSchemas from "@/schemas/authSchemas";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";
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

  return reply.status(201).send(
    zodResponseSchemas.userCreated(userSchema).parse({
      data: toUserDTO(user),
      accessToken,
      refreshToken: refresh,
    }),
  );
};

export const handleRefreshToken = async (
  req: FastifyRequest<{ Body: TokenBody }>,
  reply: FastifyReply,
) => {
  const { accessToken, refreshToken: refresh } =
    await authService.refreshToken(req.body.token);

  return reply.status(200).send(
    zodResponseSchemas.tokenRefreshed.parse({
      accessToken,
      refreshToken: refresh,
    }),
  );
};
