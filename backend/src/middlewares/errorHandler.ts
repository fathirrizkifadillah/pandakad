import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly details?: unknown;
	public readonly isOperational: boolean;

	constructor(
		message: string,
		statusCode = 500,
		code = "INTERNAL_SERVER_ERROR",
		details?: unknown,
	) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
		this.isOperational = true;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource tidak ditemukan", details?: unknown) {
		super(message, 404, "NOT_FOUND", details);
	}
}

export class ConflictError extends AppError {
	constructor(message = "Terjadi konflik data", details?: unknown) {
		super(message, 409, "CONFLICT", details);
	}
}

export class UnauthorizedError extends AppError {
	constructor(
		message = "Autentikasi gagal atau sesi telah berakhir",
		details?: unknown,
	) {
		super(message, 401, "UNAUTHORIZED", details);
	}
}

export class ForbiddenError extends AppError {
	constructor(
		message = "Anda tidak memiliki hak akses untuk tindakan ini",
		details?: unknown,
	) {
		super(message, 403, "FORBIDDEN", details);
	}
}

export class BadRequestError extends AppError {
	constructor(message = "Permintaan tidak valid", details?: unknown) {
		super(message, 400, "BAD_REQUEST", details);
	}
}

export function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	// 1. Tangani Zod Validation Error
	if (err instanceof ZodError) {
		res.status(400).json({
			error: {
				code: "VALIDATION_ERROR",
				message: "Validasi data gagal",
				details: err.flatten().fieldErrors,
			},
		});
		return;
	}

	// 2. Tangani Kesalahan Prisma ORM
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		// P2002: Unique constraint violation
		if (err.code === "P2002") {
			const target = (err.meta?.target as string[])?.join(", ") || "field";
			res.status(409).json({
				error: {
					code: "CONFLICT",
					message: `Data dengan ${target} tersebut sudah ada di sistem.`,
				},
			});
			return;
		}

		// P2025: Record to update/delete not found
		if (err.code === "P2025") {
			res.status(404).json({
				error: {
					code: "NOT_FOUND",
					message: "Data target tidak ditemukan.",
				},
			});
			return;
		}
	}

	// 3. Tangani Operational AppError
	if (err instanceof AppError) {
		if (err.statusCode >= 500) {
			logger.error({ err, path: req.path }, err.message);
		}
		res.status(err.statusCode).json({
			error: {
				code: err.code,
				message: err.message,
				details: err.details,
			},
		});
		return;
	}

	// 4. Tangani Unexpected Internal Error
	logger.error({ err, path: req.path }, "Unhandled Exception");
	res.status(500).json({
		error: {
			code: "INTERNAL_SERVER_ERROR",
			message: "Terjadi kesalahan internal pada server",
		},
	});
}
