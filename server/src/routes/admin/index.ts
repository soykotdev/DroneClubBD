import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { singleMediaUpload } from "../../middleware/upload.js";

import * as dashboard from "../../controllers/admin/dashboardController.js";
import * as leads from "../../controllers/admin/leadsController.js";
import * as services from "../../controllers/admin/servicesAdminController.js";
import * as equipment from "../../controllers/admin/equipmentAdminController.js";
import * as projects from "../../controllers/admin/projectsAdminController.js";
import * as reports from "../../controllers/admin/reportsAdminController.js";
import * as users from "../../controllers/admin/usersAdminController.js";
import * as settings from "../../controllers/admin/settingsAdminController.js";
import * as auditLogs from "../../controllers/admin/auditLogsAdminController.js";
import * as media from "../../controllers/admin/mediaAdminController.js";

export const adminRouter = Router();

// Every route below requires a valid access token. Role checks are then
// layered per-route — the frontend hiding a button is never sufficient on
// its own (spec Section 14).
adminRouter.use(requireAuth);

const EDITORS = ["super-admin", "content-editor"] as const;
const OPERATORS = ["super-admin", "operations-manager"] as const;
const ALL_STAFF = ["super-admin", "content-editor", "operations-manager", "viewer"] as const;

adminRouter.get("/dashboard", requireRole(...ALL_STAFF), asyncHandler(dashboard.getDashboard));

// --- Leads (Operations Manager + Super Admin manage; Viewer reads) ---------
adminRouter.get("/leads", requireRole(...ALL_STAFF), asyncHandler(leads.listLeads));
adminRouter.get("/leads/export.csv", requireRole(...OPERATORS), asyncHandler(leads.exportLeadsCsv));
adminRouter.get("/leads/:id", requireRole(...ALL_STAFF), asyncHandler(leads.getLead));
adminRouter.patch("/leads/:id", requireRole(...OPERATORS), asyncHandler(leads.updateLead));
adminRouter.post("/leads/:id/notes", requireRole(...OPERATORS), asyncHandler(leads.addNote));
adminRouter.post("/leads/:id/convert", requireRole(...OPERATORS), asyncHandler(leads.convertToProject));

// --- Services (Content Editor + Super Admin) -------------------------------
adminRouter.get("/services", requireRole(...ALL_STAFF), asyncHandler(services.listServicesAdmin));
adminRouter.get("/services/:id", requireRole(...ALL_STAFF), asyncHandler(services.getServiceAdmin));
adminRouter.post("/services", requireRole(...EDITORS), asyncHandler(services.createServiceAdmin));
adminRouter.put("/services/:id", requireRole(...EDITORS), asyncHandler(services.updateServiceAdmin));
adminRouter.delete("/services/:id", requireRole("super-admin"), asyncHandler(services.deleteServiceAdmin));

// --- Equipment --------------------------------------------------------
adminRouter.get("/equipment", requireRole(...ALL_STAFF), asyncHandler(equipment.listEquipmentAdmin));
adminRouter.post("/equipment", requireRole(...EDITORS), asyncHandler(equipment.createEquipmentAdmin));
adminRouter.put("/equipment/:id", requireRole(...EDITORS), asyncHandler(equipment.updateEquipmentAdmin));
adminRouter.delete("/equipment/:id", requireRole("super-admin"), asyncHandler(equipment.deleteEquipmentAdmin));

// --- Projects (Operations Manager runs these; Content Editor publishes case studies) ---
adminRouter.get("/projects", requireRole(...ALL_STAFF), asyncHandler(projects.listProjectsAdmin));
adminRouter.get("/projects/:id", requireRole(...ALL_STAFF), asyncHandler(projects.getProjectAdmin));
adminRouter.post("/projects", requireRole(...OPERATORS), asyncHandler(projects.createProjectAdmin));
adminRouter.put("/projects/:id", requireRole("super-admin", "content-editor", "operations-manager"), asyncHandler(projects.updateProjectAdmin));

// --- Secure report sharing (Operations Manager + Super Admin) -----------
adminRouter.post("/reports", requireRole(...OPERATORS), asyncHandler(reports.createReportLink));
adminRouter.get("/projects/:projectId/reports", requireRole(...ALL_STAFF), asyncHandler(reports.listReportLinksForProjectAdmin));
adminRouter.delete("/reports/:id", requireRole(...OPERATORS), asyncHandler(reports.revokeReportLinkAdmin));

// --- Media library ---------------------------------------------------
adminRouter.get("/media", requireRole(...ALL_STAFF), asyncHandler(media.listMedia));
adminRouter.post("/media", requireRole(...EDITORS), singleMediaUpload, asyncHandler(media.uploadMedia));

// --- Settings (Super Admin only) --------------------------------------
adminRouter.get("/settings", requireRole("super-admin"), asyncHandler(settings.getSettingsAdmin));
adminRouter.put("/settings", requireRole("super-admin"), asyncHandler(settings.updateSettingsAdmin));

// --- Users & audit logs (Super Admin only) ------------------------------
adminRouter.get("/users", requireRole("super-admin"), asyncHandler(users.listUsersAdmin));
adminRouter.post("/users", requireRole("super-admin"), asyncHandler(users.createUserAdmin));
adminRouter.get("/audit-logs", requireRole("super-admin"), asyncHandler(auditLogs.listAuditLogsAdmin));
