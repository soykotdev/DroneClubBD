import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import type { StorageProvider } from "./storageProvider.js";

// Resolved outside client/public and outside the git-tracked source tree —
// served only through server/src/routes/uploads.ts (public assets) or the
// signed report-download endpoint (private reports).
const UPLOAD_ROOT = path.resolve(process.cwd(), env.UPLOAD_DIRECTORY);

function safeExtension(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  // Allowlist of extensions we ever accept — anything else is dropped to
  // prevent path traversal or double-extension tricks (e.g. "x.php.jpg").
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  return allowed.includes(ext) ? ext : "";
}

export const localStorageProvider: StorageProvider = {
  async save({ buffer, originalFilename, mimeType, folder }) {
    const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "");
    const dir = path.join(UPLOAD_ROOT, safeFolder);
    await mkdir(dir, { recursive: true });

    const storageKey = path.join(safeFolder, `${randomUUID()}${safeExtension(originalFilename)}`);
    const fullPath = path.join(UPLOAD_ROOT, storageKey);
    await writeFile(fullPath, buffer);

    return {
      url: `/uploads/${storageKey.replace(/\\/g, "/")}`,
      storageKey,
      originalFilename,
      mimeType,
      sizeBytes: buffer.length,
    };
  },

  async delete(storageKey: string) {
    const fullPath = path.join(UPLOAD_ROOT, storageKey);
    if (!fullPath.startsWith(UPLOAD_ROOT)) return; // defence in depth against traversal
    await unlink(fullPath).catch(() => undefined);
  },
};
