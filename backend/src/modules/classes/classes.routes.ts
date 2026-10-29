import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth.js";
import { classesController } from "./classes.controller.js";

export const classesRouter = Router();

// Rute khusus Dosen (wajib di atas /:id agar tidak tertimpa)
classesRouter.get(
	"/my-classes",
	authenticate,
	requireRole(Role.Dosen),
	(req, res, next) => classesController.getLecturerMyClasses(req, res, next),
);

// Rute Umum & Katalog Kelas
classesRouter.get("/", authenticate, (req, res, next) =>
	classesController.getClasses(req, res, next),
);

classesRouter.get("/:id", authenticate, (req, res, next) =>
	classesController.getClassById(req, res, next),
);

// Rute Admin
classesRouter.post(
	"/",
	authenticate,
	requireRole(Role.Admin),
	(req, res, next) => classesController.createClass(req, res, next),
);

classesRouter.delete(
	"/:id",
	authenticate,
	requireRole(Role.Admin),
	(req, res, next) => classesController.deleteClass(req, res, next),
);
