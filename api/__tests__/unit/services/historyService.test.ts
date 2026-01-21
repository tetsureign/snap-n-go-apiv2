import { describe, expect, test, vi } from "vitest";
import { faker } from "@faker-js/faker";

import { prisma } from "prisma/__mocks__/client";

import historyService from "@/services/historyService";

// Mock the prisma/client module that the models import
vi.mock("prisma/client", () => ({
  default: prisma,
}));

describe("historyService", () => {
  test("should add new search query history", async () => {
    // Arrange
    const mockData = {
      userId: faker.string.uuid(),
      query: faker.lorem.words(3),
    };

    const mockResponse = {
      id: faker.string.uuid(),
      userId: mockData.userId,
      searchQuery: mockData.query,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    prisma.searchHistory.create.mockResolvedValue(mockResponse);

    // Act
    const result = await historyService.addSearchQueryHistory(mockData);

    // Assert
    expect(result).toEqual(mockResponse);
    expect(prisma.searchHistory.create).toHaveBeenCalledWith({
      data: {
        id: expect.any(String),
        userId: mockData.userId,
        searchQuery: mockData.query,
      },
    });
  });

  test("should get paginated user query history", async () => {
    // Arrange
    const userId = faker.string.uuid();
    const limit = 10;
    const mockHistoryItems = Array.from({ length: limit }, () => ({
      id: faker.string.uuid(),
      userId,
      searchQuery: faker.lorem.words(3),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }));

    prisma.searchHistory.findMany.mockResolvedValue(mockHistoryItems);

    // Act
    const result = await historyService.getUserQueryHistoryLazy(userId, limit);

    // Assert
    expect(result).toEqual(mockHistoryItems);
    expect(prisma.searchHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          deletedAt: null,
        },
        take: limit,
      })
    );
  });

  test("should soft delete query history", async () => {
    // Arrange
    const userId = faker.string.uuid();
    const ids = [faker.string.uuid(), faker.string.uuid()];
    const mockDeletedAt = new Date();

    prisma.searchHistory.updateMany.mockResolvedValue({ count: ids.length });

    // Act
    const result = await historyService.softDelQueryHistory(userId, ids);

    // Assert
    expect(result).toEqual(ids.length);
    expect(prisma.searchHistory.updateMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ids,
        },
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: expect.any(Date),
      },
    });
  });
});
