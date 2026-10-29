import type { NextFunction, Request, Response } from "express";
import { createClassSchema } from "./classes.schema.js";
import { classesService } from "./classes.service.js";

export class ClassesController {
	async getClasses(req: Request, res: Response, next: NextFunction) {
		try {
			const { termId, studyProgramId, courseId, lecturerId, search } =
				req.query;
			const classes = await classesService.getClasses({
				termId: termId as string | undefined,
				studyProgramId: studyProgramId as string | undefined,
				courseId: courseId as string | undefined,
				lecturerId: lecturerId as string | undefined,
				search: search as string | undefined,
			});
			res.status(200).json({ data: classes });
		} catch (error) {
			next(error);
		}
	}

	async getClassById(req: Request, res: Response, next: NextFunction) {
		try {
			const cls = await classesService.getClassById(req.params.id);
			res.status(200).json({ data: cls });
		} catch (error) {
			next(error);
		}
	}

	async getLecturerMyClasses(req: Request, res: Response, next: NextFunction) {
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
			const termId = req.query.termId as string | undefined;
			const classes = await classesService.getLecturerClasses(userId, termId);
			res.status(200).json({ data: classes });
		} catch (error) {
			next(error);
		}
	}

	async createClass(req: Request, res: Response, next: NextFunction) {
		try {
			const validated = createClassSchema.parse(req.body);
			const created = await classesService.createClass(validated);
			res.status(201).json({ data: created });
		} catch (error) {
			next(error);
		}
	}

	async deleteClass(req: Request, res: Response, next: NextFunction) {
		try {
			await classesService.deleteClass(req.params.id);
			res.status(200).json({
				data: { message: "Kelas perkuliahan berhasil dihapus." },
			});
		} catch (error) {
			next(error);
		}
	}
}

export const classesController = new ClassesController();
