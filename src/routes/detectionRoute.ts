import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { handleDetection } from "@/controllers/detectionController";

const detectionResult = z.object({
  object: z.string(),
  score: z.number(),
  coordinate: z.object({
    x0: z.number(),
    y0: z.number(),
    x1: z.number(),
    y1: z.number(),
  }),
});

const detectRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      schema: {
        description: "Detect objects in an uploaded image",
        tags: ["Detection"],
        consumes: ["multipart/form-data"],
        // body: z.object({
        //   file: z.unknown(), // Fastify multipart doesn't validate file type with zod
        // }),
        response: {
          200: z.object({
            success: z.boolean(),
            data: z.array(detectionResult),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    handleDetection
  );
};

export default detectRouter;
