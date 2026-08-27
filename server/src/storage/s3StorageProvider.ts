import type { StorageProvider } from "./storageProvider.js";

/**
 * S3-compatible storage stub, wired to the same interface as
 * localStorageProvider. Implement with @aws-sdk/client-s3 when
 * STORAGE_PROVIDER=s3 is actually needed in a deployment target — kept as a
 * stub for now so the rest of the codebase never has to branch on which
 * provider is active.
 */
export const s3StorageProvider: StorageProvider = {
  async save() {
    throw new Error(
      "S3 storage provider is not yet implemented. Install @aws-sdk/client-s3 and complete server/src/storage/s3StorageProvider.ts, or set STORAGE_PROVIDER=local."
    );
  },
  async delete() {
    throw new Error("S3 storage provider is not yet implemented.");
  },
};
