import userService from "@/services/userService";
import IAuthService from "@/interfaces/IAuthService";
import IJwtService from "@/interfaces/IJwtService";
import IOAuthService from "@/interfaces/IOAuthService";

export class GoogleAuthService implements IAuthService {
  constructor(
    private oauthService: IOAuthService,
    private jwtService: IJwtService
  ) {}

  async loginWithToken(token: string) {
    const googleUser = await this.oauthService.verifyToken(token);
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

  async refreshToken(token: string) {
    return this.jwtService.refreshToken(token);
  }
}
