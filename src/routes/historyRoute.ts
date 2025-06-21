import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {
  handleAddMyQueryHistory,
  handleDeleteMyQueryHistory,
  handleGetMyHistoryLazy,
} from "@/controllers/historyController";
import { authenticator } from "@/middlewares/authenticator";
import { historySchema } from "@/models/SearchHistory";
import {
  addMySearchQuerySchema,
  delMyQuerySchema,
  getMyHistoryLazySchema,
} from "@/types/historySchemas";
import { notFound, ok, okEmpty } from "@/types/zodResponseSchemas";

const historyRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/me",
    {
      preHandler: authenticator,
      schema: {
        body: addMySearchQuerySchema,
        response: {
          201: ok(historySchema),
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
        querystring: getMyHistoryLazySchema,
        response: {
          200: ok(historySchema),
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
        body: delMyQuerySchema,
        response: {
          200: okEmpty,
          404: notFound,
        },
        tags: ["History"],
        description: "Soft delete search history entries",
      },
    },
    handleDeleteMyQueryHistory
  );
};

export default historyRouter;
