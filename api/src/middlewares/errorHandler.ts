import { AppError } from "@/errors/appError";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export default function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    request.log.warn(
      `Handled ${error.name} on ${request.method} ${request.url}: ${error.message}`,
    );

    if (error.statusCode === 400) {
      return reply
        .status(400)
        .send(zodResponseSchemas.badRequest.parse({ message: error.message }));
    }

    if (error.statusCode === 401) {
      return reply
        .status(401)
        .send(zodResponseSchemas.unauthorized.parse({ message: error.message }));
    }

    if (error.statusCode === 403) {
      return reply
        .status(403)
        .send(zodResponseSchemas.forbidden.parse({ message: error.message }));
    }

    if (error.statusCode === 404) {
      return reply
        .status(404)
        .send(zodResponseSchemas.notFound.parse({ message: error.message }));
    }

    return reply
      .status(error.statusCode)
      .send(zodResponseSchemas.internalError.parse({ message: error.message }));
  }

  request.log.error(
    `Error on ${request.method} ${request.url}: ${error.message}`,
  );
  return reply.status(500).send(zodResponseSchemas.internalError.parse({}));
}
