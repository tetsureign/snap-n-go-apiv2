import { Request } from "express";

export interface TokenSchema {
  userId: string;
  googleId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenSchema;
}
