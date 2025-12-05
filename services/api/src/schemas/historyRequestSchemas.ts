import { z } from "zod/v4";

const addMySearchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required."),
});

const getMyHistoryLazySchema = z.object({
  limit: z.coerce.number().min(1).max(100),
  cursor: z.uuid().optional(),
});

const delMyQuerySchema = z.object({
  ids: z.array(z.uuid()).min(1, "At least one ID is required."),
});

const historyRequestSchemas = {
  addMySearchQuerySchema,
  getMyHistoryLazySchema,
  delMyQuerySchema,
};

export default historyRequestSchemas;
