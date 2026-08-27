import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { secureReportLinkSchema } from "@droneclub/shared";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { createSecureReportLink, listReportLinksForProject, revokeReportLink } from "../../repositories/secureReportLinksRepository.js";
import { findProjectById } from "../../repositories/projectsRepository.js";
import { generateReportShareToken } from "../../services/reportTokens.js";
import { recordAuditLog } from "../../repositories/auditLogsRepository.js";
import { env } from "../../config/env.js";

export async function createReportLink(req: Request, res: Response): Promise<void> {
  const input = secureReportLinkSchema.parse(req.body);
  const project = await findProjectById(input.projectId);
  if (!project) throw AppError.notFound("Project not found");

  const { token, tokenHash } = generateReportShareToken();
  const link = await createSecureReportLink({
    projectId: project._id,
    title: input.title,
    fileUrl: input.fileUrl,
    tokenHash,
    expiresAt: new Date(input.expiresAt),
    maxDownloads: input.maxDownloads,
    createdBy: new ObjectId(req.user!.id),
  });

  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "report.shared", entity: "secureReportLink", entityId: link._id.toString(), ipAddress: req.ip });

  // The raw token is returned exactly once — it is never persisted or logged.
  sendSuccess(
    res,
    { id: link._id.toString(), shareUrl: `${env.CLIENT_URL}/report/${token}`, expiresAt: link.expiresAt },
    undefined,
    201
  );
}

export async function listReportLinksForProjectAdmin(req: Request, res: Response): Promise<void> {
  const links = await listReportLinksForProject(req.params.projectId as string);
  sendSuccess(
    res,
    links.map((l) => ({ id: l._id.toString(), title: l.title, expiresAt: l.expiresAt, revoked: l.revoked, downloadCount: l.downloadCount, maxDownloads: l.maxDownloads }))
  );
}

export async function revokeReportLinkAdmin(req: Request, res: Response): Promise<void> {
  await revokeReportLink(req.params.id as string);
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "report.revoked", entity: "secureReportLink", entityId: req.params.id, ipAddress: req.ip });
  sendSuccess(res, { revoked: true });
}
