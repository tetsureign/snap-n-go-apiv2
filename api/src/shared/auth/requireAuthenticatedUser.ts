import { UnauthorizedError } from "@/shared/errors/appError";
import { AuthenticatedRequest } from "@/types";

export function requireAuthenticatedUser(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  return req.user;
}
