import type { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getSiteSettings } from "../repositories/siteSettingsRepository.js";
import { listPublishedServices, findPublishedServiceBySlug } from "../repositories/servicesRepository.js";
import { listPublishedEquipment, findPublishedEquipmentBySlug } from "../repositories/equipmentRepository.js";
import { listPublishedCaseStudies, findPublishedProjectBySlug } from "../repositories/projectsRepository.js";
import { createInspectionRequest } from "../repositories/inspectionRequestsRepository.js";
import { createContactMessage, subscribeToNewsletter } from "../repositories/contactRepository.js";
import { findValidReportLinkByTokenHash, incrementDownloadCount } from "../repositories/secureReportLinksRepository.js";
import { findProjectById } from "../repositories/projectsRepository.js";
import { inspectionRequestSchema, contactMessageSchema, newsletterSchema, PROJECT_CATEGORIES } from "@droneclub/shared";
import { hashToken } from "../services/tokens.js";
import { getStorageProvider } from "../storage/storageProvider.js";
import { assertFileSignatures } from "../middleware/upload.js";
import { sendEmail, inspectionRequestConfirmationEmail, inspectionRequestAdminNotificationEmail } from "../services/email.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export async function getSettings(_req: Request, res: Response): Promise<void> {
  const settings = await getSiteSettings();
  sendSuccess(res, settings);
}

// Navigation is presently a static, brand-approved structure per spec
// Section 9. Exposed as an endpoint (rather than hardcoded in the client)
// so it becomes admin-editable once the navigation CMS module lands.
export async function getNavigation(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, {
    primary: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "Inspection Process", href: "/inspection-process" },
      { label: "Equipment", href: "/equipment" },
      { label: "Projects", href: "/projects" },
      { label: "Training", href: "/services/equipment-training" },
      { label: "About", href: "/about" },
      { label: "Resources", href: "/resources" },
      { label: "Contact", href: "/contact" },
    ],
    cta: { label: "Request a Service", href: "/request-inspection" },
  });
}

export async function getServices(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await listPublishedServices());
}

export async function getServiceBySlug(req: Request, res: Response): Promise<void> {
  const service = await findPublishedServiceBySlug(req.params.slug as string);
  if (!service) throw AppError.notFound("Service not found");
  sendSuccess(res, service);
}

export async function getEquipment(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await listPublishedEquipment());
}

export async function getEquipmentBySlug(req: Request, res: Response): Promise<void> {
  const item = await findPublishedEquipmentBySlug(req.params.slug as string);
  if (!item) throw AppError.notFound("Equipment not found");
  sendSuccess(res, item);
}

export async function getProjects(req: Request, res: Response): Promise<void> {
  const requested = typeof req.query.category === "string" ? req.query.category : undefined;
  const category = PROJECT_CATEGORIES.find((c) => c === requested);
  sendSuccess(res, await listPublishedCaseStudies(category));
}

export async function getProjectBySlug(req: Request, res: Response): Promise<void> {
  const project = await findPublishedProjectBySlug(req.params.slug as string);
  if (!project) throw AppError.notFound("Project not found");
  sendSuccess(res, project);
}

// Posts and FAQs CMS modules are scaffolded as empty-safe endpoints so the
// public site never breaks while those admin modules are being built out.
export async function getPosts(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, []);
}

export async function getPostBySlug(_req: Request): Promise<void> {
  throw AppError.notFound("Post not found");
}

export async function getFaqs(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, []);
}

export async function submitInspectionRequest(req: Request, res: Response): Promise<void> {
  const input = inspectionRequestSchema.parse(req.body);

  const filesByField = (req.files ?? {}) as Record<string, Express.Multer.File[]>;
  const allFiles = Object.values(filesByField).flat();
  assertFileSignatures(allFiles);

  const storage = await getStorageProvider();
  const attachments = await Promise.all(
    allFiles.map(async (file) => {
      const stored = await storage.save({ buffer: file.buffer, originalFilename: file.originalname, mimeType: file.mimetype, folder: "inspection-requests" });
      return { url: stored.url, originalFilename: stored.originalFilename, mimeType: stored.mimeType, sizeBytes: stored.sizeBytes };
    })
  );

  const created = await createInspectionRequest(input, attachments, req.ip);

  sendEmail({ to: created.email, subject: `Inspection request received — ${created.referenceNumber}`, html: inspectionRequestConfirmationEmail(created.referenceNumber, created.fullName) }).catch((err) =>
    logger.warn({ err }, "Failed to send confirmation email")
  );
  if (env.ADMIN_EMAIL) {
    sendEmail({ to: env.ADMIN_EMAIL, subject: `New inspection request — ${created.referenceNumber}`, html: inspectionRequestAdminNotificationEmail(created.referenceNumber, created.service) }).catch((err) =>
      logger.warn({ err }, "Failed to send admin notification email")
    );
  }

  sendSuccess(res, { referenceNumber: created.referenceNumber }, undefined, 201);
}

export async function submitContactMessage(req: Request, res: Response): Promise<void> {
  const input = contactMessageSchema.parse(req.body);
  await createContactMessage(input);
  sendSuccess(res, { received: true }, undefined, 201);
}

export async function subscribeNewsletter(req: Request, res: Response): Promise<void> {
  const input = newsletterSchema.parse(req.body);
  const result = await subscribeToNewsletter(input.email);
  sendSuccess(res, result, undefined, 201);
}

/** Public, token-gated report access — never a predictable URL. */
export async function getReportByToken(req: Request, res: Response): Promise<void> {
  const tokenHash = hashToken(req.params.secureToken as string);
  const link = await findValidReportLinkByTokenHash(tokenHash);
  if (!link) throw AppError.notFound("This report link is invalid, expired or has been revoked.");

  const project = await findProjectById(link.projectId.toString());
  await incrementDownloadCount(link._id);

  sendSuccess(res, {
    title: link.title,
    fileUrl: link.fileUrl,
    project: project ? { title: project.title, referenceNumber: project.referenceNumber, location: project.location } : null,
  });
}
