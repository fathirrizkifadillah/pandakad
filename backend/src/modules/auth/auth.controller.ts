import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.js";
import { loginSchema } from "./auth.schema.js";
import { authService } from "./auth.service.js";

export class AuthController {
	/**
	 * POST /api/v1/auth/login
	 */
	async login(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const validatedInput = loginSchema.parse(req.body);
			const { user, sessionId } = await authService.login(validatedInput);

			// Pasang Signed Cookie HttpOnly
			const cookieMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 hari
			res.cookie("sessionId", sessionId, {
				httpOnly: true,
				signed: true,
				sameSite: "lax",
				secure: env.NODE_ENV === "production",
				maxAge: cookieMaxAge,
				path: "/",
			});

			res.status(200).json({
				data: {
					user,
					sessionId, // Disertakan juga di payload data untuk fleksibilitas client non-browser
				},
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * POST /api/v1/auth/logout
	 */
	async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const sessionId =
				req.sessionId || req.signedCookies?.sessionId || req.cookies?.sessionId;

			if (sessionId) {
				await authService.logout(sessionId);
			}

			res.clearCookie("sessionId", { path: "/" });
			res.status(200).json({
				data: {
					message: "Berhasil keluar dari sesi portal akademik UNPANDA.",
				},
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /api/v1/auth/me
	 */
	async me(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			res.status(200).json({
				data: {
					user: req.user,
				},
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /api/v1/auth/users (Admin only)
	 */
	async listUsers(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { role, search } = req.query as {
				role?: string;
				search?: string;
			};
			const users = await authService.listUsers(role, search);
			res.status(200).json({ data: users });
		} catch (error) {
			next(error);
		}
	}
}

export const authController = new AuthController();
