import knex from "db";
import { v4 as uuidv4 } from "uuid";

export interface SearchHistory {
  id: string;
  user_id: string;
  search_query: string;
  created_at?: Date;
  deleted_at?: Date;
}

type AddQueryType = {
  userId: string;
  query: string;
};

export async function addSearchQuery({
  userId,
  query,
}: AddQueryType): Promise<SearchHistory> {
  const queryId = uuidv4();

  await knex.raw(
    `INSERT INTO search_history (id, user_id, search_query, created_at) VALUES (?, ?, ?, NOW())`,
    [queryId, userId, query]
  );

  return { id: queryId, user_id: userId, search_query: query };
}

export async function getUserSearchHistory(
  userId: string
): Promise<SearchHistory[]> {
  const result = await knex.raw<SearchHistory[][]>(
    `SELECT * FROM search_history WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  return result[0] || [];
}
