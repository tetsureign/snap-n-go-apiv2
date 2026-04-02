import fastifyJwt from "@fastify/jwt";
import { FastifyPluginAsync } from "fastify";

import { env } from "@/config/env";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/appError";
import { AuthToken } from "@/types";

const authPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.jwtSecret,
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
