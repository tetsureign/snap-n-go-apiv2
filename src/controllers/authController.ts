import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";

import { userSchema } from "@/models/User";
import { loginWithGoogleToken, refreshToken } from "@/services/authService";
import { tokenBodySchema } from "@/types/authSchemas";
import {
  badRequest,
  tokenRefreshed,
  userCreated,
} from "@/types/zodResponseSchemas";

type TokenBody = z.infer<typeof tokenBodySchema>;

export const handleLoginByGoogleId = async (
  req: FastifyRequest<{ Body: TokenBody }>,
  reply: FastifyReply
) => {
  try {
    const {
      user,
      accessToken,
      refreshToken: refresh,
    } = await loginWithGoogleToken(req.body.token);

    return reply.status(201).send(
      userCreated(userSchema).parse({
        data: user,
        accessToken,
        refreshToken: refresh,
      })
    );
  } catch (error) {
    req.log.error(error, "Error logging in with Google.");

    return reply
      .status(401)
      .send(badRequest.parse({ message: (error as Error).message }));
  }
};

export const handleRefreshToken = async (
  req: FastifyRequest<{ Body: TokenBody }>,
  reply: FastifyReply
) => {
  try {
    const { accessToken, refreshToken: refresh } = await refreshToken(
      req.body.token
    );

    return reply
      .status(200)
      .send(tokenRefreshed.parse({ accessToken, refreshToken: refresh }));
  } catch (error) {
    req.log.error(error, "Error refreshing token.");

    return reply
      .status(401)
      .send(badRequest.parse({ message: (error as Error).message }));
  }
};
