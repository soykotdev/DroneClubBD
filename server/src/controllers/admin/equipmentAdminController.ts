import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { equipmentSchema } from "@droneclub/shared";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { listAllEquipmentForAdmin, createEquipment, updateEquipment, softDeleteEquipment } from "../../repositories/equipmentRepository.js";
import { recordAuditLog } from "../../repositories/auditLogsRepository.js";

export async function listEquipmentAdmin(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await listAllEquipmentForAdmin());
}

export async function createEquipmentAdmin(req: Request, res: Response): Promise<void> {
  const input = equipmentSchema.parse(req.body);
  const created = await createEquipment(input, new ObjectId(req.user!.id));
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "equipment.created", entity: "equipment", entityId: created._id.toString(), ipAddress: req.ip });
  sendSuccess(res, created, undefined, 201);
}

export async function updateEquipmentAdmin(req: Request, res: Response): Promise<void> {
  const input = equipmentSchema.partial().parse(req.body);
  const updated = await updateEquipment(req.params.id as string, input, new ObjectId(req.user!.id));
  if (!updated) throw AppError.notFound("Equipment not found");
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "equipment.updated", entity: "equipment", entityId: updated._id.toString(), ipAddress: req.ip });
  sendSuccess(res, updated);
}

export async function deleteEquipmentAdmin(req: Request, res: Response): Promise<void> {
  await softDeleteEquipment(req.params.id as string, new ObjectId(req.user!.id));
  await recordAuditLog({ userId: new ObjectId(req.user!.id), action: "equipment.deleted", entity: "equipment", entityId: req.params.id, ipAddress: req.ip });
  sendSuccess(res, { deleted: true });
}
