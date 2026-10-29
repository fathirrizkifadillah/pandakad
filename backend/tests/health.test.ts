import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("Health Check Endpoint", () => {
	it("GET /health should return 200 with database connected", async () => {
		const response = await request(app).get("/health");
		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			status: "ok",
			service: "pandakad-backend",
			database: "connected",
		});
		expect(response.body).toHaveProperty("timestamp");
		expect(response.body).toHaveProperty("uptime");
	});

	it("GET /api/v1/health should return identical 200 health payload", async () => {
		const response = await request(app).get("/api/v1/health");
		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			status: "ok",
			service: "pandakad-backend",
			database: "connected",
		});
	});

	it("GET /api/v1/non-existent-route should return 404 with standard error envelope", async () => {
		const response = await request(app).get("/api/v1/non-existent-route");
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty("error");
		expect(response.body.error).toHaveProperty("code", "NOT_FOUND");
	});
});
