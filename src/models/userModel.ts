import knex from "db";
import { ResultSetHeader } from "mysql2";
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
}: CreateUserType): Promise<User> {
  const userId = uuidv4(); // Only new users will have a new UUID

  await knex.raw(
    `INSERT INTO users (id, google_id, email, name, created_at) 
    VALUES (?, ?, ?, ?, NOW()) 
    ON DUPLICATE KEY UPDATE
      email = VALUES(email),
      name = VALUES(name),
      deleted_at = NULL`,
    [userId, googleId, email, name]
  );

  // Pretty sure this CAN'T be null after the insert
  return getUserByGoogleId(googleId) as Promise<User>;
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await knex.raw<User[][]>(
    `SELECT * FROM users WHERE id = ? 
    LIMIT 1`,
    [userId]
  );

  return result[0]?.[0] ?? null;
}

export async function getUserByGoogleId(
  googleId: string
): Promise<User | null> {
  const result = await knex.raw<User[][]>(
    `SELECT * FROM users WHERE google_id = ? 
    LIMIT 1`,
    [googleId]
  );

  return result[0]?.[0] ?? null;
}

export async function softDelUser(userId: string): Promise<boolean> {
  const result = await knex.raw<ResultSetHeader[]>(
    `UPDATE users 
    SET deleted_at = NOW() 
    WHERE id = ? 
    AND deleted_at IS NULL`,
    [userId]
  );

  return result[0]?.affectedRows > 0;
}
