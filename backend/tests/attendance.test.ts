import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

describe("Milestone 6: Presensi & Absensi Perkuliahan Suite", () => {
	let dosenBudiToken = "";
	let dosenRatnaToken = "";
	let mahasiswaAryaToken = "";
	let mahasiswaBayuToken = "";

	let activeTermId = "";
	let budiClassId = "";
	let aryaStudentProfileId = "";
	let bayuStudentProfileId = "";

	beforeAll(async () => {
		// 1. Dapatkan periode aktif
		const activeTerm = await prisma.academicTerm.findFirst({
			where: { isActive: true },
		});
		activeTermId = activeTerm?.id || "";

		// 2. Login Dosen Budi
		const budiLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "198503152010121002",
			password: "Panda2026!",
			role: "Dosen",
		});
		dosenBudiToken = budiLogin.body.data.sessionId;

		// 3. Login Dosen Ratna
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

		// 5. Login Mahasiswa Bayu Kurniawan
		const bayuLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "22010191",
			password: "Panda2026!",
			role: "Mahasiswa",
		});
		mahasiswaBayuToken = bayuLogin.body.data.sessionId;

		// 6. Dapatkan kelas IF3101-A milik Dosen Budi
		const cls = await prisma.class.findFirst({
			where: { code: "IF3101-A", academicTermId: activeTermId },
		});
		budiClassId = cls?.id || "";

		// 7. Daftarkan Arya dan Bayu ke kelas IF3101-A secara sah
		const aryaProfile = await prisma.studentProfile.findUnique({
			where: { nim: "22010189" },
		});
		aryaStudentProfileId = aryaProfile?.id || "";

		const bayuProfile = await prisma.studentProfile.findUnique({
			where: { nim: "22010191" },
		});
		bayuStudentProfileId = bayuProfile?.id || "";

		if (budiClassId && aryaStudentProfileId && bayuStudentProfileId) {
			await prisma.enrollment.upsert({
				where: {
					studentId_classId: {
						studentId: aryaStudentProfileId,
						classId: budiClassId,
					},
				},
				update: { status: "Approved" },
				create: {
					studentId: aryaStudentProfileId,
					classId: budiClassId,
					academicTermId: activeTermId,
					status: "Approved",
				},
			});

			await prisma.enrollment.upsert({
				where: {
					studentId_classId: {
						studentId: bayuStudentProfileId,
						classId: budiClassId,
					},
				},
				update: { status: "Approved" },
				create: {
					studentId: bayuStudentProfileId,
					classId: budiClassId,
					academicTermId: activeTermId,
					status: "Approved",
				},
			});
		}

		// Bersihkan data presensi lama untuk kelas ini agar pengujian deterministik
		await prisma.attendanceSession.deleteMany({
			where: { classId: budiClassId },
		});
	});

	describe("Otorisasi & Hak Akses Presensi", () => {
		it("Mahasiswa DITOLAK saat mencoba mencatat absensi sesi (403 FORBIDDEN)", async () => {
			const res = await request(app)
				.post("/api/v1/attendance/session")
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`)
				.send({
					classId: budiClassId,
					sessionNumber: 1,
					records: [{ studentId: aryaStudentProfileId, status: "Hadir" }],
				});

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});

		it("Dosen lain (bukan pengampu) DITOLAK saat mencatat absensi (403 FORBIDDEN)", async () => {
			const res = await request(app)
				.post("/api/v1/attendance/session")
				.set("Authorization", `Bearer ${dosenRatnaToken}`)
				.send({
					classId: budiClassId,
					sessionNumber: 1,
					records: [{ studentId: aryaStudentProfileId, status: "Hadir" }],
				});

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
			expect(res.body.error.message).toContain("tidak memiliki akses");
		});

		it("Menolak pertemuan di luar rentang 1 s.d. 16 (400 VALIDATION_ERROR)", async () => {
			const res = await request(app)
				.post("/api/v1/attendance/session")
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					classId: budiClassId,
					sessionNumber: 17, // Melebihi batas 16 pertemuan
					records: [{ studentId: aryaStudentProfileId, status: "Hadir" }],
				});

			expect(res.status).toBe(400);
			expect(res.body.error.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("Pencatatan Presensi Sesi Perkuliahan (Pertemuan 1 & 2)", () => {
		it("Dosen Budi berhasil mencatat absensi Pertemuan 1", async () => {
			const res = await request(app)
				.post("/api/v1/attendance/session")
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					classId: budiClassId,
					sessionNumber: 1,
					date: "2026-09-07",
					startTime: "08:00",
					endTime: "10:30",
					topic: "Pengenalan Kecerdasan Buatan & Agen Cerdas",
					records: [
						{ studentId: aryaStudentProfileId, status: "Hadir" },
						{
							studentId: bayuStudentProfileId,
							status: "Sakit",
							notes: "Surat dokter terlampir",
						},
					],
				});

			expect(res.status).toBe(200);
			expect(res.body.data.message).toContain("Pertemuan 1");
			expect(res.body.data.session.sessionNumber).toBe(1);
			expect(res.body.data.session.recordsCount).toBe(2);
		});

		it("Dosen dapat melihat detail absensi Pertemuan 1 yang telah dicatat", async () => {
			const res = await request(app)
				.get(`/api/v1/attendance/class/${budiClassId}/session/1`)
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.classInfo.sessionNumber).toBe(1);
			expect(res.body.data.session.topic).toContain(
				"Pengenalan Kecerdasan Buatan",
			);

			const aryaRecord = res.body.data.students.find(
				(s: { nim: string }) => s.nim === "22010189",
			);
			expect(aryaRecord.status).toBe("Hadir");

			const bayuRecord = res.body.data.students.find(
				(s: { nim: string }) => s.nim === "22010191",
			);
			expect(bayuRecord.status).toBe("Sakit");
		});

		it("Dosen mencatat absensi Pertemuan 2 (Arya Alpa, Bayu Hadir)", async () => {
			const res = await request(app)
				.post("/api/v1/attendance/session")
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					classId: budiClassId,
					sessionNumber: 2,
					date: "2026-09-14",
					topic: "Metode Pencarian Heuristik (A* Search)",
					records: [
						{
							studentId: aryaStudentProfileId,
							status: "Alpa",
							notes: "Tanpa keterangan",
						},
						{ studentId: bayuStudentProfileId, status: "Hadir" },
					],
				});

			expect(res.status).toBe(200);
			expect(res.body.data.session.sessionNumber).toBe(2);
		});
	});

	describe("Rekapitulasi Presensi & Evaluasi Ambang Syarat Ujian 75%", () => {
		it("Dosen dapat melihat rekapitulasi kehadiran lengkap kelas", async () => {
			const res = await request(app)
				.get(`/api/v1/attendance/class/${budiClassId}/recap`)
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.classInfo.totalSessionsHeld).toBe(2);

			const aryaRecap = res.body.data.students.find(
				(s: { nim: string }) => s.nim === "22010189",
			);
			expect(aryaRecap.totalPertemuan).toBe(2);
			expect(aryaRecap.hadir).toBe(1);
			expect(aryaRecap.alpa).toBe(1);
			expect(aryaRecap.persentase).toBe(50); // 1 dari 2 = 50%
			expect(aryaRecap.statusUjian).toBe("Tidak Memenuhi Syarat"); // < 75%
		});

		it("Mahasiswa Arya melihat rekap presensi dirinya (Persentase 50% -> Status 'Perhatian')", async () => {
			const res = await request(app)
				.get(`/api/v1/attendance/my-recap?academicTermId=${activeTermId}`)
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data)).toBe(true);

			const if3101 = res.body.data.find(
				(item: { kode: string }) => item.kode === "IF3101",
			);
			expect(if3101).toBeDefined();
			expect(if3101.totalPertemuan).toBe(2);
			expect(if3101.hadir).toBe(1);
			expect(if3101.alpa).toBe(1);
			expect(if3101.persentase).toBe(50);
			expect(if3101.isEligible).toBe(false);
			expect(if3101.status).toBe("Perhatian");
		});

		it("Mahasiswa Bayu mencapai kehadiran 75% setelah pertemuan 3 dan 4 dihadiri -> 'Memenuhi Syarat'", async () => {
			// Rekam pertemuan 3 & 4 dimana Bayu hadir
			await request(app)
				.post("/api/v1/attendance/session")
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					classId: budiClassId,
					sessionNumber: 3,
					date: "2026-09-21",
					topic: "Game Playing & Minimax",
					records: [
						{ studentId: aryaStudentProfileId, status: "Hadir" },
						{ studentId: bayuStudentProfileId, status: "Hadir" },
					],
				});

			await request(app)
				.post("/api/v1/attendance/session")
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					classId: budiClassId,
					sessionNumber: 4,
					date: "2026-09-28",
					topic: "Constraint Satisfaction Problems",
					records: [
						{ studentId: aryaStudentProfileId, status: "Hadir" },
						{ studentId: bayuStudentProfileId, status: "Hadir" },
					],
				});

			// Cek rekap presensi Bayu: 4 pertemuan (1 Sakit, 3 Hadir) -> 3/4 = 75%
			const res = await request(app)
				.get(`/api/v1/attendance/my-recap?academicTermId=${activeTermId}`)
				.set("Authorization", `Bearer ${mahasiswaBayuToken}`);

			expect(res.status).toBe(200);
			const if3101 = res.body.data.find(
				(item: { kode: string }) => item.kode === "IF3101",
			);
			expect(if3101).toBeDefined();
			expect(if3101.totalPertemuan).toBe(4);
			expect(if3101.hadir).toBe(3);
			expect(if3101.persentase).toBe(75);
			expect(if3101.isEligible).toBe(true);
			expect(if3101.status).toBe("Memenuhi Syarat");
		});
	});
});
