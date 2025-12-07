import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { userSchema } from "@/models/User";

import authSchemas from "@/schemas/authSchemas";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";
import IJwtService from "@/interfaces/IJwtService";
import IOAuthService from "@/interfaces/IOAuthService";

type TokenBody = z.infer<typeof authSchemas.tokenBodySchema>;

export const handleOAuthLogin = async (
  req: FastifyRequest<{ Body: TokenBody; Params: { provider: string } }>,
  reply: FastifyReply
) => {
  try {
    const { provider } = req.params;

    // Validate provider
    if (!provider || !["google"].includes(provider.toLowerCase())) {
      return reply.status(400).send(
        zodResponseSchemas.badRequest.parse({
          message: `Unsupported OAuth provider: ${provider}`,
        })
      );
    }

    // Resolve service based on provider
    const oAuthService = req.diScope.resolve<IOAuthService>(
      `${provider}OAuthService`
    );

    const {
      user,
      accessToken,
      refreshToken: refresh,
    } = await oAuthService.loginWithToken(req.body.token);

    return reply.status(201).send(
      zodResponseSchemas.userCreated(userSchema).parse({
        data: user.toDTO(),
        accessToken,
        refreshToken: refresh,
      })
    );
  } catch (error) {
    req.log.error(error, "Error logging in with OAuth provider.");

    return reply.status(401).send(
      zodResponseSchemas.badRequest.parse({
        message: (error as Error).message,
      })
    );
  }
};

export const handleRefreshToken = async (
  req: FastifyRequest<{ Body: TokenBody }>,
  reply: FastifyReply
) => {
  try {
    const jwtService = req.diScope.resolve<IJwtService>("jwtService");

    const { accessToken, refreshToken: refresh } =
      await jwtService.refreshToken(req.body.token);

    return reply.status(200).send(
      zodResponseSchemas.tokenRefreshed.parse({
        accessToken,
        refreshToken: refresh,
      })
    );
  } catch (error) {
    req.log.error(error, "Error refreshing token.");

    return reply.status(401).send(
      zodResponseSchemas.badRequest.parse({
        message: (error as Error).message,
      })
    );
  }
};
