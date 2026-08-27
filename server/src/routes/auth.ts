import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginRateLimit } from "../middleware/rateLimit.js";
import { requireAuth } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/login", loginRateLimit, asyncHandler(authController.login));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.get("/me", requireAuth, asyncHandler(authController.me));
authRouter.post("/change-password", requireAuth, asyncHandler(authController.changePassword));
