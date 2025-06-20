import { FastifyReply } from "fastify";
import {
  addSearchQueryHistory,
  getUserQueryHistoryLazy,
  softDelQueryHistory,
} from "@/services/historyService";
import { AuthenticatedRequest } from "@/types";

export const handleAddMyQueryHistory = async (
  req: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    const newHistoryEntry = await addSearchQueryHistory({
      userId: req.user!.userId,
      query: (req.body as any).query,
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
    const { limit, cursor } = req.query as any;

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
  try {
    const result = await softDelQueryHistory(
      req.user!.userId,
      (req.body as any).ids
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
