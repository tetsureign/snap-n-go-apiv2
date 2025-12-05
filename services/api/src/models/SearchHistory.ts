import { restore } from "@/libs/softDelete";
import prisma from "prisma/client";
import { z } from "zod";

export const historySchema = z.object({
  id: z.string(),
  userId: z.string(),
  searchQuery: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type historyDTO = z.infer<typeof historySchema>;

export default class SearchHistory {
  id!: string;
  userId!: string;
  searchQuery!: string;
  createdAt?: Date;
  deletedAt?: Date | null;

  constructor(data: {
    id: string;
    userId: string;
    searchQuery: string;
    createdAt?: Date;
    deletedAt?: Date | null;
  }) {
    Object.assign(this, data);
  }

  static async add(query: {
    userId: string;
    searchQuery: string;
  }): Promise<SearchHistory> {
    const created = await prisma.searchHistory.create({
      data: {
        id: crypto.randomUUID(),
        userId: query.userId,
        searchQuery: query.searchQuery,
      },
    });

    return new SearchHistory(created);
  }

  static async getUserHistory(
    userId: string,
    limit: number,
    cursor?: string
  ): Promise<SearchHistory[]> {
    if (cursor) {
      const cursorItem = await prisma.searchHistory.findUnique({
        where: { id: cursor },
      });
      if (!cursorItem) return [];

      return (
        await prisma.searchHistory.findMany({
          where: {
            userId,
            deletedAt: null,
            createdAt: { lt: cursorItem.createdAt },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        })
      ).map((item) => new SearchHistory(item));
    }

    return (
      await prisma.searchHistory.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: limit,
      })
    ).map((item) => new SearchHistory(item));
  }

  static async softDeleteUserScoped(
    userId: string,
    ids: string[]
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

  async restore(id: string) {
    return restore(prisma.searchHistory, { id });
  }
}
