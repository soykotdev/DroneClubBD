import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { ServiceDoc } from "../types/models.js";
import type { ServiceInput } from "@droneclub/shared";

function collection(): Collection<ServiceDoc> {
  return getDb().collection<ServiceDoc>("services");
}

export async function listPublishedServices(): Promise<ServiceDoc[]> {
  return collection().find({ status: "published", isDeleted: false }).sort({ displayOrder: 1 }).toArray();
}

export async function findPublishedServiceBySlug(slug: string): Promise<ServiceDoc | null> {
  return collection().findOne({ slug, status: "published", isDeleted: false });
}

export async function listAllServicesForAdmin(): Promise<ServiceDoc[]> {
  return collection().find({ isDeleted: false }).sort({ displayOrder: 1 }).toArray();
}

export async function findServiceById(id: string): Promise<ServiceDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  return collection().findOne({ _id: new ObjectId(id), isDeleted: false });
}

export async function createService(input: ServiceInput, createdBy: ObjectId): Promise<ServiceDoc> {
  const now = new Date();
  const doc: ServiceDoc = {
    _id: new ObjectId(),
    ...input,
    icon: input.icon,
    createdAt: now,
    updatedAt: now,
    createdBy,
    updatedBy: createdBy,
    isDeleted: false,
    deletedAt: null,
  };
  await collection().insertOne(doc);
  return doc;
}

export async function updateService(id: string, input: Partial<ServiceInput>, updatedBy: ObjectId): Promise<ServiceDoc | null> {
  return collection().findOneAndUpdate(
    { _id: new ObjectId(id), isDeleted: false },
    { $set: { ...input, updatedAt: new Date(), updatedBy } },
    { returnDocument: "after" }
  );
}

export async function softDeleteService(id: string, deletedBy: ObjectId): Promise<void> {
  await collection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { isDeleted: true, deletedAt: new Date(), updatedBy: deletedBy } }
  );
}

export async function countPublishedServices(): Promise<number> {
  return collection().countDocuments({ status: "published", isDeleted: false });
}
