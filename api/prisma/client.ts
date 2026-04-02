import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/config/env";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const adapter = new PrismaMariaDb({
  host: env.dbHost,
  port: env.dbPort,
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  log: env.nodeEnv === "development" ? ["query", "error", "warn"] : ["error"],
  adapter: adapter,
});

export default prisma;
