import { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import { loginWithGoogleToken, refreshToken } from "@/services/authService";

const tokenReqBodySchema = z.object({
  token: z.string().min(1, "Oauth2 token is required."),
});

export const handleLoginByGoogleId = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const validation = tokenReqBodySchema.safeParse(req.body);
  if (!validation.success)
    return reply
      .status(400)
      .send({ success: false, errors: validation.error.errors });

  try {
    const {
      user,
      accessToken,
      refreshToken: refresh,
    } = await loginWithGoogleToken(validation.data.token);
    return reply
      .status(201)
      .send({ success: true, data: user, accessToken, refreshToken: refresh });
  } catch (error) {
    req.log.error(error, "Error logging in with Google.");
    return reply
      .status(401)
      .send({ success: false, message: (error as Error).message });
  }
};

export const handleRefreshToken = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const validation = tokenReqBodySchema.safeParse(req.body);
  if (!validation.success)
    return reply
      .status(400)
      .send({ success: false, errors: validation.error.errors });

  try {
    const { accessToken, refreshToken: refresh } = await refreshToken(
      validation.data.token
    );
    return reply
      .status(200)
      .send({ success: true, accessToken, refreshToken: refresh });
  } catch (error) {
    req.log.error(error, "Error refreshing token.");
    return reply
      .status(401)
      .send({ success: false, message: (error as Error).message });
  }
};
