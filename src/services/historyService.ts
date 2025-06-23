import { SearchHistory } from "@/models/SearchHistory";

export async function addSearchQueryHistory({
  userId,
  query,
}: {
  userId: string;
  query: string;
}) {
  return SearchHistory.add({ userId, searchQuery: query });
}

export async function getUserQueryHistoryLazy(
  userId: string,
  limit: number,
  cursor?: string
) {
  return SearchHistory.getUserHistory(userId, limit, cursor);
}

export async function softDelQueryHistory(userId: string, ids: string[]) {
  return SearchHistory.softDeleteUserScoped(userId, ids);
}
