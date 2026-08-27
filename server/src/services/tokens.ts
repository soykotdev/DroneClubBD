import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { env } from "../config/env.js";
import type { UserRole } from "@droneclub/shared";

export interface AccessTokenPayload {
  sub: string; // user id
  role: UserRole;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/**
 * Refresh tokens are opaque random strings, never JWTs. Only their SHA-256
 * hash is ever stored in MongoDB (see refreshTokens collection), so a
 * database read alone can never yield a usable token — matching the same
 * "store only the hash" rule used for secure report links.
 */
export function generateRefreshToken(): { token: string; tokenHash: string } {
  const token = randomBytes(48).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiryDate(): Date {
  const days = parseDurationDays(env.JWT_REFRESH_TTL);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function parseDurationDays(ttl: string): number {
  const match = /^(\d+)d$/.exec(ttl.trim());
  return match ? Number(match[1]) : 30;
}
