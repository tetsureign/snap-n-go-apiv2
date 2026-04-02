import fastify, { FastifyInstance } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

import { env } from "@/config/env";
import errorHandler from "@/shared/http/errorHandler";
import authPlugin from "@/plugins/auth";
import authRouter from "@/modules/auth/auth.routes";
import detectRouter from "@/modules/detection/detection.routes";
import historyRouter from "@/modules/history/history.routes";
import userRouter from "@/modules/users/user.routes";

const RATE_LIMITER_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMITER_MAX = 100;
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

export function buildApp(): FastifyInstance {
  const app = fastify({
    trustProxy: true,
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      },
      level: env.isProduction ? "info" : "debug",
    },
    ajv: {
      customOptions: {
        removeAdditional: "all",
        coerceTypes: true,
        useDefaults: true,
      },
    },
  });

  return app;
}

export async function registerApp(app: FastifyInstance): Promise<FastifyInstance> {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(rateLimit, {
    max: RATE_LIMITER_MAX,
    timeWindow: RATE_LIMITER_WINDOW_MS,
    allowList: ["127.0.0.1"],
  });

  await app.register(cors, {
    origin: env.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  });
  await app.register(helmet);
  await app.register(multipart, {
    limits: {
      fileSize: FILE_SIZE_LIMIT,
    },
  });
  await app.register(authPlugin);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Snap & Go API",
        description: "API documentation for Snap & Go",
        version: "2.0.0",
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUI, {
    routePrefix: `${env.routePrefix}/docs`,
  });

  app.setErrorHandler(errorHandler);

  await app.register(authRouter, { prefix: `${env.routePrefix}/auth` });
  await app.register(detectRouter, { prefix: `${env.routePrefix}/detect` });
  await app.register(userRouter, { prefix: `${env.routePrefix}/user` });
  await app.register(historyRouter, { prefix: `${env.routePrefix}/history` });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}

export async function createApp(): Promise<FastifyInstance> {
  const app = buildApp();
  return registerApp(app);
}
