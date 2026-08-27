import type { Request, Response } from "express";
import { loginSchema, changePasswordSchema } from "@droneclub/shared";
import { findUserByEmail, findUserById, recordFailedLogin, recordSuccessfulLogin, updatePassword } from "../repositories/usersRepository.js";
import { storeRefreshToken, findActiveRefreshToken, rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens, isTokenReuse } from "../repositories/refreshTokensRepository.js";
import { recordAuditLog } from "../repositories/auditLogsRepository.js";
import { hashPassword, verifyPassword } from "../services/password.js";
import { signAccessToken, generateRefreshToken, refreshTokenExpiryDate, hashToken } from "../services/tokens.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { isProduction } from "../config/env.js";

const REFRESH_COOKIE_NAME = "dcb_refresh";

function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    // "strict" works in dev because localhost:5173 and localhost:4000 are
    // same-site (same host, different port). In production the client
    // (Vercel) and API (a separate host, e.g. Render) are genuinely
    // different sites, so a Strict cookie would never be sent on the
    // fetch from the client to /api/auth/refresh — login would appear to
    // work once, then silently fail to persist. "None" (paired with
    // Secure, already true in production) is required for that cross-site
    // request to carry the cookie at all.
    sameSite: isProduction ? "none" : "strict",
    expires: expiresAt,
    path: "/api/auth",
  });
}

function clearRefreshCookie(res: Response): void {
  // Must match the attributes it was set with (secure/sameSite), or some
  // browsers won't recognize this as the same cookie to overwrite.
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth", secure: isProduction, sameSite: isProduction ? "none" : "strict" });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);
  const user = await findUserByEmail(email);

  // Constant-shape response regardless of whether the email exists, to avoid
  // user enumeration — always run verifyPassword against *some* hash.
  const passwordValid = user ? await verifyPassword(user.passwordHash, password) : await verifyPassword("$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", password);

  if (!user || user.status === "disabled") {
    throw AppError.unauthorized("Invalid email or password");
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    throw new AppError("Account temporarily locked due to repeated failed attempts. Try again later.", 423, "ACCOUNT_LOCKED");
  }

  if (!passwordValid) {
    await recordFailedLogin(user._id);
    await recordAuditLog({ userId: user._id, action: "login.failed", entity: "user", entityId: user._id.toString(), ipAddress: req.ip });
    throw AppError.unauthorized("Invalid email or password");
  }

  await recordSuccessfulLogin(user._id);

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, email: user.email });
  const { token: refreshToken, tokenHash } = generateRefreshToken();
  const expiresAt = refreshTokenExpiryDate();
  await storeRefreshToken({ userId: user._id, tokenHash, expiresAt, userAgent: req.headers["user-agent"], ipAddress: req.ip });
  setRefreshCookie(res, refreshToken, expiresAt);

  await recordAuditLog({ userId: user._id, action: "login.success", entity: "user", entityId: user._id.toString(), ipAddress: req.ip });

  sendSuccess(res, {
    accessToken,
    mustChangePassword: user.mustChangePassword,
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const presentedToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!presentedToken) throw AppError.unauthorized("No active session");

  const presentedHash = hashToken(presentedToken);

  const reused = await isTokenReuse(presentedHash);
  if (reused) {
    // A previously-rotated-away token was replayed — likely theft. Burn the
    // whole session family for this user and force re-authentication.
    await revokeAllUserTokens(reused.userId);
    clearRefreshCookie(res);
    throw AppError.unauthorized("Session invalidated for security reasons. Please sign in again.");
  }

  const record = await findActiveRefreshToken(presentedHash);
  if (!record) {
    clearRefreshCookie(res);
    throw AppError.unauthorized("Session expired. Please sign in again.");
  }

  const user = await findUserById(record.userId.toString());
  if (!user || user.status === "disabled") {
    clearRefreshCookie(res);
    throw AppError.unauthorized("Session expired. Please sign in again.");
  }

  // Rotate: issue a new refresh token and revoke the presented one.
  const { token: newToken, tokenHash: newHash } = generateRefreshToken();
  const expiresAt = refreshTokenExpiryDate();
  await rotateRefreshToken(presentedHash, newHash);
  await storeRefreshToken({ userId: user._id, tokenHash: newHash, expiresAt, userAgent: req.headers["user-agent"], ipAddress: req.ip });
  setRefreshCookie(res, newToken, expiresAt);

  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, email: user.email });
  sendSuccess(res, { accessToken });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const presentedToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (presentedToken) {
    await revokeRefreshToken(hashToken(presentedToken));
  }
  clearRefreshCookie(res);
  sendSuccess(res, { loggedOut: true });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await findUserById(req.user!.id);
  if (!user) throw AppError.unauthorized();
  sendSuccess(res, { id: user._id.toString(), name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const user = await findUserById(req.user!.id);
  if (!user) throw AppError.unauthorized();

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) throw AppError.unauthorized("Current password is incorrect");

  const newHash = await hashPassword(newPassword);
  await updatePassword(user._id, newHash);
  await revokeAllUserTokens(user._id); // force re-login on every other device
  await recordAuditLog({ userId: user._id, action: "password.changed", entity: "user", entityId: user._id.toString(), ipAddress: req.ip });

  clearRefreshCookie(res);
  sendSuccess(res, { changed: true });
}
