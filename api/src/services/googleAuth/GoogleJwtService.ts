import * as jwt from "jsonwebtoken";
import userService from "@/services/userService";
import IJwtService from "@/interfaces/IJwtService";
import IOAuthConfigService from "@/interfaces/IOAuthConfigService";
import { AuthToken } from "@/types";
import { OAuthProvider } from "@/types/auth";

const GOOGLE_PROVIDER: OAuthProvider = "google";

export default class GoogleJwtService implements IJwtService {
  constructor(private configService: IOAuthConfigService) {}

  generateTokens(payload: AuthToken) {
    return {
      accessToken: jwt.sign(payload, this.configService.jwtSecret, {
        expiresIn: this.configService.accessTokenExpiry,
      } as jwt.SignOptions),
      refreshToken: jwt.sign(payload, this.configService.refreshSecret, {
        expiresIn: this.configService.refreshTokenExpiry,
      } as jwt.SignOptions),
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        this.configService.refreshSecret
      ) as AuthToken;

      if (decoded.provider !== GOOGLE_PROVIDER) {
        throw new Error("Unsupported provider.");
      }

      const user = await userService.getUserByGoogleId(decoded.providerUserId);

      if (!user) {
        throw new Error("Invalid token.");
      }

      if (!user.googleId) {
        throw new Error("No Google ID found.");
      }

      const { accessToken, refreshToken } = this.generateTokens({
        userId: user.id,
        provider: GOOGLE_PROVIDER,
        providerUserId: user.googleId,
      });

      return { accessToken, refreshToken };
    } catch {
      throw new Error("Session expired or invalid token.");
    }
  }
}
