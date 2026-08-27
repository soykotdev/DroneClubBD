import multer from "multer";
import { UPLOAD_LIMITS } from "@droneclub/shared";
import { AppError } from "../utils/AppError.js";

const ALLOWED_MIME_TYPES = new Set<string>([
  ...UPLOAD_LIMITS.allowedImageMimeTypes,
  ...UPLOAD_LIMITS.allowedDocumentMimeTypes,
]);

// Magic-byte signatures for the file types we accept — a MIME type header
// alone is client-supplied and trivially spoofed, so we also sniff the
// actual file signature before trusting an upload.
const SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  // WebP: "RIFF"...."WEBP" — checked separately below.
];

export function matchesKnownFileSignature(buffer: Buffer, declaredMimeType: string): boolean {
  if (declaredMimeType === "image/webp") {
    return buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  }
  const signature = SIGNATURES.find((s) => s.mime === declaredMimeType);
  if (!signature) return false;
  return signature.bytes.every((byte, index) => buffer[index] === byte);
}

export const inspectionRequestUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: UPLOAD_LIMITS.maxFileSizeBytes,
    files: UPLOAD_LIMITS.maxFilesPerRequest,
  },
  fileFilter(_req, file, callback) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new AppError(`Unsupported file type: ${file.mimetype}`, 415, "UNSUPPORTED_FILE_TYPE"));
      return;
    }
    callback(null, true);
  },
}).fields([
  { name: "sitePlan", maxCount: 2 },
  { name: "images", maxCount: 4 },
  { name: "documents", maxCount: 2 },
]);

export const singleMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_LIMITS.maxFileSizeBytes, files: 1 },
  fileFilter(_req, file, callback) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new AppError(`Unsupported file type: ${file.mimetype}`, 415, "UNSUPPORTED_FILE_TYPE"));
      return;
    }
    callback(null, true);
  },
}).single("file");

/** Runs after multer has buffered the files — verifies magic bytes match the declared MIME type. */
export function assertFileSignatures(files: Express.Multer.File[]): void {
  for (const file of files) {
    if (!matchesKnownFileSignature(file.buffer, file.mimetype)) {
      throw new AppError(`File "${file.originalname}" does not match its declared type`, 415, "FILE_SIGNATURE_MISMATCH");
    }
  }
}
