import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env (both cwd and backend root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().default(5000),
	DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
	SESSION_SECRET: z
		.string()
		.min(32, "SESSION_SECRET minimal 32 karakter demi keamanan"),
	CORS_ORIGIN: z.string().default("http://localhost:3000"),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error(
		"❌ Konfigurasi Environment Tidak Valid:",
		JSON.stringify(parsed.error.format(), null, 2),
	);
	process.exit(1);
}

export const env = parsed.data;
