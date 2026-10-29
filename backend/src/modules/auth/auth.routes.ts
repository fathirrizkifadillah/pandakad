import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { authenticate } from "../../middlewares/auth.js";
import { authController } from "./auth.controller.js";

export const authRouter = Router();

// Rate limiter khusus endpoint login untuk mencegah brute-force attacks
const loginRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 menit
	max: env.NODE_ENV === "test" ? 1000 : 10, // 10 percobaan per 15 menit pada dev/prod
	skipSuccessfulRequests: true,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		error: {
			code: "TOO_MANY_REQUESTS",
			message:
				"Terlalu banyak percobaan masuk yang gagal. Silakan coba lagi setelah 15 menit.",
		},
	},
});

// Endpoint Autentikasi
authRouter.post("/login", loginRateLimiter, (req, res, next) =>
	authController.login(req, res, next),
);

authRouter.post("/logout", authenticate, (req, res, next) =>
	authController.logout(req, res, next),
);

authRouter.get("/me", authenticate, (req, res, next) =>
	authController.me(req, res, next),
);
