import * as jwt from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "@/shared/errors/appError";
import userService from "@/modules/users/user.service";
import { AuthToken } from "@/types";
import {
  AuthConfig,
  JwtService,
  OAuthProvider,
} from "@/modules/auth/auth.types";

const GOOGLE_PROVIDER: OAuthProvider = "google";

export function createGoogleJwtService(config: AuthConfig): JwtService {
  function generateTokens(payload: AuthToken) {
    return {
      accessToken: jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.accessTokenExpiry,
      } as jwt.SignOptions),
      refreshToken: jwt.sign(payload, config.refreshSecret, {
        expiresIn: config.refreshTokenExpiry,
      } as jwt.SignOptions),
    };
  }

  async function refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.refreshSecret) as AuthToken;

      if (decoded.provider !== GOOGLE_PROVIDER) {
        throw new BadRequestError("Unsupported provider.");
      }

      const user = await userService.getUserByGoogleId(decoded.providerUserId);

      if (!user) {
        throw new UnauthorizedError("Invalid token.");
      }

      if (!user.googleId) {
        throw new BadRequestError("No Google ID found.");
      }

      const { accessToken, refreshToken } = generateTokens({
        userId: user.id,
        provider: GOOGLE_PROVIDER,
        providerUserId: user.googleId,
      });

      return { accessToken, refreshToken };
    } catch {
      throw new UnauthorizedError("Session expired or invalid token.");
    }
  }

  return {
    generateTokens,
    refreshToken,
  };
}
