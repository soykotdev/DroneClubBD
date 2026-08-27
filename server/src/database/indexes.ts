import { MongoServerError, type CreateIndexesOptions, type Db } from "mongodb";
import { logger } from "../utils/logger.js";

type IndexKey = Record<string, 1 | -1 | "text">;

/**
 * Creates one index, tolerating "an equivalent index already exists with
 * different options/name" conflicts (MongoDB error codes 85/86) by dropping
 * the stale index and recreating it to match this schema exactly. Without
 * this, a single leftover index from an earlier partial run, a shared
 * cluster, or a manual change in Atlas would abort the *entire* startup —
 * which is exactly what happened the first time this ran against a real
 * database (see PROGRESS.md).
 */
async function safeCreateIndex(
  db: Db,
  collection: string,
  key: IndexKey,
  options: CreateIndexesOptions = {}
): Promise<void> {
  try {
    await db.collection(collection).createIndex(key, options);
  } catch (err) {
    if (err instanceof MongoServerError && (err.code === 85 || err.code === 86)) {
      const indexName =
        options.name ??
        Object.entries(key)
          .map(([field, direction]) => `${field}_${direction}`)
          .join("_");
      logger.warn(
        { collection, indexName, code: err.code },
        "[mongo] conflicting index found — dropping and recreating to match the current schema"
      );
      await db
        .collection(collection)
        .dropIndex(indexName)
        .catch(() => undefined);
      await db.collection(collection).createIndex(key, options);
      return;
    }
    throw err;
  }
}

/**
 * Creates every index required by Section 15 of the platform spec.
 * Idempotent — safe to run on every server boot and from the seed script.
 * Runs sequentially (not Promise.all) so one collection's conflict doesn't
 * abort indexes on every other collection before they get a chance to run.
 */
export async function ensureIndexes(db: Db): Promise<void> {
  // --- users ---------------------------------------------------------
  await safeCreateIndex(db, "users", { email: 1 }, { unique: true });
  await safeCreateIndex(db, "users", { role: 1 });
  await safeCreateIndex(db, "users", { isDeleted: 1 });

  // --- refreshTokens ---------------------------------------------------
  await safeCreateIndex(db, "refreshTokens", { tokenHash: 1 }, { unique: true });
  await safeCreateIndex(db, "refreshTokens", { userId: 1 });
  await safeCreateIndex(db, "refreshTokens", { expiresAt: 1 }, { expireAfterSeconds: 0 });

  // --- siteSettings (singleton document) ------------------------------
  await safeCreateIndex(db, "siteSettings", { key: 1 }, { unique: true });

  // --- pages / pageSections --------------------------------------------
  await safeCreateIndex(db, "pages", { slug: 1 }, { unique: true });
  await safeCreateIndex(db, "pages", { status: 1 });
  await safeCreateIndex(db, "pageSections", { pageId: 1, displayOrder: 1 });

  // --- services --------------------------------------------------------
  await safeCreateIndex(db, "services", { slug: 1 }, { unique: true });
  await safeCreateIndex(db, "services", { category: 1 });
  await safeCreateIndex(db, "services", { status: 1 });
  await safeCreateIndex(db, "services", { title: "text", summary: "text", description: "text" });

  // --- equipment ---------------------------------------------------------
  await safeCreateIndex(db, "equipment", { slug: 1 }, { unique: true });
  await safeCreateIndex(db, "equipment", { category: 1 });
  await safeCreateIndex(db, "equipment", { status: 1 });

  // --- projects ------------------------------------------------------
  await safeCreateIndex(db, "projects", { slug: 1 }, { unique: true });
  await safeCreateIndex(db, "projects", { referenceNumber: 1 }, { unique: true });
  await safeCreateIndex(db, "projects", { category: 1 });
  await safeCreateIndex(db, "projects", { projectStatus: 1 });
  await safeCreateIndex(db, "projects", { status: 1 });
  await safeCreateIndex(db, "projects", { createdAt: -1 });

  // --- projectMedia / projectReports -----------------------------------
  await safeCreateIndex(db, "projectMedia", { projectId: 1 });
  await safeCreateIndex(db, "projectReports", { projectId: 1 });

  // --- inspectionRequests ------------------------------------------------
  await safeCreateIndex(db, "inspectionRequests", { referenceNumber: 1 }, { unique: true });
  await safeCreateIndex(db, "inspectionRequests", { status: 1 });
  await safeCreateIndex(db, "inspectionRequests", { service: 1 });
  await safeCreateIndex(db, "inspectionRequests", { createdAt: -1 });
  await safeCreateIndex(db, "inspectionRequests", { email: 1 });

  // --- leadNotes -------------------------------------------------------
  await safeCreateIndex(db, "leadNotes", { inspectionRequestId: 1, createdAt: -1 });

  // --- posts / categories ------------------------------------------------
  await safeCreateIndex(db, "posts", { slug: 1 }, { unique: true });
  await safeCreateIndex(db, "posts", { status: 1, publishedAt: -1 });
  await safeCreateIndex(db, "categories", { slug: 1 }, { unique: true });

  // --- teamMembers / testimonials / faqs --------------------------------
  await safeCreateIndex(db, "teamMembers", { displayOrder: 1 });
  await safeCreateIndex(db, "testimonials", { status: 1 });
  await safeCreateIndex(db, "faqs", { displayOrder: 1 });

  // --- mediaLibrary ------------------------------------------------------
  await safeCreateIndex(db, "mediaLibrary", { createdAt: -1 });
  await safeCreateIndex(db, "mediaLibrary", { relatedEntity: 1 });

  // --- newsletterSubscribers ---------------------------------------------
  await safeCreateIndex(db, "newsletterSubscribers", { email: 1 }, { unique: true });

  // --- secureReportLinks (never index the raw token — only its hash) -----
  await safeCreateIndex(db, "secureReportLinks", { tokenHash: 1 }, { unique: true });
  await safeCreateIndex(db, "secureReportLinks", { projectId: 1 });
  await safeCreateIndex(db, "secureReportLinks", { expiresAt: 1 });

  // --- auditLogs -----------------------------------------------------
  await safeCreateIndex(db, "auditLogs", { createdAt: -1 });
  await safeCreateIndex(db, "auditLogs", { userId: 1 });
  await safeCreateIndex(db, "auditLogs", { action: 1 });

  // --- contactMessages ---------------------------------------------------
  await safeCreateIndex(db, "contactMessages", { createdAt: -1 });

  console.log("[mongo] indexes ensured");
}
