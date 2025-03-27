import { Request } from "express";

export interface TokenSchema {
  userId: string;
  googleId: string;
}

export interface RequestWithUserId extends Request {
  userId: string;
}
