/**
 * One-time initial administrator creation, per spec Section 25.
 *
 * Usage:
 *   npm run create-admin --workspace=server
 *
 * Reads ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD from server/.env — never pass a
 * real password on the command line (shell history) or hardcode one here.
 * The created account has mustChangePassword=true, so the temporary
 * password stops being valid the moment the admin logs in and changes it.
 */
import { env } from "../src/config/env.js";
import { connectToDatabase, closeDatabaseConnection } from "../src/database/mongoClient.js";
import { ensureIndexes } from "../src/database/indexes.js";
import { findUserByEmail, createUser } from "../src/repositories/usersRepository.js";
import { hashPassword } from "../src/services/password.js";
import { logger } from "../src/utils/logger.js";

async function main(): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_INITIAL_PASSWORD) {
    logger.error("ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD must be set in server/.env before running this script.");
    process.exit(1);
  }
  if (env.ADMIN_INITIAL_PASSWORD.length < 12) {
    logger.error("ADMIN_INITIAL_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }

  const db = await connectToDatabase();
  await ensureIndexes(db);

  const existing = await findUserByEmail(env.ADMIN_EMAIL);
  if (existing) {
    logger.info(`An account already exists for ${env.ADMIN_EMAIL} — nothing to do.`);
    await closeDatabaseConnection();
    return;
  }

  const passwordHash = await hashPassword(env.ADMIN_INITIAL_PASSWORD);
  await createUser({ name: "Super Admin", email: env.ADMIN_EMAIL, passwordHash, role: "super-admin", mustChangePassword: true });

  logger.info(`Initial Super Admin account created for ${env.ADMIN_EMAIL}. They must change the temporary password on first login.`);
  await closeDatabaseConnection();
}

main().catch(async (err) => {
  logger.error({ err }, "Failed to create initial admin");
  await closeDatabaseConnection();
  process.exit(1);
});
