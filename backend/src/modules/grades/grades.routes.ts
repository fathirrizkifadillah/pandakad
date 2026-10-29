import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth.js";
import { gradesController } from "./grades.controller.js";

export const gradesRouter = Router();

gradesRouter.use(authenticate);

// Rute Mahasiswa
gradesRouter.get("/khs", requireRole(Role.Mahasiswa), (req, res, next) =>
	gradesController.getMyKHS(req, res, next),
);

gradesRouter.get("/transcript", requireRole(Role.Mahasiswa), (req, res, next) =>
	gradesController.getMyTranscript(req, res, next),
);

// Rute Dosen & Admin
gradesRouter.get(
	"/class/:classId",
	requireRole(Role.Dosen, Role.Admin),
	(req, res, next) => gradesController.getClassStudents(req, res, next),
);

gradesRouter.post(
	"/batch",
	requireRole(Role.Dosen, Role.Admin),
	(req, res, next) => gradesController.batchSave(req, res, next),
);

gradesRouter.patch(
	"/:id",
	requireRole(Role.Dosen, Role.Admin),
	(req, res, next) => gradesController.updateGrade(req, res, next),
);

gradesRouter.get(
	"/:id/audit-logs",
	requireRole(Role.Dosen, Role.Admin),
	(req, res, next) => gradesController.getAuditLogs(req, res, next),
);
