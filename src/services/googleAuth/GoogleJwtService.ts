import * as jwt from "jsonwebtoken";
import { getUserByGoogleId } from "@/services/userService";
import { IJwtService } from "@/interfaces/IJwtService";
import { IOAuthConfigService } from "@/interfaces/IOAuthConfigService";
import { TokenSchema } from "@/types";

export class GoogleJwtService implements IJwtService {
  constructor(private configService: IOAuthConfigService) {}

  generateTokens(payload: TokenSchema) {
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
      ) as TokenSchema;
      const user = await getUserByGoogleId(decoded.googleId);

      if (!user) {
        throw new Error("Invalid token.");
      }

      if (!user.googleId) {
        throw new Error("No Google ID found.");
      }

      const { accessToken, refreshToken } = this.generateTokens({
        userId: user.id,
        googleId: user.googleId,
      });

      return { accessToken, refreshToken };
    } catch {
      throw new Error("Session expired or invalid token.");
    }
  }
}
