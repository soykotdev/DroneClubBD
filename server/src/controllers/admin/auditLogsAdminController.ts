import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { listRecentAuditLogs } from "../../repositories/auditLogsRepository.js";

// Super Admin only — see routes/admin/auditLogs.ts for the role gate.
export async function listAuditLogsAdmin(req: Request, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  sendSuccess(res, await listRecentAuditLogs(limit));
}
