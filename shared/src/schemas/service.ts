import { z } from "zod";
import { SERVICE_CATEGORIES, PUBLISH_STATUSES, EQUIPMENT_CATEGORIES } from "../constants.js";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric and hyphen-separated");

export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: slugSchema,
  category: z.enum(SERVICE_CATEGORIES),
  summary: z.string().trim().min(2).max(280),
  description: z.string().trim().min(2).max(8000),
  heroImage: z.object({ url: z.string().url(), alt: z.string().trim().min(2).max(200) }),
  icon: z.string().trim().max(60).optional(),
  displayOrder: z.number().int().min(0).default(0),
  status: z.enum(PUBLISH_STATUSES).default("draft"),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const equipmentSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: slugSchema,
  category: z.enum(EQUIPMENT_CATEGORIES),
  image: z.object({ url: z.string().url(), alt: z.string().trim().min(2).max(200) }),
  shortDescription: z.string().trim().min(2).max(280),
  useCase: z.string().trim().min(2).max(2000),
  specifications: z.array(z.object({ label: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(200) })).default([]),
  availability: z.enum(["in-service", "on-order", "retired"]).default("in-service"),
  displayOrder: z.number().int().min(0).default(0),
  status: z.enum(PUBLISH_STATUSES).default("draft"),
});
export type EquipmentInput = z.infer<typeof equipmentSchema>;
