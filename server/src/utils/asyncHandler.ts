import type { NextFunction, Request, Response } from "express";

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Express 4 does not forward rejected promises to the error handler on its
// own — every async controller is wrapped with this so a thrown AppError or
// ZodError reaches middleware/errorHandler.ts instead of hanging the request.
export function asyncHandler(handler: Handler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
