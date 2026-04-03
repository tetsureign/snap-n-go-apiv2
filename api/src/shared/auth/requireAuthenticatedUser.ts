import { AuthToken } from "@/modules/auth/auth.types";
import { FastifyRequest } from "fastify";
import { UnauthorizedError } from "@/shared/errors/appError";

export function requireAuthenticatedUser(req: FastifyRequest): AuthToken {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  return req.user;
}
