import type { Response } from "express";
import type { PaginationMeta } from "@droneclub/shared";

export function sendSuccess<T>(res: Response, data: T, meta?: PaginationMeta, status = 200): void {
  res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function buildPaginationMeta(page: number, pageSize: number, total: number): PaginationMeta {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
