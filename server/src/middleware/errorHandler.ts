import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { isProduction } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, error: { message: `Route not found: ${req.method} ${req.path}`, code: "NOT_FOUND" } });
}

// Central error handler — the only place that decides what an error looks
// like on the wire. Never leaks a stack trace in production. Express only
// recognizes this as an error-handling middleware because it declares all
// four parameters, so `_next` stays even though it's unused.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_root";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    res.status(422).json({ success: false, error: { message: "Validation failed", code: "VALIDATION_ERROR", fieldErrors } });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      error: { message: err.message, code: err.code, ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}) },
    });
    return;
  }

  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");

  res.status(500).json({
    success: false,
    error: {
      message: isProduction ? "An unexpected error occurred" : (err as Error)?.message ?? "Unknown error",
      code: "INTERNAL_ERROR",
    },
  });
}
