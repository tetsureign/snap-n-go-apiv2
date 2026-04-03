import "dotenv/config";

import { createApp } from "@/app";
import { env } from "@/config/env";

export async function startServer() {
  const app = await createApp();

  try {
    await app.listen({ port: env.port, host: "0.0.0.0" });
    app.log.info(`Server started at http://localhost:${env.port}`);
    app.log.info(
      `Access Swagger UI on Development at http://localhost:${env.port}${env.routePrefix}/docs`,
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
