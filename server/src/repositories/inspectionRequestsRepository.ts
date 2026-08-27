import { ObjectId, type Collection, type Filter } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { InspectionRequestDoc } from "../types/models.js";
import type { InspectionRequestInput } from "@droneclub/shared";
import { generateInspectionRequestReference } from "../services/referenceNumber.js";
import { buildPaginationMeta } from "../utils/apiResponse.js";

function collection(): Collection<InspectionRequestDoc> {
  return getDb().collection<InspectionRequestDoc>("inspectionRequests");
}

export async function createInspectionRequest(
  input: InspectionRequestInput,
  attachments: InspectionRequestDoc["attachments"],
  ipAddress?: string
): Promise<InspectionRequestDoc> {
  const now = new Date();
  const doc: InspectionRequestDoc = {
    _id: new ObjectId(),
    referenceNumber: generateInspectionRequestReference(),
    fullName: input.fullName,
    companyName: input.companyName,
    position: input.position || undefined,
    email: input.email.toLowerCase(),
    phone: input.phone,
    service: input.service,
    projectLocation: input.projectLocation,
    facilityType: input.facilityType,
    systemCapacity: input.systemCapacity || undefined,
    panelQuantity: input.panelQuantity || undefined,
    siteArea: input.siteArea || undefined,
    preferredDate: input.preferredDate || undefined,
    message: input.message || undefined,
    attachments,
    status: "new",
    priority: "normal",
    assignedTo: null,
    estimatedValue: null,
    convertedToProjectId: null,
    ipAddress,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
    deletedAt: null,
  };
  await collection().insertOne(doc);
  return doc;
}

export interface ListInspectionRequestsOptions {
  page: number;
  pageSize: number;
  status?: string;
  service?: string;
  search?: string;
  from?: Date;
  to?: Date;
}

export async function listInspectionRequests(options: ListInspectionRequestsOptions) {
  const filter: Filter<InspectionRequestDoc> = { isDeleted: false };
  if (options.status) filter.status = options.status as InspectionRequestDoc["status"];
  if (options.service) filter.service = options.service as InspectionRequestDoc["service"];
  if (options.from || options.to) {
    filter.createdAt = {
      ...(options.from ? { $gte: options.from } : {}),
      ...(options.to ? { $lte: options.to } : {}),
    };
  }
  if (options.search) {
    filter.$or = [
      { fullName: { $regex: options.search, $options: "i" } },
      { companyName: { $regex: options.search, $options: "i" } },
      { email: { $regex: options.search, $options: "i" } },
      { referenceNumber: { $regex: options.search, $options: "i" } },
    ];
  }

  const skip = (options.page - 1) * options.pageSize;
  const [items, total] = await Promise.all([
    collection().find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.pageSize).toArray(),
    collection().countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(options.page, options.pageSize, total) };
}

export async function findInspectionRequestById(id: string): Promise<InspectionRequestDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  return collection().findOne({ _id: new ObjectId(id), isDeleted: false });
}

export async function updateInspectionRequest(
  id: string,
  update: Partial<Pick<InspectionRequestDoc, "status" | "priority" | "assignedTo" | "estimatedValue" | "convertedToProjectId">>,
  updatedBy: ObjectId
): Promise<InspectionRequestDoc | null> {
  const result = await collection().findOneAndUpdate(
    { _id: new ObjectId(id), isDeleted: false },
    { $set: { ...update, updatedAt: new Date(), updatedBy } },
    { returnDocument: "after" }
  );
  return result;
}

export async function countByStatus(status: InspectionRequestDoc["status"]): Promise<number> {
  return collection().countDocuments({ status, isDeleted: false });
}

export async function countAll(): Promise<number> {
  return collection().countDocuments({ isDeleted: false });
}

export async function countByService(): Promise<Array<{ service: string; count: number }>> {
  const results = await collection()
    .aggregate<{ _id: string; count: number }>([
      { $match: { isDeleted: false } },
      { $group: { _id: "$service", count: { $sum: 1 } } },
    ])
    .toArray();
  return results.map((r) => ({ service: r._id, count: r.count }));
}

export async function monthlyLeadCounts(months = 6): Promise<Array<{ month: string; count: number }>> {
  const since = new Date();
  since.setMonth(since.getMonth() - months + 1);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const results = await collection()
    .aggregate<{ _id: string; count: number }>([
      { $match: { isDeleted: false, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])
    .toArray();
  return results.map((r) => ({ month: r._id, count: r.count }));
}

export async function recentInspectionRequests(limit = 5): Promise<InspectionRequestDoc[]> {
  return collection().find({ isDeleted: false }).sort({ createdAt: -1 }).limit(limit).toArray();
}
