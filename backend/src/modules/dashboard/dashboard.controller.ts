import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../middlewares/errorHandler.js";
import { dashboardQuerySchema } from "./dashboard.schema.js";
import { dashboardService } from "./dashboard.service.js";

export class DashboardController {
	async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
		try {
			const query = dashboardQuerySchema.parse(req.query);
			const data = await dashboardService.getAdminDashboard(query.termId);

			res.status(200).json({
				status: "success",
				data,
			});
		} catch (error) {
			next(error);
		}
	}

	async getLecturerDashboard(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			if (!userId) {
				throw new UnauthorizedError("Sesi Anda belum terautentikasi");
			}

			const query = dashboardQuerySchema.parse(req.query);
			const data = await dashboardService.getLecturerDashboard(
				userId,
				query.day,
				query.termId,
			);

			res.status(200).json({
				status: "success",
				data,
			});
		} catch (error) {
			next(error);
		}
	}

	async getStudentDashboard(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user?.id;
			if (!userId) {
				throw new UnauthorizedError("Sesi Anda belum terautentikasi");
			}

			const query = dashboardQuerySchema.parse(req.query);
			const data = await dashboardService.getStudentDashboard(
				userId,
				query.day,
				query.termId,
			);

			res.status(200).json({
				status: "success",
				data,
			});
		} catch (error) {
			next(error);
		}
	}
}

export const dashboardController = new DashboardController();
