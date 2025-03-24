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
  try {
    const validatedData = addSearchQuerySchema.parse(req.body);

    const newHistoryEntry = await addSearchQuery(validatedData);
    return res.status(201).json({ success: true, data: newHistoryEntry });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ success: false, errors: error.errors });

    logger.error({ err: error }, "Error adding search history.");

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const handleGetHistoryByUserId = async (req: Request, res: Response) => {
  try {
    const validatedData = getHistoryByUserIdSchema.parse(req.params);
    const { userId } = validatedData;

    const entries = await getUserSearchHistory(userId);

    if (!entries.length) {
      return res
        .status(404)
        .json({ success: false, message: "No history entry." });
    }

    return res.json({ success: true, data: entries });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ success: false, errors: error.errors });

    logger.error({ err: error }, "Error fetching user's search history.");

    return res.status(500).json({ success: false, message: error });
  }
};
