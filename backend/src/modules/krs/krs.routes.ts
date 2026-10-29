import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth.js";
import { krsController } from "./krs.controller.js";

export const krsRouter = Router();

// Semua rute KRS membutuhkan autentikasi
krsRouter.use(authenticate);

// Mahasiswa actions
krsRouter.get("/me", requireRole(Role.Mahasiswa), (req, res, next) =>
	krsController.getMyKRS(req, res, next),
);

krsRouter.post("/enroll", requireRole(Role.Mahasiswa), (req, res, next) =>
	krsController.enrollClass(req, res, next),
);

krsRouter.delete("/drop", requireRole(Role.Mahasiswa), (req, res, next) =>
	krsController.dropClass(req, res, next),
);

krsRouter.post("/submit", requireRole(Role.Mahasiswa), (req, res, next) =>
	krsController.submitKRS(req, res, next),
);

// DPA / Admin actions
krsRouter.post(
	"/review",
	requireRole(Role.Dosen, Role.Admin),
	(req, res, next) => krsController.reviewKRS(req, res, next),
);

krsRouter.get("/dpa/advisees", requireRole(Role.Dosen), (req, res, next) =>
	krsController.getAdvisedStudents(req, res, next),
);
