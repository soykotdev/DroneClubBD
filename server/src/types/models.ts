import type { ObjectId } from "mongodb";
import type {
  UserRole,
  ServiceCategory,
  EquipmentCategory,
  PublishStatus,
  InspectionRequestStatus,
  InspectionRequestPriority,
  ProjectCategory,
  ProjectStatus,
} from "@droneclub/shared";

// Common audit fields every operational document carries, per spec Section 15.
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: ObjectId | null;
  updatedBy?: ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date | null;
}

export interface UserDoc extends AuditFields {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  mustChangePassword: boolean;
  lastLoginAt?: Date | null;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  status: "active" | "disabled";
}

export interface RefreshTokenDoc {
  _id: ObjectId;
  userId: ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date | null;
  replacedByTokenHash?: string | null;
  userAgent?: string;
  ipAddress?: string;
}

export interface ImageRef {
  url: string;
  alt: string;
}

export interface ServiceDoc extends AuditFields {
  _id: ObjectId;
  title: string;
  slug: string;
  category: ServiceCategory;
  summary: string;
  description: string;
  heroImage: ImageRef;
  icon?: string;
  displayOrder: number;
  status: PublishStatus;
}

export interface EquipmentDoc extends AuditFields {
  _id: ObjectId;
  name: string;
  slug: string;
  category: EquipmentCategory;
  image: ImageRef;
  shortDescription: string;
  useCase: string;
  specifications: Array<{ label: string; value: string }>;
  availability: "in-service" | "on-order" | "retired";
  displayOrder: number;
  status: PublishStatus;
}

export interface InspectionRequestDoc extends AuditFields {
  _id: ObjectId;
  referenceNumber: string;
  fullName: string;
  companyName: string;
  position?: string;
  email: string;
  phone: string;
  service: ServiceCategory;
  projectLocation: string;
  facilityType: string;
  systemCapacity?: string;
  panelQuantity?: string;
  siteArea?: string;
  preferredDate?: string;
  message?: string;
  attachments: Array<{ url: string; originalFilename: string; mimeType: string; sizeBytes: number }>;
  status: InspectionRequestStatus;
  priority: InspectionRequestPriority;
  assignedTo?: ObjectId | null;
  estimatedValue?: number | null;
  convertedToProjectId?: ObjectId | null;
  ipAddress?: string;
}

export interface LeadNoteDoc {
  _id: ObjectId;
  inspectionRequestId: ObjectId;
  authorId: ObjectId;
  note: string;
  createdAt: Date;
}

export interface ProjectDoc extends AuditFields {
  _id: ObjectId;
  referenceNumber: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  location: string;
  coordinates?: { lat: number; lng: number };
  leadId?: ObjectId | null;
  assignedStaff: string[];
  projectStatus: ProjectStatus;
  faultSummary?: string;
  summary: string;
  description?: string;
  coverImage?: ImageRef;
  galleryImageIds: ObjectId[];
  isCaseStudy: boolean;
  status: PublishStatus;
}

export interface SecureReportLinkDoc {
  _id: ObjectId;
  projectId: ObjectId;
  title: string;
  fileUrl: string;
  tokenHash: string;
  expiresAt: Date;
  maxDownloads?: number;
  downloadCount: number;
  revoked: boolean;
  createdAt: Date;
  createdBy: ObjectId;
}

export interface AuditLogDoc {
  _id: ObjectId;
  userId?: ObjectId | null;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

export interface ContactMessageDoc {
  _id: ObjectId;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: Date;
  handled: boolean;
}

export interface NewsletterSubscriberDoc {
  _id: ObjectId;
  email: string;
  subscribedAt: Date;
  unsubscribedAt?: Date | null;
}

export interface SiteSettingsDoc {
  _id: ObjectId;
  key: "global";
  companyName: string;
  contact: { email?: string; phone?: string; address?: string };
  social: Record<string, string>;
  footerDescription?: string;
  seoDefaults: { titleSuffix?: string; description?: string; ogImage?: string };
  updatedAt: Date;
  updatedBy?: ObjectId | null;
}
