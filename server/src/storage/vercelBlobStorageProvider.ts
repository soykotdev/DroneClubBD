import { put, del } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import type { StorageProvider } from "./storageProvider.js";

/**
 * Vercel Blob storage — the natural fit when the API itself runs as a
 * Vercel serverless function, which has no persistent local disk (the
 * same reason `local` storage doesn't work in that environment). Reads
 * `BLOB_READ_WRITE_TOKEN` from the environment automatically (Vercel
 * injects this once a Blob store is connected to the project; set it
 * manually in `server/.env` for local development against the same store).
 *
 * `del()` needs the full blob URL, not a relative key, so storageKey here
 * *is* the URL — that's what gets persisted on the owning document and
 * passed back into delete().
 */
export const vercelBlobStorageProvider: StorageProvider = {
  async save({ buffer, originalFilename, mimeType, folder }) {
    const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "");
    const ext = originalFilename.includes(".") ? originalFilename.slice(originalFilename.lastIndexOf(".")) : "";
    const pathname = `${safeFolder}/${randomUUID()}${ext}`;

    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });

    return {
      url: blob.url,
      storageKey: blob.url,
      originalFilename,
      mimeType,
      sizeBytes: buffer.length,
    };
  },

  async delete(storageKey: string) {
    await del(storageKey).catch(() => undefined);
  },
};
