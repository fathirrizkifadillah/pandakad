import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth.js";
import { attendanceController } from "./attendance.controller.js";

export const attendanceRouter = Router();

attendanceRouter.use(authenticate);

// Rute Mahasiswa
attendanceRouter.get(
	"/my-recap",
	requireRole(Role.Mahasiswa),
	(req, res, next) => attendanceController.getMyRecap(req, res, next),
);

// Rute Dosen & Admin
attendanceRouter.get(
	"/class/:classId/session/:sessionNumber",
	requireRole(Role.Dosen, Role.Admin),
	(req, res, next) => attendanceController.getSession(req, res, next),
);

attendanceRouter.get(
	"/class/:classId/recap",
	requireRole(Role.Dosen, Role.Admin),
	(req, res, next) => attendanceController.getClassRecap(req, res, next),
);

attendanceRouter.post(
	"/session",
	requireRole(Role.Dosen, Role.Admin),
	(req, res, next) => attendanceController.recordSession(req, res, next),
);
