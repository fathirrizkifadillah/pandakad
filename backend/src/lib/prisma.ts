import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

declare global {
	var __prismaClient: PrismaClient | undefined;
}

export const prisma =
	global.__prismaClient ||
	new PrismaClient({
		log:
			env.NODE_ENV === "development"
				? [
						{ emit: "event", level: "query" },
						{ emit: "stdout", level: "error" },
						{ emit: "stdout", level: "warn" },
					]
				: [{ emit: "stdout", level: "error" }],
	});

if (env.NODE_ENV === "development") {
	global.__prismaClient = prisma;

	// In Prisma, event based logging needs explicit casting via Prisma.QueryEvent or type narrowing
	type QueryEvent = {
		query: string;
		params: string;
		duration: number;
		target: string;
	};

	type PrismaClientWithEvents = PrismaClient & {
		$on(event: "query", callback: (e: QueryEvent) => void): void;
	};

	(prisma as unknown as PrismaClientWithEvents).$on?.(
		"query",
		(e: QueryEvent) => {
			if (e.duration > 200) {
				logger.warn(
					{ query: e.query, duration: `${e.duration}ms` },
					"Query Lambat Terdeteksi",
				);
			}
		},
	);
}
