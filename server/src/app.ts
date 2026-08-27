import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import path from "node:path";
import { env, corsAllowedOrigins, isProduction } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { generalApiRateLimit } from "./middleware/rateLimit.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { publicRouter } from "./routes/public.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin/index.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors({ origin: corsAllowedOrigins, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(pinoHttp({ logger, redact: ["req.headers.authorization", "req.headers.cookie"] }));
  app.use(generalApiRateLimit);

  // Admin routes must never be indexed — see also robots.txt in the client.
  app.use("/api/admin", (_req, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });

  // Publicly served uploads (non-sensitive assets only — e.g. equipment
  // images uploaded through the media library). Private report files are
  // NEVER served from here; they go through the signed /api/public/reports
  // endpoint instead.
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIRECTORY)));

  app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

  app.use("/api/public", publicRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
