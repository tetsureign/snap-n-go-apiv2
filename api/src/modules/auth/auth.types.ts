import { User } from "@/generated/prisma/client";

import { AuthToken } from "@/types";

export type OAuthProvider = "google";

export type AuthConfig = {
  jwtSecret: string;
  refreshSecret: string;
  clientId: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
};

export type JwtService = {
  generateTokens(payload: AuthToken): {
    accessToken: string;
    refreshToken: string;
  };
  refreshToken(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
};

export type OAuthService = {
  loginWithToken(token: string): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }>;
  verifyToken(idToken: string): Promise<unknown>;
};
