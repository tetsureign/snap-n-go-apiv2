import { z } from "zod";

const ok = <T extends z.ZodTypeAny>(objectSchema: T) =>
  z.object({
    success: z.literal(true).default(true),
    data: objectSchema,
  });

const okList = <T extends z.ZodTypeAny>(objectSchema: T) =>
  z.object({
    success: z.literal(true).default(true),
    data: z.array(objectSchema),
  });

const okEmpty = z.object({
  success: z.literal(true).default(true),
});

const notFound = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Not found"),
});

const internalError = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Internal server error"),
});

const unauthorized = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Unauthorized"),
});

const forbidden = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Forbidden"),
});

const badRequest = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Bad request"),
});

const userCreated = <T>(objectSchema: T) =>
  z.object({
    success: z.literal(true).default(true),
    data: objectSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  });

const tokenRefreshed = z.object({
  success: z.literal(true).default(true),
  accessToken: z.string(),
  refreshToken: z.string(),
});

const zodResponseSchemas = {
  ok,
  okList,
  okEmpty,
  notFound,
  internalError,
  unauthorized,
  forbidden,
  badRequest,
  userCreated,
  tokenRefreshed,
};

export default zodResponseSchemas;
