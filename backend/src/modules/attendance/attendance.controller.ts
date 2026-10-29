import type { NextFunction, Request, Response } from "express";
import {
	recordSessionAttendanceSchema,
	studentAttendanceQuerySchema,
} from "./attendance.schema.js";
import { attendanceService } from "./attendance.service.js";

export class AttendanceController {
	/**
	 * POST /api/v1/attendance/session
	 * Dosen / Admin mencatat absensi satu sesi
	 */
	async recordSession(req: Request, res: Response, next: NextFunction) {
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

			const input = recordSessionAttendanceSchema.parse(req.body);
			const result = await attendanceService.recordSessionAttendance(
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
	 * GET /api/v1/attendance/class/:classId/session/:sessionNumber
	 * Dosen / Admin melihat absensi pada sesi tertentu
	 */
	async getSession(req: Request, res: Response, next: NextFunction) {
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

			const sessionNum = Number.parseInt(req.params.sessionNumber, 10);
			const result = await attendanceService.getSessionAttendance(
				userId,
				userRole,
				req.params.classId,
				sessionNum,
			);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /api/v1/attendance/class/:classId/recap
	 * Dosen / Admin melihat rekapitulasi kehadiran satu kelas penuh
	 */
	async getClassRecap(req: Request, res: Response, next: NextFunction) {
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

			const result = await attendanceService.getClassAttendanceRecap(
				userId,
				userRole,
				req.params.classId,
			);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /api/v1/attendance/my-recap
	 * Mahasiswa melihat rekapitulasi presensi seluruh mata kuliah yang diambil
	 */
	async getMyRecap(req: Request, res: Response, next: NextFunction) {
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

			const query = studentAttendanceQuerySchema.parse(req.query);
			const result = await attendanceService.getStudentAttendanceRecap(
				userId,
				query.academicTermId,
			);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	}
}

export const attendanceController = new AttendanceController();
