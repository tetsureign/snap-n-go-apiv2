import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchHistory } from '../generated/client/client';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async addSearchQueryHistory(
    userId: string,
    query: string,
  ): Promise<SearchHistory> {
    return this.prisma.searchHistory.create({
      data: {
        userId,
        searchQuery: query,
      },
    });
  }

  async getUserQueryHistoryLazy(
    userId: string,
    limit: number,
    cursor?: string,
  ): Promise<SearchHistory[]> {
    if (cursor) {
      const cursorItem = await this.prisma.searchHistory.findUnique({
        where: { id: cursor },
      });
      if (!cursorItem) return [];

      return this.prisma.searchHistory.findMany({
        where: {
          userId,
          deletedAt: null,
          createdAt: { lt: cursorItem.createdAt },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    }

    return this.prisma.searchHistory.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async softDelQueryHistory(userId: string, ids: string[]): Promise<number> {
    const result = await this.prisma.searchHistory.updateMany({
      where: {
        id: { in: ids },
        userId,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    return result.count;
  }
}
