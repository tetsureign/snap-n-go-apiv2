import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import {
  handleAddMyQueryHistory,
  handleGetMyHistoryLazy,
  handleDeleteMyQueryHistory,
} from "@/controllers/historyController";
import { authenticator } from "@/middlewares/authenticator";

const addMySearchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required."),
});
const getMyHistoryLazySchema = z.object({
  limit: z.coerce.number().min(1).max(100),
  cursor: z.string().uuid().optional(),
});
const delMyQuerySchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID is required."),
});
const historyEntry = z.object({
  id: z.string(),
  userId: z.string(),
  searchQuery: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
});

const historyRouter: FastifyPluginAsync = async (fastify) => {
  fastify.withTypeProvider<ZodTypeProvider>().post(
    "/me",
    {
      preHandler: authenticator,
      schema: {
        body: addMySearchQuerySchema,
        response: {
          201: z.object({
            success: z.boolean(),
            data: historyEntry,
          }),
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
          200: z.object({
            success: z.boolean(),
            data: z.array(historyEntry),
          }),
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
          200: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
        tags: ["History"],
        description: "Soft delete search history entries",
      },
    },
    handleDeleteMyQueryHistory
  );
};

export default historyRouter;
