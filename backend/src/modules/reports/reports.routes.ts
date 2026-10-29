import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRole } from "../../middlewares/auth.js";
import { reportsController } from "./reports.controller.js";

export const reportsRouter = Router();

// 1. Ekspor Rekap Nilai Akhir Kelas (CSV) - Dosen pengampu & Admin
reportsRouter.get(
	"/grades/:classId/csv",
	authenticate,
	requireRole(Role.Admin, Role.Dosen),
	reportsController.exportGradesCsv,
);

// 2. Ekspor Rekap Matriks Presensi 16 Sesi Kelas (CSV) - Dosen pengampu & Admin
reportsRouter.get(
	"/attendance/:classId/csv",
	authenticate,
	requireRole(Role.Admin, Role.Dosen),
	reportsController.exportAttendanceCsv,
);

// 3. Ringkasan Eksekutif Prestasi Akademik Kampus - Khusus Admin BAAK
reportsRouter.get(
	"/summary/academic",
	authenticate,
	requireRole(Role.Admin),
	reportsController.getAcademicSummary,
);
