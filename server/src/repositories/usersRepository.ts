import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { UserDoc } from "../types/models.js";

function collection(): Collection<UserDoc> {
  return getDb().collection<UserDoc>("users");
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  return collection().findOne({ email: email.toLowerCase(), isDeleted: false });
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  return collection().findOne({ _id: new ObjectId(id), isDeleted: false });
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserDoc["role"];
  mustChangePassword?: boolean;
}): Promise<UserDoc> {
  const now = new Date();
  const doc: UserDoc = {
    _id: new ObjectId(),
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    role: input.role,
    mustChangePassword: input.mustChangePassword ?? true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    status: "active",
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
    deletedAt: null,
  };
  await collection().insertOne(doc);
  return doc;
}

export async function recordSuccessfulLogin(userId: ObjectId): Promise<void> {
  await collection().updateOne(
    { _id: userId },
    { $set: { lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null } }
  );
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/** Progressive lockout after repeated failed attempts, per spec Section 14. */
export async function recordFailedLogin(userId: ObjectId): Promise<void> {
  const user = await collection().findOne({ _id: userId });
  const attempts = (user?.failedLoginAttempts ?? 0) + 1;
  const update: Partial<UserDoc> = { failedLoginAttempts: attempts };
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    update.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
  }
  await collection().updateOne({ _id: userId }, { $set: update });
}

export async function updatePassword(userId: ObjectId, passwordHash: string): Promise<void> {
  await collection().updateOne(
    { _id: userId },
    { $set: { passwordHash, mustChangePassword: false, updatedAt: new Date() } }
  );
}

export async function countUsers(): Promise<number> {
  return collection().countDocuments({ isDeleted: false });
}
