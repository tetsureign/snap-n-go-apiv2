import "dotenv/config";

import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import errorHandler from "@/middlewares/errorHandler";
import authRouter from "@/routes/authRoute";
import detectRouter from "@/routes/detectionRoute";
import historyRouter from "@/routes/historyRoute";
import userRouter from "@/routes/userRoute";

import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { fastifyAwilixPlugin } from "@fastify/awilix";
import container from "@/container/dependencyInjection";

const RATE_LIMITER_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMITER_MAX = 100; // Limit each IP to 100 requests per windowMs
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

const app = fastify({
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

async function bootstrap() {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register plugins
  await app.register(rateLimit, {
    max: RATE_LIMITER_MAX,
    timeWindow: RATE_LIMITER_WINDOW_MS,
    allowList: ["127.0.0.1"], // Allow localhost unlimited
  });

  await app.register(cors);
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

  // Register DI container
  app.diContainer.register(container.registrations);

  // Register Swagger
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
    routePrefix: "/docs",
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  const routePrefix = process.env.ROUTE_PREFIX || "";

  // Register routes
  await app.register(authRouter, { prefix: `${routePrefix}/auth` });
  await app.register(detectRouter, { prefix: `${routePrefix}/detect` });
  await app.register(userRouter, { prefix: `${routePrefix}/user` });
  await app.register(historyRouter, { prefix: `${routePrefix}/history` });

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Server started at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
