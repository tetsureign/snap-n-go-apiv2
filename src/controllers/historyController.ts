import { FastifyReply } from "fastify";
import z from "zod";
import {
  addSearchQueryHistory,
  getUserQueryHistoryLazy,
  softDelQueryHistory,
} from "@/services/historyService";
import { AuthenticatedRequest } from "@/types";

const addMySearchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required."),
});

const getMyHistoryLazySchema = z.object({
  limit: z.coerce
    .number()
    .min(1, "Items limit is required.")
    .max(100, "Max items limit is 100."),
  cursor: z.string().uuid().optional(),
});

const delMyQuerySchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one ID is required."),
});

export const handleAddMyQueryHistory = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  const validation = addMySearchQuerySchema.safeParse(req.body);
  if (!validation.success)
    return reply
      .status(400)
      .send({ success: false, errors: validation.error.errors });

  try {
    const newHistoryEntry = await addSearchQueryHistory({
      userId: req.user!.userId,
      query: validation.data.query,
    });

    return reply.status(201).send({ success: true, data: newHistoryEntry });
  } catch (error) {
    req.log.error(error, "Error adding search history.");
    return reply
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

export const handleGetMyHistoryLazy = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const validation = getMyHistoryLazySchema.safeParse(req.query);
    if (!validation.success)
      return reply
        .status(400)
        .send({ success: false, errors: validation.error.errors });

    const { limit, cursor } = validation.data;

    const entries = await getUserQueryHistoryLazy(
      req.user!.userId,
      limit,
      cursor
    );

    return reply.send({ success: true, data: entries });
  } catch (error) {
    req.log.error({ error, req }, "Error fetching user's search history.");
    return reply
      .status(500)
      .send({ success: false, message: "Internal server error." });
  }
};

export const handleDeleteMyQueryHistory = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  const validation = delMyQuerySchema.safeParse(req.body);
  if (!validation.success)
    return reply
      .status(400)
      .send({ success: false, errors: validation.error.errors });

  try {
    const result = await softDelQueryHistory(
      req.user!.userId,
      validation.data.ids
    );

    if (!result)
      return reply.status(404).send({
        success: false,
        message: "History entries not found or already deleted.",
      });

    return reply.send({ success: true, message: `${result} entries deleted.` });
  } catch (error) {
    req.log.error(error, "Error soft deleting history.");
    return reply
      .status(500)
      .send({ success: false, message: "Internal server error." });
  }
};
