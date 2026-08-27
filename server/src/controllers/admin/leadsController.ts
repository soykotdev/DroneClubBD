import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { inspectionRequestAdminUpdateSchema, leadNoteSchema } from "@droneclub/shared";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { listInspectionRequests, findInspectionRequestById, updateInspectionRequest } from "../../repositories/inspectionRequestsRepository.js";
import { addLeadNote, listLeadNotes } from "../../repositories/leadNotesRepository.js";
import { createProject } from "../../repositories/projectsRepository.js";
import { recordAuditLog } from "../../repositories/auditLogsRepository.js";

export async function listLeads(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
  const { items, meta } = await listInspectionRequests({
    page,
    pageSize,
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    service: typeof req.query.service === "string" ? req.query.service : undefined,
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    from: typeof req.query.from === "string" ? new Date(req.query.from) : undefined,
    to: typeof req.query.to === "string" ? new Date(req.query.to) : undefined,
  });
  sendSuccess(res, items, meta);
}

export async function getLead(req: Request, res: Response): Promise<void> {
  const lead = await findInspectionRequestById(req.params.id as string);
  if (!lead) throw AppError.notFound("Inspection request not found");
  const notes = await listLeadNotes(lead._id.toString());
  sendSuccess(res, { lead, notes });
}

export async function updateLead(req: Request, res: Response): Promise<void> {
  const input = inspectionRequestAdminUpdateSchema.parse(req.body);
  const update: Record<string, unknown> = { ...input };
  if (input.assignedTo) update.assignedTo = new ObjectId(input.assignedTo);

  const updated = await updateInspectionRequest(req.params.id as string, update, new ObjectId(req.user!.id));
  if (!updated) throw AppError.notFound("Inspection request not found");

  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "lead.updated", entity: "inspectionRequest", entityId: updated._id.toString(), metadata: input, ipAddress: req.ip });
  sendSuccess(res, updated);
}

export async function addNote(req: Request, res: Response): Promise<void> {
  const { note } = leadNoteSchema.parse(req.body);
  const lead = await findInspectionRequestById(req.params.id as string);
  if (!lead) throw AppError.notFound("Inspection request not found");

  const created = await addLeadNote(lead._id.toString(), new ObjectId(req.user!.id), note);
  sendSuccess(res, created, undefined, 201);
}

/** Converts an inspection request into a project — spec Section 13. */
export async function convertToProject(req: Request, res: Response): Promise<void> {
  const lead = await findInspectionRequestById(req.params.id as string);
  if (!lead) throw AppError.notFound("Inspection request not found");
  if (lead.convertedToProjectId) throw AppError.conflict("This request has already been converted to a project");

  const slugBase = `${lead.companyName}-${lead.service}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const project = await createProject(
    {
      title: `${lead.companyName} — ${lead.service}`,
      slug: `${slugBase}-${lead.referenceNumber.toLowerCase()}`,
      category: mapServiceToProjectCategory(lead.service),
      location: lead.projectLocation,
      leadId: lead._id.toString(),
      assignedStaff: [],
      projectStatus: "planning",
      summary: `Converted from inspection request ${lead.referenceNumber}.`,
      isCaseStudy: false,
      status: "draft",
    },
    new ObjectId(req.user!.id)
  );

  await updateInspectionRequest(lead._id.toString(), { convertedToProjectId: project._id, status: "approved" }, new ObjectId(req.user!.id));
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "lead.converted", entity: "inspectionRequest", entityId: lead._id.toString(), metadata: { projectId: project._id.toString() }, ipAddress: req.ip });

  sendSuccess(res, project, undefined, 201);
}

const MAPPING_SERVICES = new Set([
  "uav-survey-mapping",
  "lidar-survey",
  "drone-photogrammetry",
  "aerial-image-acquisition",
  "3d-mapping-modeling",
  "construction-progress-monitoring",
  "disaster-assessment",
]);

function mapServiceToProjectCategory(service: string): "inspection" | "cleaning" | "mapping" | "maintenance" | "training" {
  if (service === "solar-panel-cleaning") return "cleaning";
  if (service === "operation-maintenance") return "maintenance";
  if (service === "equipment-training") return "training";
  if (MAPPING_SERVICES.has(service)) return "mapping";
  return "inspection";
}

export async function exportLeadsCsv(req: Request, res: Response): Promise<void> {
  const { items } = await listInspectionRequests({
    page: 1,
    pageSize: 5000,
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    service: typeof req.query.service === "string" ? req.query.service : undefined,
    search: typeof req.query.search === "string" ? req.query.search : undefined,
  });

  const header = ["Reference", "Full Name", "Company", "Email", "Phone", "Service", "Status", "Priority", "Created At"];
  const rows = items.map((r) => [r.referenceNumber, r.fullName, r.companyName, r.email, r.phone, r.service, r.status, r.priority, r.createdAt.toISOString()]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="inspection-requests-${Date.now()}.csv"`);
  res.send(csv);
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
