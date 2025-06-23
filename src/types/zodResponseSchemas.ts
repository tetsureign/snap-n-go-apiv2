import { z } from "zod/v4";

export const ok = <T>(objectSchema: T) =>
  z.object({
    success: z.literal(true).default(true),
    data: objectSchema,
  });

export const okEmpty = z.object({
  success: z.literal(true).default(true),
});

export const notFound = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Not found"),
});

export const internalError = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Internal server error"),
});

export const unauthorized = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Unauthorized"),
});

export const forbidden = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Forbidden"),
});

export const badRequest = z.object({
  success: z.literal(false).default(false),
  message: z.string().default("Bad request"),
});

export const userCreated = <T>(objectSchema: T) =>
  z.object({
    success: z.literal(true).default(true),
    data: objectSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  });

export const tokenRefreshed = z.object({
  success: z.literal(true).default(true),
  accessToken: z.string(),
  refreshToken: z.string(),
});
