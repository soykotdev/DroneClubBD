import { z } from "zod";
import { PROJECT_CATEGORIES, PROJECT_STATUSES, PUBLISH_STATUSES } from "../constants.js";
import { slugSchema } from "./service.js";

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: slugSchema,
  category: z.enum(PROJECT_CATEGORIES),
  location: z.string().trim().min(2).max(200),
  coordinates: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  leadId: z.string().length(24).optional().nullable(),
  assignedStaff: z.array(z.string().trim().max(120)).default([]),
  projectStatus: z.enum(PROJECT_STATUSES).default("planning"),
  faultSummary: z.string().trim().max(4000).optional().or(z.literal("")),
  summary: z.string().trim().min(2).max(280),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  coverImage: z.object({ url: z.string().url(), alt: z.string().trim().min(2).max(200) }).optional(),
  isCaseStudy: z.boolean().default(false),
  status: z.enum(PUBLISH_STATUSES).default("draft"),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(2).max(4000),
  companyWebsite: z.string().max(0).optional().or(z.literal("")), // honeypot
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(180),
  companyWebsite: z.string().max(0).optional().or(z.literal("")), // honeypot
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const secureReportLinkSchema = z.object({
  projectId: z.string().length(24),
  title: z.string().trim().min(2).max(200),
  fileUrl: z.string().url(),
  expiresAt: z.string().datetime(),
  maxDownloads: z.number().int().min(1).max(1000).optional(),
});
export type SecureReportLinkInput = z.infer<typeof secureReportLinkSchema>;
