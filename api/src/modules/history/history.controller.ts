import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { sendOk, sendOkEmpty, sendOkList } from "@/shared/http/responses";
import historyService from "@/modules/history/history.service";

import historyRequestSchemas from "@/modules/history/history.request.schemas";
import {
  historySchema,
  toHistoryDTO,
  toHistoryDTOList,
} from "@/modules/history/history.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/requireAuthenticatedUser";

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
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = requireAuthenticatedUser(req);
  const body = req.body as AddMyQueryBody;
  const newHistoryEntry = await historyService.addSearchQueryHistory({
    userId: user.userId,
    query: body.query,
  });

  return sendOk(reply, historySchema, toHistoryDTO(newHistoryEntry), 201);
};

export const handleGetMyHistoryLazy = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = requireAuthenticatedUser(req);
  const { limit, cursor } = req.query as GetMyHistoryQuery;

  const entries = await historyService.getUserQueryHistoryLazy(
    user.userId,
    limit,
    cursor,
  );

  return sendOkList(reply, historySchema, toHistoryDTOList(entries));
};

export const handleDeleteMyQueryHistory = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = requireAuthenticatedUser(req);
  const body = req.body as DeleteMyHistoryBody;
  await historyService.softDelQueryHistory(user.userId, body.ids);

  return sendOkEmpty(reply);
};
