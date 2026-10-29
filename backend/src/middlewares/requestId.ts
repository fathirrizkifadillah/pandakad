import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
	namespace Express {
		interface Request {
			id?: string;
		}
	}
}

/**
 * Middleware untuk menelusuri setiap HTTP request dengan ID unik (X-Request-Id).
 * Memudahkan pelacakan audit log dan debugging lintas service.
 */
export function requestIdMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const requestId = (req.headers["x-request-id"] as string) || randomUUID();
	req.id = requestId;
	res.setHeader("X-Request-Id", requestId);
	next();
}
