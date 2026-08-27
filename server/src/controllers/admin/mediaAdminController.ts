import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { AppError } from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { getStorageProvider } from "../../storage/storageProvider.js";
import { assertFileSignatures } from "../../middleware/upload.js";
import { getDb } from "../../database/mongoClient.js";

/** Admin media-library upload — backs the "Upload image" / "Enter alt text" CMS actions. */
export async function uploadMedia(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file) throw new AppError("No file provided", 400, "MISSING_FILE");
  assertFileSignatures([file]);

  const storage = await getStorageProvider();
  const stored = await storage.save({ buffer: file.buffer, originalFilename: file.originalname, mimeType: file.mimetype, folder: "media" });

  const doc = {
    _id: new ObjectId(),
    url: stored.url,
    storageKey: stored.storageKey,
    originalFilename: stored.originalFilename,
    mimeType: stored.mimeType,
    sizeBytes: stored.sizeBytes,
    altText: typeof req.body.altText === "string" ? req.body.altText : "",
    uploadedBy: new ObjectId(req.user!.id),
    visibility: "public" as const,
    relatedEntity: typeof req.body.relatedEntity === "string" ? req.body.relatedEntity : undefined,
    createdAt: new Date(),
  };
  await getDb().collection("mediaLibrary").insertOne(doc);

  sendSuccess(res, { id: doc._id.toString(), url: doc.url, altText: doc.altText }, undefined, 201);
}

export async function listMedia(_req: Request, res: Response): Promise<void> {
  const items = await getDb().collection("mediaLibrary").find({}).sort({ createdAt: -1 }).limit(100).toArray();
  sendSuccess(res, items);
}
