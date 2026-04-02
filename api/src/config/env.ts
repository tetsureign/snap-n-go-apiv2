import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    ROUTE_PREFIX: z.string().default(""),
    JWT_SECRET: z.string().min(1, "JWT_SECRET environment variable is required"),
    REFRESH_SECRET: z.string().min(1, "REFRESH_SECRET environment variable is required"),
    GOOGLE_CLIENT_ID: z
      .string()
      .min(1, "GOOGLE_CLIENT_ID environment variable is required"),
    CORS_ORIGINS: z.string().optional(),
    CORS_ORIGIN: z.string().optional(),
    YOLO_SERVICE_URL: z
      .string()
      .min(1, "YOLO_SERVICE_URL environment variable is required"),
    DB_HOST: z.string().min(1, "DB_HOST environment variable is required"),
    DB_PORT: z.coerce.number().int().positive().default(3306),
  })
  .transform((rawEnv) => {
    const isProduction = rawEnv.NODE_ENV === "production";
    const corsOriginsEnv = rawEnv.CORS_ORIGINS || rawEnv.CORS_ORIGIN;

    if (!corsOriginsEnv && isProduction) {
      throw new Error(
        "CORS_ORIGINS or CORS_ORIGIN environment variable is required in production",
      );
    }

    const corsOrigins = corsOriginsEnv
      ? corsOriginsEnv.split(",").map((origin) => origin.trim())
      : [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];

    return {
      nodeEnv: rawEnv.NODE_ENV,
      isProduction,
      port: rawEnv.PORT,
      routePrefix: rawEnv.ROUTE_PREFIX,
      jwtSecret: rawEnv.JWT_SECRET,
      refreshSecret: rawEnv.REFRESH_SECRET,
      googleClientId: rawEnv.GOOGLE_CLIENT_ID,
      corsOrigins,
      yoloServiceUrl: rawEnv.YOLO_SERVICE_URL,
      dbHost: rawEnv.DB_HOST,
      dbPort: rawEnv.DB_PORT,
    };
  });

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
