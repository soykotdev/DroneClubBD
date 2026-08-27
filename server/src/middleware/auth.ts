import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@droneclub/shared";
import { verifyAccessToken } from "../services/tokens.js";
import { AppError } from "../utils/AppError.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole; email: string };
    }
  }
}

/**
 * Reads the access token from the Authorization header (short-lived, held
 * in memory by the client — never localStorage per spec Section 14).
 * Refresh tokens travel separately as an HTTP-only cookie (see auth routes).
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    next(AppError.unauthorized());
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    next(AppError.unauthorized("Session expired or invalid. Please sign in again."));
  }
}

/**
 * Role-gate for a route. Authorization is enforced here, in the backend —
 * hiding a button in the admin UI is never sufficient on its own.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden());
      return;
    }
    next();
  };
}
