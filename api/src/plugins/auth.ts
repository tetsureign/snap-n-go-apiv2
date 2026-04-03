import fastifyJwt from "@fastify/jwt";
import { FastifyPluginAsync } from "fastify";

import { env } from "@/config/env";
import { AuthToken } from "@/modules/auth/auth.types";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/appError";

const authPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.jwtSecret,
  });

  fastify.decorate("authenticate", async function authenticate(request) {
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
