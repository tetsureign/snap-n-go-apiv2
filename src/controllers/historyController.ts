import { Request, Response } from "express";
import z from "zod";

import {
  addSearchQuery,
  getUserSearchHistory,
} from "@/models/searchHistoryModel";

import logger from "@/utils/logger";

const addSearchQuerySchema = z.object({
  userId: z.string().uuid("Invalid user ID format."),
  query: z.string().min(1, "Search query is required."),
});

const getHistoryByUserIdSchema = z.object({
  userId: z.string().uuid("Invalid user ID format."),
});

export const handleAddSearchHistory = async (req: Request, res: Response) => {
  const validation = addSearchQuerySchema.safeParse(req.body);
  if (!validation.success)
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });

  try {
    const newHistoryEntry = await addSearchQuery(validation.data);

    return res.status(201).json({ success: true, data: newHistoryEntry });
  } catch (error) {
    logger.error(error, "Error adding search history.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const handleGetHistoryByUserId = async (req: Request, res: Response) => {
  const validation = getHistoryByUserIdSchema.safeParse(req.params);
  if (!validation.success) {
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });
  }

  try {
    const entries = await getUserSearchHistory(validation.data.userId);

    if (!entries.length) {
      return res
        .status(404)
        .json({ success: false, message: "No history entry." });
    }

    return res.json({ success: true, data: entries });
  } catch (error) {
    logger.error(error, "Error fetching user's search history.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
