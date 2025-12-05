import { FastifyReply } from "fastify";
import { z } from "zod/v4";

import { historySchema } from "@/models/SearchHistory";
import historyService from "@/services/historyService";

import { AuthenticatedRequest } from "@/types";
import historyRequestSchemas from "@/schemas/historyRequestSchemas";
import zodResponseSchemas from "@/schemas/response/zodResponseSchemas";

type AddMyQueryBody = z.infer<
  typeof historyRequestSchemas.addMySearchQuerySchema
>;
type GetMyHistoryQuery = z.infer<
  typeof historyRequestSchemas.getMyHistoryLazySchema
>;
type DeleteMyHistoryBody = z.infer<
  typeof historyRequestSchemas.delMyQuerySchema
>;

export const handleAddMyQueryHistory = async (
  req: AuthenticatedRequest<{ Body: AddMyQueryBody }>,
  reply: FastifyReply
) => {
  try {
    const newHistoryEntry = await historyService.addSearchQueryHistory({
      userId: req.user!.userId, // user is ensured through the auth middleware
      query: req.body.query,
    });

    return reply
      .status(201)
      .send(
        zodResponseSchemas.ok(historySchema).parse({ data: newHistoryEntry })
      );
  } catch (error) {
    req.log.error(error, "Error adding search history.");
    return reply.status(500).send(zodResponseSchemas.internalError.parse({}));
  }
};

export const handleGetMyHistoryLazy = async (
  req: AuthenticatedRequest<{ Querystring: GetMyHistoryQuery }>,
  reply: FastifyReply
) => {
  try {
    const { limit, cursor } = req.query;

    const entries = await historyService.getUserQueryHistoryLazy(
      req.user!.userId,
      limit,
      cursor
    );

    return reply.send(
      zodResponseSchemas.ok(historySchema).parse({ data: entries })
    );
  } catch (error) {
    req.log.error({ error, req }, "Error fetching user's search history.");
    return reply.status(500).send(zodResponseSchemas.internalError.parse({}));
  }
};

export const handleDeleteMyQueryHistory = async (
  req: AuthenticatedRequest<{ Body: DeleteMyHistoryBody }>,
  reply: FastifyReply
) => {
  try {
    const result = await historyService.softDelQueryHistory(
      req.user!.userId,
      req.body.ids
    );

    if (!result)
      return reply.status(404).send(
        zodResponseSchemas.notFound.parse({
          message: "History entries not found or already deleted.",
        })
      );

    return reply.send(zodResponseSchemas.okEmpty.parse({}));
  } catch (error) {
    req.log.error(error, "Error soft deleting history.");
    return reply.status(500).send(zodResponseSchemas.internalError.parse({}));
  }
};
