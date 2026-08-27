import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { LeadNoteDoc } from "../types/models.js";

function collection(): Collection<LeadNoteDoc> {
  return getDb().collection<LeadNoteDoc>("leadNotes");
}

export async function addLeadNote(inspectionRequestId: string, authorId: ObjectId, note: string): Promise<LeadNoteDoc> {
  const doc: LeadNoteDoc = {
    _id: new ObjectId(),
    inspectionRequestId: new ObjectId(inspectionRequestId),
    authorId,
    note,
    createdAt: new Date(),
  };
  await collection().insertOne(doc);
  return doc;
}

export async function listLeadNotes(inspectionRequestId: string): Promise<LeadNoteDoc[]> {
  return collection()
    .find({ inspectionRequestId: new ObjectId(inspectionRequestId) })
    .sort({ createdAt: -1 })
    .toArray();
}
