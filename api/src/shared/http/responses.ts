import { FastifyReply } from "fastify";
import { z } from "zod";

import zodResponseSchemas from "@/shared/http/responseSchemas";

export function sendOk<T extends z.ZodTypeAny>(
  reply: FastifyReply,
  schema: T,
  data: z.infer<T>,
  statusCode = 200,
) {
  return reply.status(statusCode).send(
    zodResponseSchemas.ok(schema).parse({
      data,
    }),
  );
}

export function sendOkList<T extends z.ZodTypeAny>(
  reply: FastifyReply,
  schema: T,
  data: z.infer<T>[],
  statusCode = 200,
) {
  return reply.status(statusCode).send(
    zodResponseSchemas.okList(schema).parse({
      data,
    }),
  );
}

export function sendOkEmpty(reply: FastifyReply, statusCode = 200) {
  return reply.status(statusCode).send(zodResponseSchemas.okEmpty.parse({}));
}

export function sendAuthSuccess<T extends z.ZodTypeAny>(
  reply: FastifyReply,
  schema: T,
  data: z.infer<T>,
  accessToken: string,
  refreshToken: string,
  statusCode = 201,
) {
  return reply.status(statusCode).send(
    zodResponseSchemas.userCreated(schema).parse({
      data,
      accessToken,
      refreshToken,
    }),
  );
}

export function sendTokenRefresh(
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string,
) {
  return reply.status(200).send(
    zodResponseSchemas.tokenRefreshed.parse({
      accessToken,
      refreshToken,
    }),
  );
}
