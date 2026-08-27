// Single source of truth for enums shared between client and server.
// Keep in sync with server/src/database MongoDB schema-validation rules.

// One category per service card — category doubles as the service's stable
// identifier (used as the slug and as the "service requested" value on the
// public inspection-request form), so there's a single naming scheme to
// keep in sync instead of two.
export const SERVICE_CATEGORIES = [
  "solar-panel-inspection",
  "solar-panel-cleaning",
  "operation-maintenance",
  "uav-survey-mapping",
  "lidar-survey",
  "drone-photogrammetry",
  "aerial-image-acquisition",
  "3d-mapping-modeling",
  "power-line-tower-inspection",
  "construction-progress-monitoring",
  "disaster-assessment",
  "equipment-training",
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const INSPECTION_REQUEST_STATUSES = [
  "new",
  "under-review",
  "contacted",
  "more-info-required",
  "quotation-prepared",
  "approved",
  "scheduled",
  "in-progress",
  "completed",
  "cancelled",
] as const;
export type InspectionRequestStatus = (typeof INSPECTION_REQUEST_STATUSES)[number];

export const INSPECTION_REQUEST_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type InspectionRequestPriority = (typeof INSPECTION_REQUEST_PRIORITIES)[number];

export const PROJECT_CATEGORIES = [
  "inspection",
  "cleaning",
  "mapping",
  "maintenance",
  "training",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PROJECT_STATUSES = [
  "planning",
  "scheduled",
  "in-progress",
  "completed",
  "on-hold",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const USER_ROLES = ["super-admin", "content-editor", "operations-manager", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PUBLISH_STATUSES = ["draft", "published", "unpublished"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const EQUIPMENT_CATEGORIES = ["inspection", "cleaning"] as const;
export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

// Upload limits enforced identically on client (UX) and server (security).
export const UPLOAD_LIMITS = {
  maxFileSizeBytes: 20 * 1024 * 1024, // 20 MB
  maxFilesPerRequest: 6,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedDocumentMimeTypes: ["application/pdf"],
} as const;
