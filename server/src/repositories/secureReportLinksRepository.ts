import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { SecureReportLinkDoc } from "../types/models.js";

function collection(): Collection<SecureReportLinkDoc> {
  return getDb().collection<SecureReportLinkDoc>("secureReportLinks");
}

export async function createSecureReportLink(input: {
  projectId: ObjectId;
  title: string;
  fileUrl: string;
  tokenHash: string;
  expiresAt: Date;
  maxDownloads?: number;
  createdBy: ObjectId;
}): Promise<SecureReportLinkDoc> {
  const doc: SecureReportLinkDoc = {
    _id: new ObjectId(),
    projectId: input.projectId,
    title: input.title,
    fileUrl: input.fileUrl,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    maxDownloads: input.maxDownloads,
    downloadCount: 0,
    revoked: false,
    createdAt: new Date(),
    createdBy: input.createdBy,
  };
  await collection().insertOne(doc);
  return doc;
}

/**
 * Looks up a report purely by the hash of the presented token — the raw
 * token itself is never stored, so a database compromise alone cannot yield
 * a usable share link.
 */
export async function findValidReportLinkByTokenHash(tokenHash: string): Promise<SecureReportLinkDoc | null> {
  const link = await collection().findOne({ tokenHash });
  if (!link) return null;
  if (link.revoked) return null;
  if (link.expiresAt.getTime() < Date.now()) return null;
  if (link.maxDownloads !== undefined && link.downloadCount >= link.maxDownloads) return null;
  return link;
}

export async function incrementDownloadCount(id: ObjectId): Promise<void> {
  await collection().updateOne({ _id: id }, { $inc: { downloadCount: 1 } });
}

export async function revokeReportLink(id: string): Promise<void> {
  await collection().updateOne({ _id: new ObjectId(id) }, { $set: { revoked: true } });
}

export async function listReportLinksForProject(projectId: string): Promise<SecureReportLinkDoc[]> {
  return collection().find({ projectId: new ObjectId(projectId) }).sort({ createdAt: -1 }).toArray();
}

export async function countActiveReportLinks(): Promise<number> {
  return collection().countDocuments({ revoked: false, expiresAt: { $gt: new Date() } });
}
