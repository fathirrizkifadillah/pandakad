import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { calculateFinalScore } from "../src/modules/grades/grades.service.js";

describe("Milestone 5: Penilaian, KHS, Transkrip & Audit Log Suite", () => {
	let dosenBudiToken = "";
	let dosenRatnaToken = "";
	let mahasiswaAryaToken = "";
	let adminToken = "";

	let activeTermId = "";
	let budiClassId = "";
	let aryaEnrollmentId = "";
	let aryaGradeId = "";

	beforeAll(async () => {
		// 1. Pastikan term aktif membuka periode input nilai
		const activeTerm = await prisma.academicTerm.findFirst({
			where: { isActive: true },
		});
		if (activeTerm) {
			activeTermId = activeTerm.id;
			await prisma.academicTerm.update({
				where: { id: activeTerm.id },
				data: { isGradeInputOpen: true },
			});
		}

		// 2. Login Dosen Budi (Dosen pengampu IF3101-A)
		const budiLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "198503152010121002",
			password: "Panda2026!",
			role: "Dosen",
		});
		dosenBudiToken = budiLogin.body.data.sessionId;

		// 3. Login Dosen Ratna (Bukan pengampu IF3101-A)
		const ratnaLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "198807202014042001",
			password: "Panda2026!",
			role: "Dosen",
		});
		dosenRatnaToken = ratnaLogin.body.data.sessionId;

		// 4. Login Mahasiswa Arya Wicaksana
		const aryaLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "22010189",
			password: "Panda2026!",
			role: "Mahasiswa",
		});
		mahasiswaAryaToken = aryaLogin.body.data.sessionId;

		// 5. Login Admin
		const adminLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "ADM001",
			password: "Panda2026!",
			role: "Admin",
		});
		adminToken = adminLogin.body.data.sessionId;

		// 6. Dapatkan kelas IF3101-A milik Dosen Budi
		const cls = await prisma.class.findFirst({
			where: { code: "IF3101-A", academicTermId: activeTermId },
		});
		budiClassId = cls?.id || "";

		// 7. Dapatkan enrollment Arya di kelas IF3101-A
		const aryaProfile = await prisma.studentProfile.findUnique({
			where: { nim: "22010189" },
		});
		if (aryaProfile && budiClassId) {
			const en = await prisma.enrollment.upsert({
				where: {
					studentId_classId: {
						studentId: aryaProfile.id,
						classId: budiClassId,
					},
				},
				update: { status: "Approved" },
				create: {
					studentId: aryaProfile.id,
					classId: budiClassId,
					academicTermId: activeTermId,
					status: "Approved",
				},
			});
			aryaEnrollmentId = en.id;
		}
	});

	describe("Formula Perhitungan Nilai (Unit Test)", () => {
		it("Menghitung skor akhir dan huruf mutu sesuai formula 10% Hadir + 20% Tugas + 35% UTS + 35% UAS", () => {
			// Kasus Nilai A (>= 85)
			const resA = calculateFinalScore(100, 90, 85, 90);
			// 10 + 18 + 29.75 + 31.5 = 89.25 -> 89.3
			expect(resA.finalScore).toBe(89.3);
			expect(resA.letterGrade).toBe("A");
			expect(resA.gradePoint).toBe(4.0);

			// Kasus Nilai B+ (>= 75)
			const resBPlus = calculateFinalScore(80, 75, 75, 75);
			// 8 + 15 + 26.25 + 26.25 = 75.5
			expect(resBPlus.finalScore).toBe(75.5);
			expect(resBPlus.letterGrade).toBe("B+");
			expect(resBPlus.gradePoint).toBe(3.5);

			// Kasus Nilai C (>= 55)
			const resC = calculateFinalScore(70, 60, 50, 55);
			// 7 + 12 + 17.5 + 19.25 = 55.75 -> 55.8
			expect(resC.finalScore).toBe(55.8);
			expect(resC.letterGrade).toBe("C");
			expect(resC.gradePoint).toBe(2.0);

			// Kasus Nilai E (< 40)
			const resE = calculateFinalScore(50, 30, 20, 10);
			expect(resE.finalScore).toBe(21.5);
			expect(resE.letterGrade).toBe("E");
			expect(resE.gradePoint).toBe(0.0);
		});
	});

	describe("Otorisasi Penginputan Nilai", () => {
		it("Mahasiswa DITOLAK saat mencoba mengakses input nilai kelas (403 FORBIDDEN)", async () => {
			const res = await request(app)
				.get(`/api/v1/grades/class/${budiClassId}`)
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});

		it("Dosen lain (bukan pengampu) DITOLAK saat mencoba mengakses input nilai kelas (403 FORBIDDEN)", async () => {
			const res = await request(app)
				.get(`/api/v1/grades/class/${budiClassId}`)
				.set("Authorization", `Bearer ${dosenRatnaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
			expect(res.body.error.message).toContain("tidak memiliki akses");
		});

		it("Dosen pengampu dapat melihat daftar mahasiswa untuk dinilai", async () => {
			const res = await request(app)
				.get(`/api/v1/grades/class/${budiClassId}`)
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data).toHaveProperty("classInfo");
			expect(res.body.data.classInfo.code).toBe("IF3101-A");
			expect(Array.isArray(res.body.data.students)).toBe(true);

			const studentArya = res.body.data.students.find(
				(s: { nim: string }) => s.nim === "22010189",
			);
			expect(studentArya).toBeDefined();
		});
	});

	describe("Penyimpanan Nilai Batch (Draft vs Final)", () => {
		it("Dosen menyimpan nilai mahasiswa sebagai Draf (Draft)", async () => {
			const res = await request(app)
				.post("/api/v1/grades/batch")
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					classId: budiClassId,
					status: "Draft",
					grades: [
						{
							enrollmentId: aryaEnrollmentId,
							attendanceScore: 90,
							assignmentScore: 85,
							midtermScore: 80,
							finalExamScore: 88,
							reason: "Input draf nilai tengah semester",
						},
					],
				});

			expect(res.status).toBe(200);
			expect(res.body.data.status).toBe("Draft");

			// Ambil ID Grade yang baru saja dibuat
			const gradeInDb = await prisma.grade.findUnique({
				where: { enrollmentId: aryaEnrollmentId },
			});
			expect(gradeInDb).toBeDefined();
			expect(gradeInDb?.status).toBe("Draft");
			aryaGradeId = gradeInDb?.id || "";
		});

		it("Saat status masih Draft, nilai BELUM muncul di KHS mahasiswa (status 'Belum Rilis')", async () => {
			const res = await request(app)
				.get(`/api/v1/grades/khs?academicTermId=${activeTermId}`)
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(200);
			const if3101Item = res.body.data.items.find(
				(item: { kode: string }) => item.kode === "IF3101",
			);
			expect(if3101Item).toBeDefined();
			expect(if3101Item.statusPublikasi).toBe("Belum Rilis");
			expect(if3101Item.nilaiHuruf).toBe("Belum Rilis");
		});

		it("Dosen memfinalisasi nilai menjadi Final (Dipublikasikan ke Mahasiswa)", async () => {
			const res = await request(app)
				.post("/api/v1/grades/batch")
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					classId: budiClassId,
					status: "Final",
					grades: [
						{
							enrollmentId: aryaEnrollmentId,
							attendanceScore: 95,
							assignmentScore: 90,
							midtermScore: 88,
							finalExamScore: 92,
							reason: "Finalisasi nilai akhir semester oleh dosen pengampu",
						},
					],
				});

			expect(res.status).toBe(200);
			expect(res.body.data.status).toBe("Final");

			// Nilai harus A (9.5 + 18 + 30.8 + 32.2 = 90.5)
			const gradeInDb = await prisma.grade.findUnique({
				where: { enrollmentId: aryaEnrollmentId },
			});
			expect(gradeInDb?.status).toBe("Final");
			expect(gradeInDb?.letterGrade).toBe("A");
		});
	});

	describe("Kartu Hasil Studi (KHS) & Transkrip Akademik Mahasiswa", () => {
		it("Mahasiswa dapat melihat nilai yang sudah Final pada KHS beserta perhitungan IPS", async () => {
			const res = await request(app)
				.get(`/api/v1/grades/khs?academicTermId=${activeTermId}`)
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data).toHaveProperty("student");
			expect(res.body.data).toHaveProperty("ips");
			expect(res.body.data.ips).toBeGreaterThanOrEqual(3.5);

			const if3101Item = res.body.data.items.find(
				(item: { kode: string }) => item.kode === "IF3101",
			);
			expect(if3101Item.statusPublikasi).toBe("Final");
			expect(if3101Item.nilaiHuruf).toBe("A");
			expect(if3101Item.bobot).toBe(4.0);
		});

		it("Mahasiswa dapat melihat Transkrip Akademik Kumulatif lengkap", async () => {
			const res = await request(app)
				.get("/api/v1/grades/transcript")
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data).toHaveProperty("summary");
			expect(res.body.data.summary).toHaveProperty("ipk");
			expect(res.body.data.summary).toHaveProperty("totalSksLulus");
			expect(res.body.data.summary.predicate).toBeDefined();
			expect(Array.isArray(res.body.data.items)).toBe(true);
		});
	});

	describe("Koreksi Nilai Tunggal & Audit Trail Perubahan", () => {
		it("Dosen / Admin mengoreksi nilai dengan menyertakan alasan resmi (Audit Trail)", async () => {
			const res = await request(app)
				.patch(`/api/v1/grades/${aryaGradeId}`)
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					finalExamScore: 96,
					reason: "Koreksi nilai UAS pasca masa sanggah nilai mahasiswa",
				});

			expect(res.status).toBe(200);
			expect(res.body.data.message).toContain("audit log tersimpan");
			expect(res.body.data.grade.finalExamScore).toBe("96");
		});

		it("Menolak koreksi nilai tanpa alasan (minimal 5 karakter)", async () => {
			const res = await request(app)
				.patch(`/api/v1/grades/${aryaGradeId}`)
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					finalExamScore: 80,
					reason: "abc",
				});

			expect(res.status).toBe(400);
			expect(res.body.error.code).toBe("VALIDATION_ERROR");
		});

		it("Melihat riwayat audit log perubahan nilai secara transparan", async () => {
			const res = await request(app)
				.get(`/api/v1/grades/${aryaGradeId}/audit-logs`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data)).toBe(true);
			expect(res.body.data.length).toBeGreaterThanOrEqual(2);

			const latestLog = res.body.data[0];
			expect(latestLog).toHaveProperty("changedBy");
			expect(latestLog).toHaveProperty("reason");
			expect(latestLog.reason).toContain("pasca masa sanggah");
		});
	});
});
