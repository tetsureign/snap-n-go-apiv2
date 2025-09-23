import { describe, expect, test, vi } from "vitest";
import { faker } from "@faker-js/faker";

import { prisma } from "prisma/__mocks__/client";

import historyService from "@/services/historyService";

describe("historyService", () => {});

vi.mock("prisma/client");

test("addSearchQueryHistory should return the added query", async () => {
  const newQuery = { userId: "123", searchQuery: "test query" };
  prisma.searchHistory.add.mockResolvedValue({
    ...newQuery,
    id: "1",
    createdAt: new Date(),
    deletedAt: null,
  });

  const query = await historyService.addSearchQueryHistory({
    userId: newQuery.userId,
    query: newQuery.searchQuery,
  });

  expect(query).toMatchObject({
    ...newQuery,
    id: "1",
    createdAt: new Date(),
    deletedAt: null,
  });
});
