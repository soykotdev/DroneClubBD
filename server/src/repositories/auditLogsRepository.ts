import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { AuditLogDoc } from "../types/models.js";

function collection(): Collection<AuditLogDoc> {
  return getDb().collection<AuditLogDoc>("auditLogs");
}

export async function recordAuditLog(input: {
  userId?: ObjectId | null;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  await collection().insertOne({
    _id: new ObjectId(),
    userId: input.userId ?? null,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    metadata: input.metadata,
    ipAddress: input.ipAddress,
    createdAt: new Date(),
  });
}

export async function listRecentAuditLogs(limit = 50): Promise<AuditLogDoc[]> {
  return collection().find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}
