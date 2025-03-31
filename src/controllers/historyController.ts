import { Response } from "express";
import z from "zod";

import {
  addSearchQuery,
  getUserSearchHistory,
} from "@/models/searchHistoryModel";
import { AuthenticatedRequest } from "@/types";

import logger from "@/utils/logger";

const addMySearchQueryReqBodySchema = z.object({
  query: z.string().min(1, "Search query is required."),
});

export const handleAddMySearchHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const validation = addMySearchQueryReqBodySchema.safeParse(req.body);
  if (!validation.success)
    return res
      .status(400)
      .json({ success: false, errors: validation.error.errors });

  try {
    const newHistoryEntry = await addSearchQuery({
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

// TODO: Add pagination
export const handleGetMyHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const entries = await getUserSearchHistory(req.user!.userId);

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
