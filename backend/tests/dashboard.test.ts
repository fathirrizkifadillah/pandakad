import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

describe("Milestone 7: Dashboard Metrik & Agregasi Suite", () => {
	let adminToken = "";
	let dosenBudiToken = "";
	let mahasiswaAryaToken = "";
	let activeTermId = "";

	beforeAll(async () => {
		// 1. Dapatkan term aktif
		const activeTerm = await prisma.academicTerm.findFirst({
			where: { isActive: true },
		});
		if (activeTerm) {
			activeTermId = activeTerm.id;
		}

		// 2. Login Admin
		const adminRes = await request(app).post("/api/v1/auth/login").send({
			identifier: "ADM001",
			password: "Panda2026!",
			role: "Admin",
		});
		adminToken = adminRes.body.data.sessionId;

		// 3. Login Dosen Budi
		const budiRes = await request(app).post("/api/v1/auth/login").send({
			identifier: "198503152010121002",
			password: "Panda2026!",
			role: "Dosen",
		});
		dosenBudiToken = budiRes.body.data.sessionId;

		// 4. Login Mahasiswa Arya
		const aryaRes = await request(app).post("/api/v1/auth/login").send({
			identifier: "22010189",
			password: "Panda2026!",
			role: "Mahasiswa",
		});
		mahasiswaAryaToken = aryaRes.body.data.sessionId;
	});

	describe("GET /api/v1/dashboard/admin", () => {
		it("Admin berhasil mengambil ringkasan statistik kampus lengkap", async () => {
			const res = await request(app)
				.get("/api/v1/dashboard/admin")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			const { data } = res.body;

			// Periksa struktur activePeriod
			expect(data.activePeriod).toBeDefined();
			expect(data.activePeriod.id).toBe(activeTermId);
			expect(data.activePeriod.code).toBeDefined();

			// Periksa struktur stats
			expect(data.stats).toBeDefined();
			expect(data.stats.totalStudents).toBeGreaterThan(0);
			expect(data.stats.totalLecturers).toBeGreaterThan(0);
			expect(data.stats.totalCourses).toBeGreaterThan(0);
			expect(data.stats.totalClasses).toBeGreaterThan(0);
			expect(data.stats.totalRooms).toBeGreaterThan(0);
			expect(data.stats.totalUsers).toBeGreaterThan(0);
			expect(typeof data.stats.occupancyRate).toBe("number");
			expect(data.stats.krsOverview).toBeDefined();

			// Periksa daftar program studi
			expect(Array.isArray(data.studyPrograms)).toBe(true);
			expect(data.studyPrograms.length).toBeGreaterThan(0);
			expect(data.studyPrograms[0]).toHaveProperty("code");
			expect(data.studyPrograms[0]).toHaveProperty("studentCount");
		});

		it("Mahasiswa ditolak (403 Forbidden) saat mengakses dashboard admin", async () => {
			const res = await request(app)
				.get("/api/v1/dashboard/admin")
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});

		it("Dosen ditolak (403 Forbidden) saat mengakses dashboard admin", async () => {
			const res = await request(app)
				.get("/api/v1/dashboard/admin")
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});

		it("Request tanpa autentikasi ditolak (401 Unauthorized)", async () => {
			const res = await request(app).get("/api/v1/dashboard/admin");
			expect(res.status).toBe(401);
		});
	});

	describe("GET /api/v1/dashboard/lecturer", () => {
		it("Dosen berhasil mengambil data ringkasan kelas, bimbingan, dan jadwal mengajar", async () => {
			const res = await request(app)
				.get("/api/v1/dashboard/lecturer?day=Senin")
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			const { data } = res.body;

			// Periksa data dosen
			expect(data.lecturer).toBeDefined();
			expect(data.lecturer.nidn).toBe("0615038501");
			expect(data.lecturer.name).toContain("Budi Santoso");

			// Periksa statistik pengajaran
			expect(data.stats).toBeDefined();
			expect(data.stats.totalClasses).toBeGreaterThanOrEqual(1);
			expect(typeof data.stats.totalStudents).toBe("number");
			expect(typeof data.stats.pendingKrsApprovals).toBe("number");
			expect(typeof data.stats.gradingCompleteness).toBe("number");

			// Periksa jadwal hari ini
			expect(data.todaySchedule).toBeDefined();
			expect(data.todaySchedule.day).toBe("Senin");
			expect(Array.isArray(data.todaySchedule.sessions)).toBe(true);

			// Periksa daftar kelas yang diampu
			expect(Array.isArray(data.classes)).toBe(true);
			expect(data.classes.length).toBeGreaterThanOrEqual(1);
		});

		it("Mahasiswa ditolak (403 Forbidden) saat mengakses dashboard dosen", async () => {
			const res = await request(app)
				.get("/api/v1/dashboard/lecturer")
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});
	});

	describe("GET /api/v1/dashboard/student", () => {
		it("Mahasiswa berhasil mengambil data IPK, SKS berjalan, jadwal, dan status presensi", async () => {
			const res = await request(app)
				.get("/api/v1/dashboard/student?day=Senin")
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			const { data } = res.body;

			// Periksa identitas mahasiswa
			expect(data.student).toBeDefined();
			expect(data.student.nim).toBe("22010189");
			expect(data.student.name).toContain("Arya");
			expect(data.student.prodi).toBeDefined();

			// Periksa metrik akademik
			expect(data.stats).toBeDefined();
			expect(typeof data.stats.gpa).toBe("number");
			expect(typeof data.stats.totalSksPassed).toBe("number");
			expect(typeof data.stats.currentSemesterSks).toBe("number");
			expect(typeof data.stats.overallAttendancePercentage).toBe("number");
			expect(typeof data.stats.isEligibleForUas).toBe("boolean");

			// Periksa jadwal hari ini
			expect(data.todaySchedule).toBeDefined();
			expect(data.todaySchedule.day).toBe("Senin");
			expect(Array.isArray(data.todaySchedule.sessions)).toBe(true);

			// Periksa ringkasan kelas yang diambil
			expect(Array.isArray(data.enrolledClasses)).toBe(true);
		});

		it("Request tanpa autentikasi ditolak (401 Unauthorized)", async () => {
			const res = await request(app).get("/api/v1/dashboard/student");
			expect(res.status).toBe(401);
		});
	});
});
