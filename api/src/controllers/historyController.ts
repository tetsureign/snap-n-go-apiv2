import { FastifyReply } from "fastify";
import { z } from "zod";

import { sendOk, sendOkEmpty, sendOkList } from "@/http/responses";
import historyService from "@/services/historyService";

import { AuthenticatedRequest } from "@/types";
import historyRequestSchemas from "@/schemas/historyRequestSchemas";
import {
  historySchema,
  toHistoryDTO,
  toHistoryDTOList,
} from "@/schemas/historySchemas";
import { requireAuthenticatedUser } from "@/utils/requireAuthenticatedUser";

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
  reply: FastifyReply,
) => {
  const user = requireAuthenticatedUser(req);
  const newHistoryEntry = await historyService.addSearchQueryHistory({
    userId: user.userId,
    query: req.body.query,
  });

  return sendOk(reply, historySchema, toHistoryDTO(newHistoryEntry), 201);
};

export const handleGetMyHistoryLazy = async (
  req: AuthenticatedRequest<{ Querystring: GetMyHistoryQuery }>,
  reply: FastifyReply,
) => {
  const user = requireAuthenticatedUser(req);
  const { limit, cursor } = req.query;

  const entries = await historyService.getUserQueryHistoryLazy(
    user.userId,
    limit,
    cursor,
  );

  return sendOkList(reply, historySchema, toHistoryDTOList(entries));
};

export const handleDeleteMyQueryHistory = async (
  req: AuthenticatedRequest<{ Body: DeleteMyHistoryBody }>,
  reply: FastifyReply,
) => {
  const user = requireAuthenticatedUser(req);
  await historyService.softDelQueryHistory(user.userId, req.body.ids);

  return sendOkEmpty(reply);
};
