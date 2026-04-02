import "dotenv/config";

import { createApp } from "@/app";

export async function startServer() {
  const app = await createApp();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  try {
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Server started at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
