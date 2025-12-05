import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  handleAddMyQueryHistory,
  handleDeleteMyQueryHistory,
  handleGetMyHistoryLazy,
} from "@/controllers/historyController";
import { authenticator } from "@/middlewares/authenticator";
import { historySchema } from "@/models/SearchHistory";
import historyRequestSchemas from "@/schemas/historyRequestSchemas";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";

const historyRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/me",
    {
      preHandler: authenticator,
      schema: {
        body: historyRequestSchemas.addMySearchQuerySchema,
        response: {
          201: zodResponseSchemas.ok(historySchema),
        },
        tags: ["History"],
        description: "Add a search query to history",
      },
    },
    handleAddMyQueryHistory
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/me",
    {
      preHandler: authenticator,
      schema: {
        querystring: historyRequestSchemas.getMyHistoryLazySchema,
        response: {
          200: zodResponseSchemas.ok(historySchema),
        },
        tags: ["History"],
        description: "Get user's search history (paginated)",
      },
    },
    handleGetMyHistoryLazy
  );

  fastify.withTypeProvider<ZodTypeProvider>().delete(
    "/me",
    {
      preHandler: authenticator,
      schema: {
        body: historyRequestSchemas.delMyQuerySchema,
        response: {
          200: zodResponseSchemas.okEmpty,
          404: zodResponseSchemas.notFound,
        },
        tags: ["History"],
        description: "Soft delete search history entries",
      },
    },
    handleDeleteMyQueryHistory
  );
};

export default historyRouter;
