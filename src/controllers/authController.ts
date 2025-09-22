import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";

import { userSchema } from "@/models/User";
import { IAuthService } from "@/interfaces/IAuthService";
import { tokenBodySchema } from "@/types/authSchemas";
import {
  badRequest,
  tokenRefreshed,
  userCreated,
} from "@/types/zodResponseSchemas";

type TokenBody = z.infer<typeof tokenBodySchema>;

export const handleOAuthLogin = async (
  req: FastifyRequest<{ Body: TokenBody; Params: { provider: string } }>,
  reply: FastifyReply
) => {
  try {
    const { provider } = req.params;

    // Validate provider
    if (!provider || !["google"].includes(provider.toLowerCase())) {
      return reply.status(400).send(
        badRequest.parse({
          message: `Unsupported OAuth provider: ${provider}`,
        })
      );
    }

    // Resolve service based on provider
    const authService = req.diScope.resolve<IAuthService>(
      `${provider}AuthService`
    );

    const {
      user,
      accessToken,
      refreshToken: refresh,
    } = await authService.loginWithToken(req.body.token);

    return reply.status(201).send(
      userCreated(userSchema).parse({
        data: user.toDTO(),
        accessToken,
        refreshToken: refresh,
      })
    );
  } catch (error) {
    req.log.error(error, "Error logging in with OAuth provider.");

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
    const authService = req.diScope.resolve<IAuthService>("authService");

    const { accessToken, refreshToken: refresh } =
      await authService.refreshToken(req.body.token);

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
