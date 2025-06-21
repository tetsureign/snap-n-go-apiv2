import { FastifyReply } from "fastify";
import { z } from "zod/v4";

import { historySchema } from "@/models/SearchHistory";
import {
  addSearchQueryHistory,
  getUserQueryHistoryLazy,
  softDelQueryHistory,
} from "@/services/historyService";
import { AuthenticatedRequest } from "@/types";
import {
  addMySearchQuerySchema,
  delMyQuerySchema,
  getMyHistoryLazySchema,
} from "@/types/historyRequestSchemas";
import {
  internalError,
  notFound,
  ok,
  okEmpty,
} from "@/types/zodResponseSchemas";

type AddMyQueryBody = z.infer<typeof addMySearchQuerySchema>;
type GetMyHistoryQuery = z.infer<typeof getMyHistoryLazySchema>;
type DeleteMyHistoryBody = z.infer<typeof delMyQuerySchema>;

export const handleAddMyQueryHistory = async (
  req: AuthenticatedRequest<{ Body: AddMyQueryBody }>,
  reply: FastifyReply
) => {
  try {
    const newHistoryEntry = await addSearchQueryHistory({
      userId: req.user!.userId, // user is ensured through the auth middleware
      query: req.body.query,
    });

    return reply
      .status(201)
      .send(ok(historySchema).parse({ data: newHistoryEntry }));
  } catch (error) {
    req.log.error(error, "Error adding search history.");
    return reply.status(500).send(internalError.parse({}));
  }
};

export const handleGetMyHistoryLazy = async (
  req: AuthenticatedRequest<{ Querystring: GetMyHistoryQuery }>,
  reply: FastifyReply
) => {
  try {
    const { limit, cursor } = req.query;

    const entries = await getUserQueryHistoryLazy(
      req.user!.userId,
      limit,
      cursor
    );

    return reply.send(ok(historySchema).parse({ data: entries }));
  } catch (error) {
    req.log.error({ error, req }, "Error fetching user's search history.");
    return reply.status(500).send(internalError.parse({}));
  }
};

export const handleDeleteMyQueryHistory = async (
  req: AuthenticatedRequest<{ Body: DeleteMyHistoryBody }>,
  reply: FastifyReply
) => {
  try {
    const result = await softDelQueryHistory(req.user!.userId, req.body.ids);

    if (!result)
      return reply.status(404).send(
        notFound.parse({
          message: "History entries not found or already deleted.",
        })
      );

    return reply.send(okEmpty.parse({}));
  } catch (error) {
    req.log.error(error, "Error soft deleting history.");
    return reply.status(500).send(internalError.parse({}));
  }
};
