import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/**
 * Validates req.body against a Zod schema and replaces it with the parsed
 * (trimmed/coerced) result. Frontend validation is UX only — this is the
 * actual authority, per spec Section 12: "Never trust frontend validation alone."
 */
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}

export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.query = schema.parse(req.query);
    next();
  };
}
