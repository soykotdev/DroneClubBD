import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { ProjectDoc } from "../types/models.js";
import type { ProjectInput, ProjectCategory } from "@droneclub/shared";
import { generateProjectReference } from "../services/referenceNumber.js";

function collection(): Collection<ProjectDoc> {
  return getDb().collection<ProjectDoc>("projects");
}

export async function listPublishedCaseStudies(category?: ProjectCategory): Promise<ProjectDoc[]> {
  return collection()
    .find({ status: "published", isCaseStudy: true, isDeleted: false, ...(category ? { category } : {}) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findPublishedProjectBySlug(slug: string): Promise<ProjectDoc | null> {
  return collection().findOne({ slug, status: "published", isCaseStudy: true, isDeleted: false });
}

export async function listAllProjectsForAdmin(): Promise<ProjectDoc[]> {
  return collection().find({ isDeleted: false }).sort({ createdAt: -1 }).toArray();
}

export async function findProjectById(id: string): Promise<ProjectDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  return collection().findOne({ _id: new ObjectId(id), isDeleted: false });
}

export async function createProject(
  input: ProjectInput,
  createdBy: ObjectId
): Promise<ProjectDoc> {
  const now = new Date();
  const doc: ProjectDoc = {
    _id: new ObjectId(),
    referenceNumber: generateProjectReference(),
    title: input.title,
    slug: input.slug,
    category: input.category,
    location: input.location,
    coordinates: input.coordinates,
    leadId: input.leadId ? new ObjectId(input.leadId) : null,
    assignedStaff: input.assignedStaff,
    projectStatus: input.projectStatus,
    faultSummary: input.faultSummary || undefined,
    summary: input.summary,
    description: input.description || undefined,
    coverImage: input.coverImage,
    galleryImageIds: [],
    isCaseStudy: input.isCaseStudy,
    status: input.status,
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

export async function updateProject(id: string, input: Partial<ProjectInput>, updatedBy: ObjectId): Promise<ProjectDoc | null> {
  const { leadId, ...rest } = input;
  return collection().findOneAndUpdate(
    { _id: new ObjectId(id), isDeleted: false },
    {
      $set: {
        ...rest,
        ...(leadId !== undefined ? { leadId: leadId ? new ObjectId(leadId) : null } : {}),
        updatedAt: new Date(),
        updatedBy,
      },
    },
    { returnDocument: "after" }
  );
}

export async function countByProjectStatus(status: ProjectDoc["projectStatus"]): Promise<number> {
  return collection().countDocuments({ projectStatus: status, isDeleted: false });
}

export async function countPublished(): Promise<number> {
  return collection().countDocuments({ status: "published", isDeleted: false });
}
