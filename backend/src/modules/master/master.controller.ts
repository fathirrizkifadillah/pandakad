import type { NextFunction, Request, Response } from "express";
import {
	academicTermSchema,
	courseSchema,
	updateSettingsSchema,
} from "./master.schema.js";
import { masterService } from "./master.service.js";

export class MasterController {
	// Pengaturan Institusi
	async getSettings(_req: Request, res: Response, next: NextFunction) {
		try {
			const settings = await masterService.getSettings();
			res.status(200).json({ data: settings });
		} catch (error) {
			next(error);
		}
	}

	async updateSettings(req: Request, res: Response, next: NextFunction) {
		try {
			const validated = updateSettingsSchema.parse(req.body);
			const updated = await masterService.updateSettings(validated);
			res.status(200).json({ data: updated });
		} catch (error) {
			next(error);
		}
	}

	// Periode Akademik
	async getTerms(_req: Request, res: Response, next: NextFunction) {
		try {
			const terms = await masterService.getTerms();
			res.status(200).json({ data: terms });
		} catch (error) {
			next(error);
		}
	}

	async getActiveTerm(_req: Request, res: Response, next: NextFunction) {
		try {
			const activeTerm = await masterService.getActiveTerm();
			res.status(200).json({ data: activeTerm });
		} catch (error) {
			next(error);
		}
	}

	async createTerm(req: Request, res: Response, next: NextFunction) {
		try {
			const validated = academicTermSchema.parse(req.body);
			const created = await masterService.createTerm(validated);
			res.status(201).json({ data: created });
		} catch (error) {
			next(error);
		}
	}

	async activateTerm(req: Request, res: Response, next: NextFunction) {
		try {
			const activated = await masterService.activateTerm(req.params.id);
			res.status(200).json({ data: activated });
		} catch (error) {
			next(error);
		}
	}

	// Program Studi
	async getPrograms(_req: Request, res: Response, next: NextFunction) {
		try {
			const programs = await masterService.getStudyPrograms();
			res.status(200).json({ data: programs });
		} catch (error) {
			next(error);
		}
	}

	// Gedung & Ruangan
	async getBuildings(_req: Request, res: Response, next: NextFunction) {
		try {
			const buildings = await masterService.getBuildings();
			res.status(200).json({ data: buildings });
		} catch (error) {
			next(error);
		}
	}

	async getRooms(req: Request, res: Response, next: NextFunction) {
		try {
			const buildingId = req.query.buildingId as string | undefined;
			const rooms = await masterService.getRooms(buildingId);
			res.status(200).json({ data: rooms });
		} catch (error) {
			next(error);
		}
	}

	// Mata Kuliah
	async getCourses(req: Request, res: Response, next: NextFunction) {
		try {
			const { studyProgramId, semester, search } = req.query;
			const courses = await masterService.getCourses({
				studyProgramId: studyProgramId as string | undefined,
				semester: semester ? Number(semester) : undefined,
				search: search as string | undefined,
			});
			res.status(200).json({ data: courses });
		} catch (error) {
			next(error);
		}
	}

	async createCourse(req: Request, res: Response, next: NextFunction) {
		try {
			const validated = courseSchema.parse(req.body);
			const course = await masterService.createCourse(validated);
			res.status(201).json({ data: course });
		} catch (error) {
			next(error);
		}
	}
}

export const masterController = new MasterController();
