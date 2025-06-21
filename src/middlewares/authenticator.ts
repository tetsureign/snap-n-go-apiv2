import { FastifyReply } from "fastify";
import * as jwt from "jsonwebtoken";

import { AuthenticatedRequest, TokenSchema } from "@/types";
import { forbidden, unauthorized } from "@/types/zodResponseSchemas";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticator = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
) => {
  const token = request.headers.authorization?.split(" ")[1];
  if (!token) {
    return reply.status(401).send(unauthorized.parse({}));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenSchema;
    request.user = decoded;
  } catch {
    return reply
      .status(403)
      .send(forbidden.parse({ message: "Invalid or expired token" }));
  }
};
