import { SearchHistory } from "@/generated/prisma/client";
import { z } from "zod";

export const historySchema = z.object({
  id: z.string(),
  userId: z.string(),
  searchQuery: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type HistoryDTO = z.infer<typeof historySchema>;

export function toHistoryDTO(history: SearchHistory): HistoryDTO {
  return {
    id: history.id,
    userId: history.userId,
    searchQuery: history.searchQuery,
    createdAt: history.createdAt.toISOString(),
    deletedAt: history.deletedAt ? history.deletedAt.toISOString() : null,
  };
}

export function toHistoryDTOList(historyEntries: SearchHistory[]): HistoryDTO[] {
  return historyEntries.map(toHistoryDTO);
}
