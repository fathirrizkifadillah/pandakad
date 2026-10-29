import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Pembatas laju permintaan global untuk seluruh endpoint API.
 * Mencegah serangan Denial of Service (DoS) dan automated scraping berlebih.
 */
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // Jendela waktu 15 menit
	limit: 500, // Batas 500 request per 15 menit per IP
	standardHeaders: true, // Kembalikan header standar RateLimit-*
	legacyHeaders: false,
	skip: () => env.NODE_ENV === "test", // Lewati saat unit/integration test
	message: {
		error: {
			code: "TOO_MANY_REQUESTS",
			message:
				"Batas laju permintaan terlampaui. Silakan coba kembali dalam beberapa saat.",
		},
	},
});

/**
 * Pembatas laju khusus untuk rute sensitif autentikasi (Login).
 * Mencegah serangan brute-force password dan credential stuffing.
 */
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // Jendela waktu 15 menit
	limit: 15, // Batas 15 percobaan login per 15 menit per IP
	standardHeaders: true,
	legacyHeaders: false,
	skip: () => env.NODE_ENV === "test",
	message: {
		error: {
			code: "TOO_MANY_REQUESTS",
			message:
				"Terlalu banyak percobaan masuk. Demi keamanan akun, silakan tunggu 15 menit sebelum mencoba kembali.",
		},
	},
});
