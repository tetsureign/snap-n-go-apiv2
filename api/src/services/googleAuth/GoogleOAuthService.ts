import { OAuth2Client } from "google-auth-library";

import { BadRequestError, UnauthorizedError } from "@/errors/appError";
import { AuthConfig, JwtService, OAuthProvider, OAuthService } from "@/types/auth";

import userService from "@/services/userService";

const GOOGLE_PROVIDER: OAuthProvider = "google";

export function createGoogleOAuthService(
  config: AuthConfig,
  jwtService: JwtService,
): OAuthService {
  const oauth2Client = new OAuth2Client(config.clientId);

  async function verifyToken(idToken: string) {
    try {
      const ticket = await oauth2Client.verifyIdToken({
        idToken,
        audience: config.clientId,
      });

      return ticket.getPayload();
    } catch (error) {
      console.error(error, "Error verifying Google token.");
      return null;
    }
  }

  async function loginWithToken(token: string) {
    const googleUser = await verifyToken(token);
    if (!googleUser) throw new UnauthorizedError("Invalid Google token.");

    const { sub: googleId, email, name } = googleUser;
    if (!googleId || !email || !name)
      throw new BadRequestError("Missing Google user info.");

    const user = await userService.createOrUpdateUser({
      googleId,
      email,
      name,
    });
    if (!user.googleId) {
      throw new BadRequestError("No Google ID found.");
    }

    const { accessToken, refreshToken } = jwtService.generateTokens({
      userId: user.id,
      provider: GOOGLE_PROVIDER,
      providerUserId: user.googleId,
    });

    return { user, accessToken, refreshToken };
  }

  return {
    loginWithToken,
    verifyToken,
  };
}
