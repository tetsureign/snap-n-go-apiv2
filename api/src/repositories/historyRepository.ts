import { SearchHistory } from "@/generated/prisma/client";

import prisma from "$/prisma/client";

async function add(query: {
  userId: string;
  searchQuery: string;
}): Promise<SearchHistory> {
  return prisma.searchHistory.create({
    data: {
      id: crypto.randomUUID(),
      userId: query.userId,
      searchQuery: query.searchQuery,
    },
  });
}

async function findUserHistory(
  userId: string,
  limit: number,
  cursor?: string,
): Promise<SearchHistory[]> {
  if (cursor) {
    const cursorItem = await prisma.searchHistory.findUnique({
      where: { id: cursor },
    });

    if (!cursorItem) {
      return [];
    }

    return prisma.searchHistory.findMany({
      where: {
        userId,
        deletedAt: null,
        createdAt: { lt: cursorItem.createdAt },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  return prisma.searchHistory.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

async function softDeleteUserScoped(
  userId: string,
  ids: string[],
): Promise<number> {
  const result = await prisma.searchHistory.updateMany({
    where: {
      id: { in: ids },
      userId,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });

  return result.count;
}

const historyRepository = {
  add,
  findUserHistory,
  softDeleteUserScoped,
};

export default historyRepository;
