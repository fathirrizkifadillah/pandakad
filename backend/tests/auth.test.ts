import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

describe("Milestone 1: Authentication & RBAC Suite", () => {
	describe("Input Validation & Error Handling", () => {
		it("harus menolak request login tanpa body dengan status 400 VALIDATION_ERROR", async () => {
			const res = await request(app).post("/api/v1/auth/login").send({});

			expect(res.status).toBe(400);
			expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
		});

		it("harus menolak login dengan role tidak dikenal dengan status 400", async () => {
			const res = await request(app).post("/api/v1/auth/login").send({
				identifier: "22010189",
				password: "Password123!",
				role: "SuperUserBukanRoleValid",
			});

			expect(res.status).toBe(400);
			expect(res.body.error.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("Kredensial & Anti-Enumeration", () => {
		it("harus mengembalikan 401 generic ketika NIM tidak terdaftar di sistem", async () => {
			const res = await request(app).post("/api/v1/auth/login").send({
				identifier: "99999999",
				password: "Panda2026!",
				role: "Mahasiswa",
			});

			expect(res.status).toBe(401);
			expect(res.body.error.code).toBe("UNAUTHORIZED");
			expect(res.body.error.message).toContain(
				"NIM/NIP atau kata sandi tidak valid",
			);
		});

		it("harus mengembalikan 401 generic ketika kata sandi salah", async () => {
			const res = await request(app).post("/api/v1/auth/login").send({
				identifier: "22010189",
				password: "PasswordSalahBanget!",
				role: "Mahasiswa",
			});

			expect(res.status).toBe(401);
			expect(res.body.error.code).toBe("UNAUTHORIZED");
		});

		it("harus mengembalikan 401 generic jika akun mahasiswa mencoba login memilih role Dosen", async () => {
			const res = await request(app).post("/api/v1/auth/login").send({
				identifier: "22010189",
				password: "Panda2026!",
				role: "Dosen", // Role salah
			});

			expect(res.status).toBe(401);
			expect(res.body.error.code).toBe("UNAUTHORIZED");
		});
	});

	describe("Login Berhasil, Cookie Sesi, dan /me", () => {
		let mahasiswaCookie = "";
		let mahasiswaSessionId = "";

		it("Mahasiswa berhasil login dengan kredensial valid dan menerima signed cookie", async () => {
			const res = await request(app).post("/api/v1/auth/login").send({
				identifier: "22010189",
				password: "Panda2026!",
				role: "Mahasiswa",
			});

			expect(res.status).toBe(200);
			expect(res.body.data).toHaveProperty("user");
			expect(res.body.data.user).toMatchObject({
				identifier: "22010189",
				name: "Arya Wicaksana",
				role: "Mahasiswa",
			});
			// Pastikan passwordHash TIDAK pernah bocor ke client
			expect(res.body.data.user).not.toHaveProperty("passwordHash");

			// Pastikan cookie sessionId diset
			const cookies = res.headers["set-cookie"] as string[] | undefined;
			expect(cookies).toBeDefined();
			const sessionCookie = cookies?.find((c: string) =>
				c.startsWith("sessionId="),
			);
			expect(sessionCookie).toBeDefined();
			expect(sessionCookie).toContain("HttpOnly");

			mahasiswaCookie = sessionCookie || "";
			mahasiswaSessionId = res.body.data.sessionId;
		});

		it("GET /api/v1/auth/me tanpa cookie harus ditolak 401 UNAUTHORIZED", async () => {
			const res = await request(app).get("/api/v1/auth/me");
			expect(res.status).toBe(401);
			expect(res.body.error.code).toBe("UNAUTHORIZED");
		});

		it("GET /api/v1/auth/me dengan cookie sesi valid harus mengembalikan profil 200 OK", async () => {
			expect(mahasiswaCookie).not.toBe("");
			const res = await request(app)
				.get("/api/v1/auth/me")
				.set("Cookie", mahasiswaCookie);

			expect(res.status).toBe(200);
			expect(res.body.data.user).toMatchObject({
				identifier: "22010189",
				name: "Arya Wicaksana",
				role: "Mahasiswa",
			});
		});

		it("GET /api/v1/auth/me dengan Authorization Bearer token sessionId harus berhasil", async () => {
			const res = await request(app)
				.get("/api/v1/auth/me")
				.set("Authorization", `Bearer ${mahasiswaSessionId}`);

			expect(res.status).toBe(200);
			expect(res.body.data.user.identifier).toBe("22010189");
		});
	});

	describe("Pengujian Otorisasi Berbasis Peran (RBAC)", () => {
		let adminSessionId = "";
		let mahasiswaSessionId = "";

		beforeAll(async () => {
			// Login Admin
			const adminRes = await request(app).post("/api/v1/auth/login").send({
				identifier: "ADM001",
				password: "Panda2026!",
				role: "Admin",
			});
			adminSessionId = adminRes.body.data.sessionId;

			// Login Mahasiswa
			const mhsRes = await request(app).post("/api/v1/auth/login").send({
				identifier: "22010189",
				password: "Panda2026!",
				role: "Mahasiswa",
			});
			mahasiswaSessionId = mhsRes.body.data.sessionId;
		});

		it("Mahasiswa mencoba mengakses rute Admin harus ditolak dengan status 403 FORBIDDEN", async () => {
			const res = await request(app)
				.get("/api/v1/test/admin-only")
				.set("Authorization", `Bearer ${mahasiswaSessionId}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
			expect(res.body.error.message).toContain("Akses ditolak");
		});

		it("Admin mengakses rute Admin harus diizinkan dengan status 200 OK", async () => {
			const res = await request(app)
				.get("/api/v1/test/admin-only")
				.set("Authorization", `Bearer ${adminSessionId}`);

			expect(res.status).toBe(200);
			expect(res.body.data.message).toBe("Khusus Admin Terbuka");
		});
	});

	describe("Logout & Invalidation Sesi", () => {
		it("Logout harus menghapus record session di database dan membersihkan cookie", async () => {
			// Login dulu untuk mendapatkan session segar
			const loginRes = await request(app).post("/api/v1/auth/login").send({
				identifier: "198503152010121002",
				password: "Panda2026!",
				role: "Dosen",
			});
			const sessionId = loginRes.body.data.sessionId;
			const cookies = loginRes.headers["set-cookie"] as string[] | undefined;
			const cookie = cookies?.find((c: string) => c.startsWith("sessionId="));

			expect(cookie).toBeDefined();

			// Pastikan session ada di database
			const dbSessionBefore = await prisma.session.findUnique({
				where: { id: sessionId },
			});
			expect(dbSessionBefore).not.toBeNull();

			// Lakukan Logout
			const logoutRes = await request(app)
				.post("/api/v1/auth/logout")
				.set("Cookie", cookie || "");

			expect(logoutRes.status).toBe(200);
			expect(logoutRes.body.data.message).toContain("Berhasil keluar");

			// Pastikan session di database sudah terhapus
			const dbSessionAfter = await prisma.session.findUnique({
				where: { id: sessionId },
			});
			expect(dbSessionAfter).toBeNull();

			// Mencoba akses /me lagi dengan session yang sudah logout harus gagal 401
			const meRes = await request(app)
				.get("/api/v1/auth/me")
				.set("Cookie", cookie || "");

			expect(meRes.status).toBe(401);
		});
	});
});
