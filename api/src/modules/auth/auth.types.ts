import "fastify";

import { User } from "@/generated/prisma/client";
import { FastifyRequest } from "fastify";

export type OAuthProvider = "google";

export type AuthToken = {
  userId: string;
  provider: OAuthProvider;
  providerUserId: string;
};

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

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthToken;
    user: AuthToken;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: import("fastify").FastifyReply,
    ) => Promise<unknown>;
  }
}
