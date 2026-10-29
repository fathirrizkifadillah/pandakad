import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth.js";
import { masterController } from "./master.controller.js";

export const masterRouter = Router();

// 1. Pengaturan Institusi (GET bersifat publik untuk identitas web/login)
masterRouter.get("/settings", (req, res, next) =>
	masterController.getSettings(req, res, next),
);
masterRouter.put(
	"/settings",
	authenticate,
	requireRole(Role.Admin),
	(req, res, next) => masterController.updateSettings(req, res, next),
);

// 2. Periode Akademik
masterRouter.get("/terms", authenticate, (req, res, next) =>
	masterController.getTerms(req, res, next),
);
masterRouter.get("/terms/active", authenticate, (req, res, next) =>
	masterController.getActiveTerm(req, res, next),
);
masterRouter.post(
	"/terms",
	authenticate,
	requireRole(Role.Admin),
	(req, res, next) => masterController.createTerm(req, res, next),
);
masterRouter.patch(
	"/terms/:id/activate",
	authenticate,
	requireRole(Role.Admin),
	(req, res, next) => masterController.activateTerm(req, res, next),
);

// 3. Program Studi, Gedung & Ruangan
masterRouter.get("/programs", authenticate, (req, res, next) =>
	masterController.getPrograms(req, res, next),
);
masterRouter.get("/buildings", authenticate, (req, res, next) =>
	masterController.getBuildings(req, res, next),
);
masterRouter.get("/rooms", authenticate, (req, res, next) =>
	masterController.getRooms(req, res, next),
);

// 4. Katalog Mata Kuliah & Kurikulum
masterRouter.get("/courses", authenticate, (req, res, next) =>
	masterController.getCourses(req, res, next),
);
masterRouter.post(
	"/courses",
	authenticate,
	requireRole(Role.Admin),
	(req, res, next) => masterController.createCourse(req, res, next),
);
