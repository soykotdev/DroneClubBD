import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { serviceSchema } from "@droneclub/shared";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { listAllServicesForAdmin, findServiceById, createService, updateService, softDeleteService } from "../../repositories/servicesRepository.js";
import { recordAuditLog } from "../../repositories/auditLogsRepository.js";

export async function listServicesAdmin(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await listAllServicesForAdmin());
}

export async function getServiceAdmin(req: Request, res: Response): Promise<void> {
  const service = await findServiceById(req.params.id as string);
  if (!service) throw AppError.notFound("Service not found");
  sendSuccess(res, service);
}

export async function createServiceAdmin(req: Request, res: Response): Promise<void> {
  const input = serviceSchema.parse(req.body);
  const created = await createService(input, new ObjectId(req.user!.id));
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "service.created", entity: "service", entityId: created._id.toString(), ipAddress: req.ip });
  sendSuccess(res, created, undefined, 201);
}

export async function updateServiceAdmin(req: Request, res: Response): Promise<void> {
  const input = serviceSchema.partial().parse(req.body);
  const updated = await updateService(req.params.id as string, input, new ObjectId(req.user!.id));
  if (!updated) throw AppError.notFound("Service not found");
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "service.updated", entity: "service", entityId: updated._id.toString(), ipAddress: req.ip });
  sendSuccess(res, updated);
}

export async function deleteServiceAdmin(req: Request, res: Response): Promise<void> {
  await softDeleteService(req.params.id as string, new ObjectId(req.user!.id));
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "service.deleted", entity: "service", entityId: req.params.id, ipAddress: req.ip });
  sendSuccess(res, { deleted: true });
}
