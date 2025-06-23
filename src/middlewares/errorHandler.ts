import { internalError } from "@/types/zodResponseSchemas";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export default function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(
    `Error on ${request.method} ${request.url}: ${error.message}`
  );
  reply.status(500).send(internalError.parse({}));
}
