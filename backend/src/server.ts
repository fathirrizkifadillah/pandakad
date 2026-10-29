import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
	logger.info(
		`🚀 Server PANDAKAD Backend berjalan pada http://localhost:${env.PORT} [mode: ${env.NODE_ENV}]`,
	);
});

// Graceful Shutdown Handlers
const handleShutdown = async (signal: string) => {
	logger.info(
		`Menerima sinyal ${signal}. Menutup koneksi database dan server HTTP secara anggun...`,
	);
	server.close(async () => {
		try {
			await prisma.$disconnect();
			logger.info("Koneksi database terputus. Server selesai dihentikan.");
			process.exit(0);
		} catch (error) {
			logger.error(
				{ error },
				"Gagal memutuskan koneksi database saat shutdown",
			);
			process.exit(1);
		}
	});
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
