import knex from "db";
import { ResultSetHeader } from "mysql2";
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

export async function addSearchQueryHistory({
  userId,
  query,
}: AddQueryType): Promise<SearchHistory> {
  const queryId = uuidv4();

  await knex.raw(
    `INSERT INTO search_history (id, user_id, search_query, created_at) 
    VALUES (?, ?, ?, NOW())`,
    [queryId, userId, query]
  );

  return { id: queryId, user_id: userId, search_query: query };
}

export async function getUserQueryHistoryLazy(
  userId: string,
  limit: number,
  cursor?: string
): Promise<SearchHistory[]> {
  if (!cursor) {
    const result = await knex.raw<SearchHistory[][]>(
      `SELECT * FROM search_history 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?`,
      [userId, limit]
    );

    return result[0] || [];
  } else {
    const result = await knex.raw<SearchHistory[][]>(
      `SELECT * FROM search_history 
    WHERE user_id = ? AND id < ?
    ORDER BY created_at DESC 
    LIMIT ?`,
      [cursor, limit]
    );

    return result[0] || [];
  }
}

export async function softDelQueryHistory(
  userId: string,
  ids: string[]
): Promise<number> {
  const result = await knex.raw<ResultSetHeader[]>(
    `UPDATE search_history 
    SET deleted_at = NOW() 
    WHERE id IN (?)
    AND user_id = ? 
    AND deleted_at IS NULL`,
    [ids, userId]
  );

  return result[0]?.affectedRows;
}
