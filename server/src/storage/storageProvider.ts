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
 * Express static route (or, for private reports, a signed backend-controlled
 * download endpoint — never a direct static path). Swap STORAGE_PROVIDER to
 * `s3` in production without touching any calling code.
 */
export async function getStorageProvider(): Promise<StorageProvider> {
  const { env } = await import("../config/env.js");
  if (env.STORAGE_PROVIDER === "s3") {
    const { s3StorageProvider } = await import("./s3StorageProvider.js");
    return s3StorageProvider;
  }
  const { localStorageProvider } = await import("./localStorageProvider.js");
  return localStorageProvider;
}
