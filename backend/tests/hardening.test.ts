import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("Milestone 8: Hardening & OpenAPI Documentation Suite", () => {
	describe("Security Headers & Request Tracing (Helmet + RequestId)", () => {
		it("Setiap request harus mengembalikan header X-Request-Id unik", async () => {
			const res = await request(app).get("/health");

			expect(res.status).toBe(200);
			expect(res.headers["x-request-id"]).toBeDefined();
			expect(typeof res.headers["x-request-id"]).toBe("string");
			expect(res.headers["x-request-id"].length).toBeGreaterThan(10);
		});

		it("Header keamanan Helmet harus aktif pada seluruh respons", async () => {
			const res = await request(app).get("/health");

			// X-Content-Type-Options: nosniff
			expect(res.headers["x-content-type-options"]).toBe("nosniff");
			// X-Frame-Options / Frameguard
			expect(res.headers["x-frame-options"]).toBeDefined();
			// X-Powered-By harus disembunyikan
			expect(res.headers["x-powered-by"]).toBeUndefined();
		});

		it("Klien dapat menyertakan custom X-Request-Id dan server akan melestarikannya", async () => {
			const customId = "custom-trace-uuid-12345";
			const res = await request(app)
				.get("/health")
				.set("X-Request-Id", customId);

			expect(res.headers["x-request-id"]).toBe(customId);
		});
	});

	describe("OpenAPI 3.1 Specification & Swagger UI (/docs)", () => {
		it("GET /api/v1/openapi.json mengembalikan spesifikasi OpenAPI 3.1.0 valid", async () => {
			const res = await request(app).get("/api/v1/openapi.json");

			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toContain("application/json");

			const spec = res.body;
			expect(spec.openapi).toBe("3.1.0");
			expect(spec.info).toBeDefined();
			expect(spec.info.title).toContain("PANDAKAD REST API");
			expect(spec.paths).toBeDefined();
			expect(spec.paths["/api/v1/auth/login"]).toBeDefined();
			expect(spec.paths["/api/v1/krs/enroll"]).toBeDefined();
			expect(spec.paths["/api/v1/grades/batch"]).toBeDefined();
			expect(spec.paths["/api/v1/attendance/session"]).toBeDefined();
			expect(spec.paths["/api/v1/reports/grades/{classId}/csv"]).toBeDefined();
			expect(spec.components.securitySchemes.SessionCookie).toBeDefined();
		});

		it("GET /docs mengembalikan portal dokumentasi Swagger UI interaktif (HTML)", async () => {
			const res = await request(app).get("/docs");

			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toContain("text/html");
			expect(res.text).toContain("PANDAKAD API Documentation");
			expect(res.text).toContain("swagger-ui");
			expect(res.text).toContain("/api/v1/openapi.json");
		});

		it("GET /api/v1/docs juga mengembalikan portal Swagger UI interaktif (HTML)", async () => {
			const res = await request(app).get("/api/v1/docs");

			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toContain("text/html");
			expect(res.text).toContain("PANDAKAD API Documentation");
		});
	});
});
