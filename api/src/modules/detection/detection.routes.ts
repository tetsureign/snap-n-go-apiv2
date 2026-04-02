import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { handleDetection } from "@/modules/detection/detection.controller";
import detectionSchemas from "@/modules/detection/detection.schemas";
import zodResponseSchemas from "@/shared/http/responseSchemas";

const detectRouter: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    "/",
    {
      schema: {
        description: "Detect objects in an uploaded image",
        tags: ["Detection"],
        consumes: ["multipart/form-data"],
        response: {
          200: zodResponseSchemas.okList(detectionSchemas.detectionResult),
          400: zodResponseSchemas.badRequest,
        },
      },
    },
    handleDetection,
  );
};

export default detectRouter;
