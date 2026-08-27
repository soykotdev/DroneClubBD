import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { sendSuccess } from "../../utils/apiResponse.js";
import { getSiteSettings, updateSiteSettings } from "../../repositories/siteSettingsRepository.js";
import { recordAuditLog } from "../../repositories/auditLogsRepository.js";

export async function getSettingsAdmin(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await getSiteSettings());
}

export async function updateSettingsAdmin(req: Request, res: Response): Promise<void> {
  const updated = await updateSiteSettings(req.body, new ObjectId(req.user!.id));
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "settings.updated", entity: "siteSettings", ipAddress: req.ip });
  sendSuccess(res, updated);
}
