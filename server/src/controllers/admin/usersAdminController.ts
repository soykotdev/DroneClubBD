import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { createUserSchema } from "@droneclub/shared";
import { randomBytes } from "node:crypto";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { createUser, findUserByEmail } from "../../repositories/usersRepository.js";
import { hashPassword } from "../../services/password.js";
import { recordAuditLog } from "../../repositories/auditLogsRepository.js";
import { getDb } from "../../database/mongoClient.js";

// Super Admin only — see routes/admin/users.ts for the role gate.
export async function listUsersAdmin(_req: Request, res: Response): Promise<void> {
  const users = await getDb()
    .collection("users")
    .find({ isDeleted: false }, { projection: { passwordHash: 0 } })
    .toArray();
  sendSuccess(res, users);
}

export async function createUserAdmin(req: Request, res: Response): Promise<void> {
  const input = createUserSchema.parse(req.body);
  const existing = await findUserByEmail(input.email);
  if (existing) throw AppError.conflict("A user with this email already exists");

  // Temporary password — communicated out of band by the Super Admin, never
  // returned in this response or logged. The new user must change it before
  // doing anything else (mustChangePassword: true).
  const temporaryPassword = randomBytes(12).toString("base64url");
  const passwordHash = await hashPassword(temporaryPassword);
  const created = await createUser({ ...input, passwordHash, mustChangePassword: true });

  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "user.created", entity: "user", entityId: created._id.toString(), ipAddress: req.ip });

  sendSuccess(res, { id: created._id.toString(), name: created.name, email: created.email, role: created.role, temporaryPassword }, undefined, 201);
}
