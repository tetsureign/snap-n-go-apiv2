import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
});
