import type { NextFunction, Request, Response } from "express";
import {
	approveKrsSchema,
	dropClassSchema,
	enrollClassSchema,
	krsQuerySchema,
	submitKrsSchema,
} from "./krs.schema.js";
import { krsService } from "./krs.service.js";

export class KrsController {
	/**
	 * GET /api/v1/krs/me
	 * Mahasiswa melihat KRS dirinya sendiri
	 */
	async getMyKRS(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum terautentikasi",
					},
				});
				return;
			}
			const query = krsQuerySchema.parse(req.query);
			const krs = await krsService.getStudentKRS(userId, query.academicTermId);
			res.status(200).json({ data: krs });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * POST /api/v1/krs/enroll
	 * Mahasiswa mengambil kelas ke dalam KRS
	 */
	async enrollClass(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum terautentikasi",
					},
				});
				return;
			}
			const input = enrollClassSchema.parse(req.body);
			const result = await krsService.enrollClass(userId, input);
			res.status(201).json({ data: result });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * DELETE /api/v1/krs/drop
	 * Mahasiswa menghapus kelas dari KRS
	 */
	async dropClass(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum terautentikasi",
					},
				});
				return;
			}
			const input = dropClassSchema.parse(req.body);
			const result = await krsService.dropClass(userId, input);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * POST /api/v1/krs/submit
	 * Mahasiswa mengajukan KRS ke DPA
	 */
	async submitKRS(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum terautentikasi",
					},
				});
				return;
			}
			const input = submitKrsSchema.parse(req.body);
			const result = await krsService.submitKRS(userId, input.notes);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * POST /api/v1/krs/review
	 * DPA / Admin menyetujui atau menolak KRS mahasiswa
	 */
	async reviewKRS(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			const userRole = req.user?.role;
			if (!userId || !userRole) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum terautentikasi",
					},
				});
				return;
			}
			const input = approveKrsSchema.parse(req.body);
			const result = await krsService.reviewKRS(userId, userRole, input);
			res.status(200).json({ data: result });
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /api/v1/krs/dpa/advisees
	 * DPA melihat daftar mahasiswa bimbingan & status KRS
	 */
	async getAdvisedStudents(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({
					error: {
						code: "UNAUTHORIZED",
						message: "User belum terautentikasi",
					},
				});
				return;
			}
			const advisees = await krsService.getAdvisedStudentsKRS(userId);
			res.status(200).json({ data: advisees });
		} catch (error) {
			next(error);
		}
	}
}

export const krsController = new KrsController();
