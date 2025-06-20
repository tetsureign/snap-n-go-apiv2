import { FastifyRequest } from "fastify";

export interface TokenSchema {
  userId: string;
  googleId: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user?: TokenSchema;
}
