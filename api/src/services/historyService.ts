import { NotFoundError } from "@/errors/appError";
import historyRepository from "@/repositories/historyRepository";

async function addSearchQueryHistory({
  userId,
  query,
}: {
  userId: string;
  query: string;
}) {
  return historyRepository.add({ userId, searchQuery: query });
}

async function getUserQueryHistoryLazy(
  userId: string,
  limit: number,
  cursor?: string
) {
  return historyRepository.findUserHistory(userId, limit, cursor);
}

async function softDelQueryHistory(userId: string, ids: string[]) {
  const deletedCount = await historyRepository.softDeleteUserScoped(userId, ids);

  if (!deletedCount) {
    throw new NotFoundError("History entries not found or already deleted.");
  }

  return deletedCount;
}

const historyService = {
  addSearchQueryHistory,
  getUserQueryHistoryLazy,
  softDelQueryHistory,
};

export default historyService;
