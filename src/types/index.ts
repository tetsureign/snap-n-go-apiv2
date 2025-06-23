import { FastifyRequest, RouteGenericInterface } from "fastify";

export interface TokenSchema {
  userId: string;
  googleId: string;
}

export interface AuthenticatedRequest<
  T extends RouteGenericInterface = RouteGenericInterface
> extends FastifyRequest<T> {
  user?: TokenSchema;
}
