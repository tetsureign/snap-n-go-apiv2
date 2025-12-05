import { OAuth2Client } from "google-auth-library";

import IOAuthService from "@/interfaces/IOAuthService";
import IOAuthConfigService from "@/interfaces/IOAuthConfigService";
import IJwtService from "@/interfaces/IJwtService";

import userService from "@/services/userService";

export default class GoogleOAuthService implements IOAuthService {
  private oauth2Client: OAuth2Client;

  constructor(
    private configService: IOAuthConfigService,
    private jwtService: IJwtService
  ) {
    this.oauth2Client = new OAuth2Client(this.configService.clientId);
  }

  async loginWithToken(token: string) {
    const googleUser = await this.verifyToken(token);
    if (!googleUser) throw new Error("Invalid Google token.");

    const { sub: googleId, email, name } = googleUser;

    if (!googleId || !email || !name)
      throw new Error("Missing Google user info.");

    const user = await userService.createOrUpdateUser({
      googleId,
      email,
      name,
    });

    if (!user.googleId) {
      throw new Error("No Google ID found.");
    }

    const { accessToken, refreshToken } = this.jwtService.generateTokens({
      userId: user.id,
      googleId: user.googleId,
    });

    return { user, accessToken, refreshToken };
  }

  async verifyToken(idToken: string) {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: this.configService.clientId,
      });

      return ticket.getPayload();
    } catch (error) {
      console.error(error, "Error verifying Google token.");
      return null;
    }
  }
}
