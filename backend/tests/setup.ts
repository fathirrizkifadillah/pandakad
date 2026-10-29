import { afterAll, beforeAll } from "vitest";
import { prisma } from "../src/lib/prisma.js";

beforeAll(async () => {
	// Connect prisma before running tests
	try {
		await prisma.$connect();
	} catch {
		// Ignore if database is not reachable during unit mock tests
	}
});

afterAll(async () => {
	// Disconnect prisma after running tests
	try {
		await prisma.$disconnect();
	} catch {
		// Ignore
	}
});
