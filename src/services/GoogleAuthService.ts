import { createOrUpdateUser } from "@/services/userService";
import {
  IOAuthService,
  IJwtService,
  IAuthService,
} from "@/interfaces/services";

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

    const user = await createOrUpdateUser({ googleId, email, name });
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
