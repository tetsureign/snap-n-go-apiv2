import fastifyJwt from "@fastify/jwt";
import { FastifyPluginAsync } from "fastify";

import { ForbiddenError, UnauthorizedError } from "@/errors/appError";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";
import { AuthToken } from "@/types";

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  await fastify.register(fastifyJwt, {
    secret: jwtSecret,
  });

  fastify.decorate("authenticate", async function authenticate(request, reply) {
    try {
      await request.jwtVerify<AuthToken>();
    } catch {
      const token = request.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new UnauthorizedError();
      }

      throw new ForbiddenError("Invalid or expired token");
    }
  });
};

export default authPlugin;
