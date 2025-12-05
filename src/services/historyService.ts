import SearchHistory from "@/models/SearchHistory";

async function addSearchQueryHistory({
  userId,
  query,
}: {
  userId: string;
  query: string;
}) {
  return SearchHistory.add({ userId, searchQuery: query });
}

async function getUserQueryHistoryLazy(
  userId: string,
  limit: number,
  cursor?: string
) {
  return SearchHistory.getUserHistory(userId, limit, cursor);
}

async function softDelQueryHistory(userId: string, ids: string[]) {
  return SearchHistory.softDeleteUserScoped(userId, ids);
}

const historyService = {
  addSearchQueryHistory,
  getUserQueryHistoryLazy,
  softDelQueryHistory,
};

export default historyService;
