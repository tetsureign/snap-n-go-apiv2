import { Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import { TokenSchema, AuthenticatedRequest } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticator = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"
  if (!token)
    return res.status(401).json({ success: false, message: "Unauthorized." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenSchema;

    req.user = decoded;

    next();
  } catch {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token." });
  }
};
