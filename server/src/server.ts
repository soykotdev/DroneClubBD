import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase, closeDatabaseConnection } from "./database/mongoClient.js";
import { ensureIndexes } from "./database/indexes.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  const db = await connectToDatabase();
  await ensureIndexes(db);

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    // Never log env values here — only the fact that startup succeeded.
    logger.info(`Drone Club Bangladesh API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await closeDatabaseConnection();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error({ err }, "Fatal error during server startup");
  process.exit(1);
});
