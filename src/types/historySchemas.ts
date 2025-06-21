import { z } from "zod/v4";

export const addMySearchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required."),
});

export const getMyHistoryLazySchema = z.object({
  limit: z.coerce.number().min(1).max(100),
  cursor: z.uuid().optional(),
});

export const delMyQuerySchema = z.object({
  ids: z.array(z.uuid()).min(1, "At least one ID is required."),
});
