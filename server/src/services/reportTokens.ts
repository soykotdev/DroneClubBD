import { randomBytes } from "node:crypto";
import { hashToken } from "./tokens.js";

/**
 * Secure report sharing tokens. Per spec Section 13: "store only the token
 * hash" and "must never use predictable public URLs". The raw token is
 * returned to the admin exactly once (to build the shareable link) and is
 * never persisted or logged anywhere.
 */
export function generateReportShareToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}
