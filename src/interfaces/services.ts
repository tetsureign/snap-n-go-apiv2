import { TokenSchema } from "@/types";

export interface IOAuthConfigService {
  jwtSecret: string;
  refreshSecret: string;
  clientId: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export interface IOAuthService {
  verifyToken(idToken: string): Promise<any>;
}

export interface IJwtService {
  generateTokens(payload: TokenSchema): {
    accessToken: string;
    refreshToken: string;
  };
  refreshToken(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}

export interface IAuthService {
  loginWithToken(token: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }>;
  refreshToken(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
