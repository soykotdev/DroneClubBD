import type { Request, Response } from "express";
import type { Db } from "mongodb";
import { createApp } from "../dist/src/app.js";
import { connectToDatabase } from "../dist/src/database/mongoClient.js";
import { ensureIndexes } from "../dist/src/database/indexes.js";
import { logger } from "../dist/src/utils/logger.js";

/**
 * Vercel serverless entry point. Imports the *compiled* app (not the TS
 * source) so this function's dependency trace is plain JS — the build
 * command (see vercel.json) runs `npm run build:shared && npm run build`
 * first, exactly like a normal production build.
 *
 * A normal `npm run start` calls connectToDatabase() once before
 * app.listen(). There is no equivalent single startup moment here — each
 * cold-started instance needs to connect on its own first request. This
 * memoizes that so a warm instance never reconnects, and concurrent
 * requests during a cold start all await the same in-flight connection
 * instead of racing to open several.
 */
const app = createApp();
let ready: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!ready) {
    ready = connectToDatabase()
      .then((db: Db) => ensureIndexes(db))
      .catch((err: unknown) => {
        ready = null; // let the next invocation retry instead of staying permanently broken
        throw err;
      });
  }
  // Non-null: the branch above always assigns it when it was null.
  return ready!;
}

// Vercel's Node runtime invokes this with plain Node http objects — Express
// itself only ever reads/augments them positionally, so the Request/Response
// types here just describe what `app()` expects, not what Vercel guarantees.
export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    await ensureReady();
  } catch (err) {
    logger.error({ err }, "Database not ready — failing request");
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: { message: "Service temporarily unavailable", code: "DB_UNAVAILABLE" } }));
    return;
  }
  app(req, res);
}
