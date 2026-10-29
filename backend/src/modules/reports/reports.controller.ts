import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../middlewares/errorHandler.js";
import {
	academicSummaryQuerySchema,
	classReportParamSchema,
} from "./reports.schema.js";
import { reportsService } from "./reports.service.js";

export class ReportsController {
	async exportGradesCsv(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			const role = req.user?.role;
			if (!userId || !role) {
				throw new UnauthorizedError("Sesi Anda belum terautentikasi");
			}

			const { classId } = classReportParamSchema.parse(req.params);
			const { filename, csvContent } = await reportsService.exportGradesCsv(
				classId,
				userId,
				role,
			);

			res.setHeader("Content-Type", "text/csv; charset=utf-8");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${filename}"`,
			);
			res.status(200).send(csvContent);
		} catch (error) {
			next(error);
		}
	}

	async exportAttendanceCsv(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			const role = req.user?.role;
			if (!userId || !role) {
				throw new UnauthorizedError("Sesi Anda belum terautentikasi");
			}

			const { classId } = classReportParamSchema.parse(req.params);
			const { filename, csvContent } = await reportsService.exportAttendanceCsv(
				classId,
				userId,
				role,
			);

			res.setHeader("Content-Type", "text/csv; charset=utf-8");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${filename}"`,
			);
			res.status(200).send(csvContent);
		} catch (error) {
			next(error);
		}
	}

	async getAcademicSummary(req: Request, res: Response, next: NextFunction) {
		try {
			const query = academicSummaryQuerySchema.parse(req.query);
			const data = await reportsService.getAcademicSummaryReport(query.termId);

			res.status(200).json({
				status: "success",
				data,
			});
		} catch (error) {
			next(error);
		}
	}
}

export const reportsController = new ReportsController();
