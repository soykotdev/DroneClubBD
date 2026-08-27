import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { RefreshTokenDoc } from "../types/models.js";

function collection(): Collection<RefreshTokenDoc> {
  return getDb().collection<RefreshTokenDoc>("refreshTokens");
}

export async function storeRefreshToken(input: {
  userId: ObjectId;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}): Promise<void> {
  await collection().insertOne({
    _id: new ObjectId(),
    userId: input.userId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    createdAt: new Date(),
    revokedAt: null,
    replacedByTokenHash: null,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
  });
}

/** Returns the active (non-revoked, non-expired) token record for a hash. */
export async function findActiveRefreshToken(tokenHash: string): Promise<RefreshTokenDoc | null> {
  return collection().findOne({ tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } });
}

/** Rotation: revoke the presented token and mark what replaced it. */
export async function rotateRefreshToken(oldTokenHash: string, newTokenHash: string): Promise<void> {
  await collection().updateOne(
    { tokenHash: oldTokenHash },
    { $set: { revokedAt: new Date(), replacedByTokenHash: newTokenHash } }
  );
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  await collection().updateOne({ tokenHash }, { $set: { revokedAt: new Date() } });
}

/** Revoke every session for a user (e.g. on password change). */
export async function revokeAllUserTokens(userId: ObjectId): Promise<void> {
  await collection().updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

/**
 * Reuse detection: if a token hash is presented that was already rotated
 * away, the refresh token has been stolen and replayed. The caller should
 * revoke the entire token family (all tokens for that user).
 */
export async function isTokenReuse(tokenHash: string): Promise<RefreshTokenDoc | null> {
  return collection().findOne({ tokenHash, revokedAt: { $ne: null } });
}
