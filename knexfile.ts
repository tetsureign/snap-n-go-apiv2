import type { Knex } from "knex";
import "dotenv/config";

// Update with your config settings.

const config: Knex.Config = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./migrations",
  },
};

export default config;
