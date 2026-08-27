export interface StoredFile {
  url: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageProvider {
  save(input: { buffer: Buffer; originalFilename: string; mimeType: string; folder: string }): Promise<StoredFile>;
  delete(storageKey: string): Promise<void>;
}

/**
 * Storage abstraction per spec Section 16. `local` writes outside the
 * client's public source directory and serves files through a dedicated
 * Express static route — only viable when the server runs as a normal
 * persistent process with a writable disk. `vercel-blob` is the fit when
 * the API runs as a Vercel serverless function (no persistent local disk
 * at all). `s3` covers any other S3-compatible host. Swap
 * STORAGE_PROVIDER without touching any calling code.
 */
export async function getStorageProvider(): Promise<StorageProvider> {
  const { env } = await import("../config/env.js");
  if (env.STORAGE_PROVIDER === "vercel-blob") {
    const { vercelBlobStorageProvider } = await import("./vercelBlobStorageProvider.js");
    return vercelBlobStorageProvider;
  }
  if (env.STORAGE_PROVIDER === "s3") {
    const { s3StorageProvider } = await import("./s3StorageProvider.js");
    return s3StorageProvider;
  }
  const { localStorageProvider } = await import("./localStorageProvider.js");
  return localStorageProvider;
}
