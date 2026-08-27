import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { publicFormRateLimit } from "../middleware/rateLimit.js";
import { inspectionRequestUpload } from "../middleware/upload.js";
import * as publicController from "../controllers/publicController.js";

export const publicRouter = Router();

publicRouter.get("/settings", asyncHandler(publicController.getSettings));
publicRouter.get("/navigation", asyncHandler(publicController.getNavigation));

publicRouter.get("/services", asyncHandler(publicController.getServices));
publicRouter.get("/services/:slug", asyncHandler(publicController.getServiceBySlug));

publicRouter.get("/equipment", asyncHandler(publicController.getEquipment));
publicRouter.get("/equipment/:slug", asyncHandler(publicController.getEquipmentBySlug));

publicRouter.get("/projects", asyncHandler(publicController.getProjects));
publicRouter.get("/projects/:slug", asyncHandler(publicController.getProjectBySlug));

publicRouter.get("/posts", asyncHandler(publicController.getPosts));
publicRouter.get("/posts/:slug", asyncHandler(publicController.getPostBySlug));

publicRouter.get("/faqs", asyncHandler(publicController.getFaqs));

publicRouter.post(
  "/inspection-requests",
  publicFormRateLimit,
  inspectionRequestUpload,
  asyncHandler(publicController.submitInspectionRequest)
);
publicRouter.post("/contact", publicFormRateLimit, asyncHandler(publicController.submitContactMessage));
publicRouter.post("/newsletter", publicFormRateLimit, asyncHandler(publicController.subscribeNewsletter));

publicRouter.get("/reports/:secureToken", asyncHandler(publicController.getReportByToken));
