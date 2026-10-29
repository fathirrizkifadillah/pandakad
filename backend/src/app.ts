import { Role } from "@prisma/client";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { docsRouter } from "./docs/docs.routes.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { authenticate, requireRole } from "./middlewares/auth.js";
import { errorHandler, NotFoundError } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { requestIdMiddleware } from "./middlewares/requestId.js";
import { attendanceRouter } from "./modules/attendance/attendance.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { classesRouter } from "./modules/classes/classes.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { gradesRouter } from "./modules/grades/grades.routes.js";
import { krsRouter } from "./modules/krs/krs.routes.js";
import { masterRouter } from "./modules/master/master.routes.js";
import { reportsRouter } from "./modules/reports/reports.routes.js";

export const app = express();

// Request ID Tracing Middleware
app.use(requestIdMiddleware);

// Security & Header Middlewares (Helmet Hardening dengan CSP untuk Swagger UI)
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: [
					"'self'",
					"'unsafe-inline'",
					"https://unpkg.com",
					"https://cdn.jsdelivr.net",
				],
				styleSrc: [
					"'self'",
					"'unsafe-inline'",
					"https://unpkg.com",
					"https://cdn.jsdelivr.net",
					"https://fonts.googleapis.com",
				],
				fontSrc: ["'self'", "https://fonts.gstatic.com"],
				imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
			},
		},
		crossOriginEmbedderPolicy: false,
	}),
);
app.use(
	cors({
		origin: env.CORS_ORIGIN,
		credentials: true,
	}),
);

// Body and Cookie Parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser(env.SESSION_SECRET));

// Request Logging (Pino HTTP)
if (env.NODE_ENV !== "test") {
	app.use(
		pinoHttp({
			logger,
			customLogLevel: (_req, res, err) => {
				if (res.statusCode >= 500 || err) return "error";
				if (res.statusCode >= 400) return "warn";
				return "info";
			},
		}),
	);
}

// Health Check Endpoint
const handleHealth = async (_req: Request, res: Response) => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		res.status(200).json({
			status: "ok",
			service: "pandakad-backend",
			timestamp: new Date().toISOString(),
			database: "connected",
			uptime: process.uptime(),
		});
	} catch (error) {
		res.status(503).json({
			status: "degraded",
			service: "pandakad-backend",
			timestamp: new Date().toISOString(),
			database: "disconnected",
			error: error instanceof Error ? error.message : "Database error",
		});
	}
};

app.get("/health", handleHealth);
app.get("/api/v1/health", handleHealth);

// Dokumentasi Interaktif OpenAPI 3.1 & Swagger UI (/docs dan /api/v1/openapi.json)
app.use(docsRouter);
app.use("/api/v1", docsRouter);

// Global Rate Limiting untuk seluruh endpoint /api/v1 (Kecuali mode test)
app.use("/api/v1", apiLimiter);

// API v1 Modules
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/master", masterRouter);
app.use("/api/v1/classes", classesRouter);
app.use("/api/v1/krs", krsRouter);
app.use("/api/v1/grades", gradesRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/reports", reportsRouter);

// Test Endpoints for RBAC Verification (Hanya aktif pada mode test)
if (env.NODE_ENV === "test") {
	app.get(
		"/api/v1/test/admin-only",
		authenticate,
		requireRole(Role.Admin),
		(_req: Request, res: Response) => {
			res.status(200).json({ data: { message: "Khusus Admin Terbuka" } });
		},
	);
}

// 404 Handler for undefined routes
app.use((req: Request, _res: Response) => {
	throw new NotFoundError(
		`Route endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
	);
});

// Centralized Error Handling Middleware
app.use(errorHandler);
