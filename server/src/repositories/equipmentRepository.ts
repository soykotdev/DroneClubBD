import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { EquipmentDoc } from "../types/models.js";
import type { EquipmentInput } from "@droneclub/shared";

function collection(): Collection<EquipmentDoc> {
  return getDb().collection<EquipmentDoc>("equipment");
}

export async function listPublishedEquipment(): Promise<EquipmentDoc[]> {
  return collection().find({ status: "published", isDeleted: false }).sort({ displayOrder: 1 }).toArray();
}

export async function findPublishedEquipmentBySlug(slug: string): Promise<EquipmentDoc | null> {
  return collection().findOne({ slug, status: "published", isDeleted: false });
}

export async function listAllEquipmentForAdmin(): Promise<EquipmentDoc[]> {
  return collection().find({ isDeleted: false }).sort({ displayOrder: 1 }).toArray();
}

export async function createEquipment(input: EquipmentInput, createdBy: ObjectId): Promise<EquipmentDoc> {
  const now = new Date();
  const doc: EquipmentDoc = {
    _id: new ObjectId(),
    ...input,
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

export async function updateEquipment(id: string, input: Partial<EquipmentInput>, updatedBy: ObjectId): Promise<EquipmentDoc | null> {
  return collection().findOneAndUpdate(
    { _id: new ObjectId(id), isDeleted: false },
    { $set: { ...input, updatedAt: new Date(), updatedBy } },
    { returnDocument: "after" }
  );
}

export async function softDeleteEquipment(id: string, deletedBy: ObjectId): Promise<void> {
  await collection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { isDeleted: true, deletedAt: new Date(), updatedBy: deletedBy } }
  );
}
