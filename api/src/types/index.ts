import "fastify";
import { FastifyRequest, RouteGenericInterface } from "fastify";
import { OAuthProvider } from "@/modules/auth/auth.types";

export interface AuthToken {
  userId: string;
  provider: OAuthProvider;
  providerUserId: string;
}

export interface AuthenticatedRequest<
  T extends RouteGenericInterface = RouteGenericInterface
> extends FastifyRequest<T> {
  user: AuthToken;
}

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
