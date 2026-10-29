import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { authService } from "../modules/auth/auth.service.js";
import { ForbiddenError, UnauthorizedError } from "./errorHandler.js";

/**
 * Middleware untuk memverifikasi autentikasi sesi pengguna melalui cookie bertanda tangan (signed cookie)
 * atau Authorization header Bearer token sebagai fallback.
 */
export async function authenticate(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		// 1. Ekstrak sessionId dari signed cookies atau regular cookies
		let sessionId = req.signedCookies?.sessionId || req.cookies?.sessionId;

		// 2. Fallback untuk Authorization header Bearer token (bermanfaat saat automated testing / mobile)
		if (!sessionId && req.headers.authorization?.startsWith("Bearer ")) {
			sessionId = req.headers.authorization.slice(7).trim();
		}

		if (!sessionId) {
			throw new UnauthorizedError(
				"Sesi Anda belum terautentikasi. Silakan masuk terlebih dahulu.",
			);
		}

		// 3. Validasi session ke database
		const user = await authService.validateSession(sessionId);
		if (!user) {
			res.clearCookie("sessionId");
			throw new UnauthorizedError(
				"Sesi login Anda tidak valid atau telah kedaluwarsa.",
			);
		}

		// 4. Lampirkan user dan sessionId ke objek Request
		req.user = user;
		req.sessionId = sessionId;
		next();
	} catch (error) {
		next(error);
	}
}

/**
 * Middleware Otorisasi Berbasis Peran (RBAC).
 * Memeriksa apakah role pengguna yang sedang login termasuk dalam daftar peran yang diizinkan.
 */
export function requireRole(...allowedRoles: Role[]) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!req.user) {
			next(new UnauthorizedError("Pengguna belum diautentikasi."));
			return;
		}

		if (!allowedRoles.includes(req.user.role)) {
			next(
				new ForbiddenError(
					`Akses ditolak: Resource ini hanya dapat diakses oleh peran: [${allowedRoles.join(
						", ",
					)}]. Peran Anda saat ini: ${req.user.role}`,
				),
			);
			return;
		}

		next();
	};
}
