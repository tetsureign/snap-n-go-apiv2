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
import { fastifyAwilixPlugin } from "@fastify/awilix";

import container from "@/container/dependencyInjection";
import errorHandler from "@/middlewares/errorHandler";
import authRouter from "@/routes/authRoute";
import detectRouter from "@/routes/detectionRoute";
import historyRouter from "@/routes/historyRoute";
import userRouter from "@/routes/userRoute";

const RATE_LIMITER_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMITER_MAX = 100;
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

function getCorsOrigins(): string[] | RegExp[] {
  const isProduction = process.env.NODE_ENV === "production";
  const corsOriginsEnv = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN;

  if (corsOriginsEnv) {
    return corsOriginsEnv.split(",").map((origin) => origin.trim());
  }

  if (isProduction) {
    throw new Error(
      "CORS_ORIGINS or CORS_ORIGIN environment variable is required in production",
    );
  }

  return [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];
}

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
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
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
  const routePrefix = process.env.ROUTE_PREFIX || "";
  const corsOrigins = getCorsOrigins();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(rateLimit, {
    max: RATE_LIMITER_MAX,
    timeWindow: RATE_LIMITER_WINDOW_MS,
    allowList: ["127.0.0.1"],
  });

  await app.register(cors, {
    origin: corsOrigins,
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

  await app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
    strictBooleanEnforced: true,
  });

  app.diContainer.register(container.registrations);

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
    routePrefix: `${routePrefix}/docs`,
  });

  app.setErrorHandler(errorHandler);

  await app.register(authRouter, { prefix: `${routePrefix}/auth` });
  await app.register(detectRouter, { prefix: `${routePrefix}/detect` });
  await app.register(userRouter, { prefix: `${routePrefix}/user` });
  await app.register(historyRouter, { prefix: `${routePrefix}/history` });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}

export async function createApp(): Promise<FastifyInstance> {
  const app = buildApp();
  return registerApp(app);
}
