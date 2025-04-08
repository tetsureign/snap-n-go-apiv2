import { Response } from "express";
import z from "zod";

import {
  addSearchQueryHistory,
  getUserQueryHistoryLazy,
  softDelQueryHistory,
} from "@/models/searchHistoryModel";
import { AuthenticatedRequest } from "@/types";

import logger from "@/utils/logger";

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
  res: Response
) => {
  const validation = addMySearchQuerySchema.safeParse(req.body);
  if (!validation.success)
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });

  try {
    const newHistoryEntry = await addSearchQueryHistory({
      userId: req.user!.userId,
      query: validation.data.query,
    });

    return res.status(201).json({ success: true, data: newHistoryEntry });
  } catch (error) {
    logger.error(error, "Error adding search history.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const handleGetMyHistoryLazy = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const validation = getMyHistoryLazySchema.safeParse(req.query);
    if (!validation.success)
      return res
        .status(400)
        .json({ success: false, errors: validation.error.errors });

    const { limit, cursor } = validation.data;

    const entries = await getUserQueryHistoryLazy(
      req.user!.userId,
      limit,
      cursor
    );

    return res.json({ success: true, data: entries });
  } catch (error) {
    logger.error({ error, req }, "Error fetching user's search history.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const handleDeleteMyQueryHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const validation = delMyQuerySchema.safeParse(req.body);
  if (!validation.success)
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });

  try {
    const result = softDelQueryHistory(req.user!.userId, validation.data.ids);

    if (!result)
      return res.status(404).json({
        success: false,
        message: "History entries not found or already deleted.",
      });

    return res.json({ success: true, message: `${result} entries deleted.` });
  } catch (error) {
    logger.error(error, "Error soft deleting history.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
