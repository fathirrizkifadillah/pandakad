import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth.js";
import { dashboardController } from "./dashboard.controller.js";

export const dashboardRouter = Router();

// 1. Dashboard BAAK / Administrator Utama
dashboardRouter.get(
	"/admin",
	authenticate,
	requireRole(Role.Admin),
	dashboardController.getAdminDashboard,
);

// 2. Dashboard Portal Dosen
dashboardRouter.get(
	"/lecturer",
	authenticate,
	requireRole(Role.Dosen, Role.Admin),
	dashboardController.getLecturerDashboard,
);

// 3. Dashboard Portal Mahasiswa
dashboardRouter.get(
	"/student",
	authenticate,
	requireRole(Role.Mahasiswa, Role.Admin),
	dashboardController.getStudentDashboard,
);
