import { FastifyRequest, FastifyReply } from "fastify";
import { loginWithGoogleToken, refreshToken } from "@/services/authService";

export const handleLoginByGoogleId = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const {
      user,
      accessToken,
      refreshToken: refresh,
    } = await loginWithGoogleToken((req.body as any).token);
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
  try {
    const { accessToken, refreshToken: refresh } = await refreshToken(
      (req.body as any).token
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
