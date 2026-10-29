import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { sanitizeCsvCell } from "../src/modules/reports/reports.csv.js";

describe("Milestone 7: Laporan & Ekspor CSV Suite", () => {
	let adminToken = "";
	let dosenBudiToken = "";
	let dosenRatnaToken = "";
	let mahasiswaAryaToken = "";
	let budiClassId = "";

	beforeAll(async () => {
		// 1. Dapatkan kelas IF3101-A (milik Dosen Budi)
		const activeTerm = await prisma.academicTerm.findFirst({
			where: { isActive: true },
		});
		const cls = await prisma.class.findFirst({
			where: { code: "IF3101-A", academicTermId: activeTerm?.id },
		});
		budiClassId = cls?.id || "";

		// 2. Login Admin
		const adminRes = await request(app).post("/api/v1/auth/login").send({
			identifier: "ADM001",
			password: "Panda2026!",
			role: "Admin",
		});
		adminToken = adminRes.body.data.sessionId;

		// 3. Login Dosen Budi (Pengampu IF3101-A)
		const budiRes = await request(app).post("/api/v1/auth/login").send({
			identifier: "198503152010121002",
			password: "Panda2026!",
			role: "Dosen",
		});
		dosenBudiToken = budiRes.body.data.sessionId;

		// 4. Login Dosen Ratna (Bukan Pengampu IF3101-A)
		const ratnaRes = await request(app).post("/api/v1/auth/login").send({
			identifier: "198807202014042001",
			password: "Panda2026!",
			role: "Dosen",
		});
		dosenRatnaToken = ratnaRes.body.data.sessionId;

		// 5. Login Mahasiswa Arya
		const aryaRes = await request(app).post("/api/v1/auth/login").send({
			identifier: "22010189",
			password: "Panda2026!",
			role: "Mahasiswa",
		});
		mahasiswaAryaToken = aryaRes.body.data.sessionId;
	});

	describe("Sanitasi CSV Formula Injection (Unit Test)", () => {
		it("Mendeteksi formula diawali = dan memberikan prefix petik tunggal", () => {
			const sanitized = sanitizeCsvCell("=SUM(A1:A10)");
			expect(sanitized).toBe("'=SUM(A1:A10)");
		});

		it("Mendeteksi formula diawali +, -, atau @ dan memberikan prefix petik tunggal", () => {
			expect(sanitizeCsvCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
			// Sel dengan koma wajib di-escape quote sesuai RFC 4180
			expect(sanitizeCsvCell("@SUM(1,2)")).toBe('"\'@SUM(1,2)"');
			expect(sanitizeCsvCell("@calculator")).toBe("'@calculator");
			expect(sanitizeCsvCell("-100")).toBe("'-100");
		});

		it("Meng-escape tanda kutip ganda dan membungkus dengan quote sesuai RFC 4180", () => {
			const cell = 'Panda "Super" Raya';
			const sanitized = sanitizeCsvCell(cell);
			expect(sanitized).toBe('"Panda ""Super"" Raya"');
		});

		it("Membungkus teks yang mengandung koma dengan tanda kutip", () => {
			const cell = "Teknik Informatika, S1";
			const sanitized = sanitizeCsvCell(cell);
			expect(sanitized).toBe('"Teknik Informatika, S1"');
		});

		it("Teks normal yang aman tidak diubah", () => {
			expect(sanitizeCsvCell("Nadya Putri Maharani")).toBe(
				"Nadya Putri Maharani",
			);
			expect(sanitizeCsvCell(22010188)).toBe("22010188");
		});
	});

	describe("GET /api/v1/reports/grades/:classId/csv", () => {
		it("Admin berhasil mengunduh file CSV rekap nilai kelas", async () => {
			const res = await request(app)
				.get(`/api/v1/reports/grades/${budiClassId}/csv`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toContain("text/csv");
			expect(res.headers["content-disposition"]).toContain("attachment;");
			expect(res.headers["content-disposition"]).toContain(".csv");

			// Pastikan header kolom RFC 4180 ada pada baris pertama CSV
			const csvText = res.text;
			expect(csvText).toContain(
				"No,NIM,Nama Mahasiswa,Program Studi,Kehadiran (10%),Tugas (20%),UTS (35%),UAS (35%),Nilai Akhir,Nilai Huruf,Bobot,Status Kelulusan",
			);
		});

		it("Dosen pengampu berhasil mengunduh file CSV rekap nilai kelasnya", async () => {
			const res = await request(app)
				.get(`/api/v1/reports/grades/${budiClassId}/csv`)
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toContain("text/csv");
		});

		it("Dosen lain (bukan pengampu) ditolak (403 Forbidden) karena IDOR check", async () => {
			const res = await request(app)
				.get(`/api/v1/reports/grades/${budiClassId}/csv`)
				.set("Authorization", `Bearer ${dosenRatnaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
			expect(res.body.error.message).toContain("Akses Ditolak");
		});

		it("Mahasiswa dilarang mengunduh laporan nilai kelas (403 Forbidden)", async () => {
			const res = await request(app)
				.get(`/api/v1/reports/grades/${budiClassId}/csv`)
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});

		it("Kelas tidak ditemukan mengembalikan 404 NOT FOUND", async () => {
			const res = await request(app)
				.get("/api/v1/reports/grades/00000000-0000-0000-0000-000000000000/csv")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(res.status).toBe(404);
		});
	});

	describe("GET /api/v1/reports/attendance/:classId/csv", () => {
		it("Admin berhasil mengunduh file CSV matriks 16 sesi presensi", async () => {
			const res = await request(app)
				.get(`/api/v1/reports/attendance/${budiClassId}/csv`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toContain("text/csv");
			expect(res.headers["content-disposition"]).toContain("rekap_presensi_");

			const csvText = res.text;
			expect(csvText).toContain(
				"No,NIM,Nama Mahasiswa,Program Studi,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,Total Hadir,Total Izin,Total Sakit,Total Alpa,Persentase Kehadiran (%),Status UAS",
			);
		});

		it("Dosen pengampu berhasil mengunduh file CSV matriks presensi kelasnya", async () => {
			const res = await request(app)
				.get(`/api/v1/reports/attendance/${budiClassId}/csv`)
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(200);
			expect(res.headers["content-type"]).toContain("text/csv");
		});

		it("Dosen non-pengampu ditolak (403 Forbidden) saat mencoba ekspor presensi", async () => {
			const res = await request(app)
				.get(`/api/v1/reports/attendance/${budiClassId}/csv`)
				.set("Authorization", `Bearer ${dosenRatnaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});

		it("Mahasiswa ditolak (403 Forbidden) saat mencoba ekspor presensi", async () => {
			const res = await request(app)
				.get(`/api/v1/reports/attendance/${budiClassId}/csv`)
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});
	});

	describe("GET /api/v1/reports/summary/academic", () => {
		it("Admin BAAK berhasil mengambil ringkasan eksekutif prestasi akademik kampus", async () => {
			const res = await request(app)
				.get("/api/v1/reports/summary/academic")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			const { data } = res.body;

			expect(typeof data.campusAverageGpa).toBe("number");
			expect(data.totalActiveStudents).toBeGreaterThan(0);
			expect(Array.isArray(data.studyPrograms)).toBe(true);
			expect(data.studyPrograms.length).toBeGreaterThan(0);
			expect(data.gradeDistribution).toBeDefined();
			expect(data.gradeDistribution).toHaveProperty("A");
			expect(data.gradeDistribution).toHaveProperty("B");
		});

		it("Dosen ditolak (403 Forbidden) saat mengakses ringkasan eksekutif kampus", async () => {
			const res = await request(app)
				.get("/api/v1/reports/summary/academic")
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});

		it("Mahasiswa ditolak (403 Forbidden) saat mengakses ringkasan eksekutif kampus", async () => {
			const res = await request(app)
				.get("/api/v1/reports/summary/academic")
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});
	});
});
