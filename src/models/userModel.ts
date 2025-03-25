import knex from "db";
import { v4 as uuidv4 } from "uuid";

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  created_at?: Date;
  deleted_at?: Date;
}

type CreateUserType = {
  googleId: string;
  email: string;
  name: string;
};

export async function createUser({
  googleId,
  email,
  name,
}: CreateUserType): Promise<User | null> {
  const userIdQuery = await knex.raw<{ id: string }[][]>(
    `SELECT id FROM users WHERE google_id = ?`,
    [googleId]
  );

  // If the query returns an empty array -> user doesn't exist

  if (!userIdQuery[0]?.[0]) {
    const userId = uuidv4();
    await knex.raw(
      `INSERT INTO users (id, google_id, email, name, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [userId, googleId, email, name]
    );
    return { id: userId, google_id: googleId, email, name };
  }

  return null;
}

export async function getUserByGoogleId(
  googleId: string
): Promise<User | null> {
  const result = await knex.raw<User[][]>(
    `SELECT * FROM users WHERE google_id = ? LIMIT 1`,
    [googleId]
  );

  return result[0]?.[0] ?? null;
}

export async function softDelUser(userId: string): Promise<void> {
  await knex.raw(`UPDATE users SET deleted_at = NOW() WHERE id = ?`, [userId]);
}
