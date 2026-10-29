import type { NextFunction, Request, Response } from "express";
import {
	batchInputGradesSchema,
	khsQuerySchema,
	updateSingleGradeSchema,
} from "./grades.schema.js";
import { gradesService } from "./grades.service.js";

export class GradesController {
	/**
	 * GET /api/v1/grades/class/:classId
	 * Dosen melihat daftar mahasiswa di kelas untuk input nilai
	 */
	async getClassStudents(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			const userRole = req.user?.role;
			if (!userId || !userRole) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum diautentikasi.",
					},
				});
				return;
			}

			const data = await gradesService.getClassStudentsForGrading(
				userId,
				userRole,
				req.params.classId,
			);
			res.status(200).json({ data });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * POST /api/v1/grades/batch
	 * Dosen / Admin menyimpan nilai batch (Draft atau Final)
	 */
	async batchSave(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			const userRole = req.user?.role;
			if (!userId || !userRole) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum diautentikasi.",
					},
				});
				return;
			}

			const input = batchInputGradesSchema.parse(req.body);
			const result = await gradesService.batchSaveGrades(
				userId,
				userRole,
				input,
			);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * PATCH /api/v1/grades/:id
	 * Dosen / Admin mengoreksi nilai tunggal dengan alasan audit log
	 */
	async updateGrade(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			const userRole = req.user?.role;
			if (!userId || !userRole) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum diautentikasi.",
					},
				});
				return;
			}

			const input = updateSingleGradeSchema.parse(req.body);
			const result = await gradesService.updateSingleGrade(
				userId,
				userRole,
				req.params.id,
				input,
			);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /api/v1/grades/:id/audit-logs
	 * Melihat audit log perubahan nilai tertentu
	 */
	async getAuditLogs(req: Request, res: Response, next: NextFunction) {
		try {
			const logs = await gradesService.getGradeAuditLogs(req.params.id);
			res.status(200).json({ data: logs });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /api/v1/grades/khs
	 * Mahasiswa melihat Kartu Hasil Studi (KHS) per semester
	 */
	async getMyKHS(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum diautentikasi.",
					},
				});
				return;
			}

			const query = khsQuerySchema.parse(req.query);
			const khs = await gradesService.getStudentKHS(
				userId,
				query.academicTermId,
			);
			res.status(200).json({ data: khs });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /api/v1/grades/transcript
	 * Mahasiswa melihat Transkrip Akademik Kumulatif
	 */
	async getMyTranscript(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum diautentikasi.",
					},
				});
				return;
			}

			const transcript = await gradesService.getStudentTranscript(userId);
			res.status(200).json({ data: transcript });
		} catch (error) {
			next(error);
		}
	}
}

export const gradesController = new GradesController();
