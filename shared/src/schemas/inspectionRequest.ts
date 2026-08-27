import { z } from "zod";
import { SERVICE_CATEGORIES, INSPECTION_REQUEST_STATUSES, INSPECTION_REQUEST_PRIORITIES } from "../constants.js";

// Step 1 — Contact information
export const contactInfoSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  companyName: z.string().trim().min(2, "Company name is required").max(160),
  position: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").max(180),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(24)
    .regex(/^[0-9+()\-\s]+$/, "Enter a valid phone number"),
});

// Step 2 — Project information
export const projectInfoSchema = z.object({
  service: z.enum(SERVICE_CATEGORIES, { message: "Select the service you need" }),
  projectLocation: z.string().trim().min(2, "Project location is required").max(200),
  facilityType: z.string().trim().min(2, "Solar facility type is required").max(120),
  systemCapacity: z.string().trim().max(60).optional().or(z.literal("")),
  panelQuantity: z.string().trim().max(30).optional().or(z.literal("")),
  siteArea: z.string().trim().max(60).optional().or(z.literal("")),
  preferredDate: z.string().trim().optional().or(z.literal("")),
});

// Step 3 — Supporting information. File fields are validated separately by
// the multipart upload middleware (MIME type, size, signature) — this schema
// only covers the text fields and consent.
export const supportingInfoSchema = z.object({
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  consent: z.literal(true, {
    message: "You must confirm consent before submitting this request",
  }),
  // Honeypot field — must always arrive empty. A filled value marks the
  // submission as spam without telling the bot why it failed.
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

export const inspectionRequestSchema = contactInfoSchema
  .merge(projectInfoSchema)
  .merge(supportingInfoSchema);

export type ContactInfoInput = z.infer<typeof contactInfoSchema>;
export type ProjectInfoInput = z.infer<typeof projectInfoSchema>;
export type SupportingInfoInput = z.infer<typeof supportingInfoSchema>;
export type InspectionRequestInput = z.infer<typeof inspectionRequestSchema>;

// Admin-side update schema (status/priority/notes) — never accepted from the
// public endpoint.
export const inspectionRequestAdminUpdateSchema = z.object({
  status: z.enum(INSPECTION_REQUEST_STATUSES).optional(),
  priority: z.enum(INSPECTION_REQUEST_PRIORITIES).optional(),
  assignedTo: z.string().length(24).optional().nullable(),
  estimatedValue: z.number().nonnegative().optional().nullable(),
});
export type InspectionRequestAdminUpdateInput = z.infer<typeof inspectionRequestAdminUpdateSchema>;

export const leadNoteSchema = z.object({
  note: z.string().trim().min(1, "Note cannot be empty").max(2000),
});
export type LeadNoteInput = z.infer<typeof leadNoteSchema>;
