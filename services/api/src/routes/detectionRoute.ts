import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { handleDetection } from "@/controllers/detectionController";
import detectionResult from "@/schemas/detectionSchemas";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";

const detectRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      schema: {
        description: "Detect objects in an uploaded image",
        tags: ["Detection"],
        consumes: ["multipart/form-data"],
        response: {
          200: zodResponseSchemas.ok(detectionResult),
          400: zodResponseSchemas.badRequest,
        },
      },
    },
    handleDetection
  );
};

export default detectRouter;
