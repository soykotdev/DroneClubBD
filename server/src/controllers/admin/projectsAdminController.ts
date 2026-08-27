import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { projectSchema } from "@droneclub/shared";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { listAllProjectsForAdmin, findProjectById, createProject, updateProject } from "../../repositories/projectsRepository.js";
import { recordAuditLog } from "../../repositories/auditLogsRepository.js";

export async function listProjectsAdmin(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await listAllProjectsForAdmin());
}

export async function getProjectAdmin(req: Request, res: Response): Promise<void> {
  const project = await findProjectById(req.params.id as string);
  if (!project) throw AppError.notFound("Project not found");
  sendSuccess(res, project);
}

export async function createProjectAdmin(req: Request, res: Response): Promise<void> {
  const input = projectSchema.parse(req.body);
  const created = await createProject(input, new ObjectId(req.user!.id));
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "project.created", entity: "project", entityId: created._id.toString(), ipAddress: req.ip });
  sendSuccess(res, created, undefined, 201);
}

export async function updateProjectAdmin(req: Request, res: Response): Promise<void> {
  const input = projectSchema.partial().parse(req.body);
  const updated = await updateProject(req.params.id as string, input, new ObjectId(req.user!.id));
  if (!updated) throw AppError.notFound("Project not found");
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "project.updated", entity: "project", entityId: updated._id.toString(), ipAddress: req.ip });
  sendSuccess(res, updated);
}
