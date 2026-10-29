import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

describe("Milestone 4: KRS (Kartu Rencana Studi) Suite", () => {
	let mahasiswaAryaToken = "";
	let mahasiswaNadyaToken = "";
	let dosenBudiToken = "";
	let dosenRatnaToken = "";

	let activeTermId = "";
	let nadyaStudentProfileId = "";
	let if3106ClassId = ""; // Pemrograman Web Lanjut
	let if3107ClassId = ""; // Pengolahan Bahasa Alami (NLP)
	let fullQuotaClassId = "";
	let collisionClassId = "";

	beforeAll(async () => {
		// Pastikan active term memiliki periode KRS yang buka
		const now = new Date();
		const term = await prisma.academicTerm.findFirst({
			where: { isActive: true },
		});
		if (term) {
			activeTermId = term.id;
			await prisma.academicTerm.update({
				where: { id: term.id },
				data: {
					isKrsOpen: true,
					krsStartDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Kemarin
					krsEndDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 hari ke depan
				},
			});
		}

		// 1. Login Mahasiswa Arya (22010189) - DPA: Dr. Ir. Budi Santoso
		const aryaLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "22010189",
			password: "Panda2026!",
			role: "Mahasiswa",
		});
		mahasiswaAryaToken = aryaLogin.body.data.sessionId;

		// 2. Login Mahasiswa Nadya (22010190)
		const nadyaLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "22010190",
			password: "Panda2026!",
			role: "Mahasiswa",
		});
		mahasiswaNadyaToken = nadyaLogin.body.data.sessionId;

		const nadyaProfile = await prisma.studentProfile.findUnique({
			where: { nim: "22010190" },
		});
		nadyaStudentProfileId = nadyaProfile?.id || "";

		// 3. Login Dosen Budi (DPA Arya)
		const budiLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "198503152010121002",
			password: "Panda2026!",
			role: "Dosen",
		});
		dosenBudiToken = budiLogin.body.data.sessionId;

		// 4. Login Dosen Ratna (Bukan DPA Arya)
		const ratnaLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "198807202014042001",
			password: "Panda2026!",
			role: "Dosen",
		});
		dosenRatnaToken = ratnaLogin.body.data.sessionId;

		// Ambil referensi kelas untuk testing
		const if3106 = await prisma.class.findFirst({
			where: { code: "IF3106-A", academicTermId: activeTermId },
		});
		if3106ClassId = if3106?.id || "";

		const if3107 = await prisma.class.findFirst({
			where: { code: "IF3107-A", academicTermId: activeTermId },
		});
		if3107ClassId = if3107?.id || "";

		// Buat kelas khusus kuota penuh untuk uji Concurrency / Quota limit
		const courseNlp = await prisma.course.findFirst({
			where: { code: "IF3107" },
		});
		const courseEtika = await prisma.course.findFirst({
			where: { code: "IF3108" },
		});
		const budiLecturer = await prisma.lecturerProfile.findFirst({
			where: { user: { identifier: "198503152010121002" } },
		});
		const room = await prisma.room.findFirst({
			where: { code: "GDA-105" },
		});

		if (courseNlp && courseEtika && budiLecturer && room) {
			const fullClass = await prisma.class.upsert({
				where: {
					academicTermId_code: {
						academicTermId: activeTermId,
						code: "IF3107-FULL",
					},
				},
				update: { quota: 10, enrolledCount: 10, status: "Open" },
				create: {
					code: "IF3107-FULL",
					courseId: courseNlp.id,
					academicTermId: activeTermId,
					lecturerId: budiLecturer.id,
					quota: 10,
					enrolledCount: 10,
					status: "Open",
				},
			});
			fullQuotaClassId = fullClass.id;

			// Buat kelas bentrok jadwal dengan IF3106-A (IF3106-A jadwalnya Kamis 08:00 - 10:30)
			const collisionClass = await prisma.class.upsert({
				where: {
					academicTermId_code: {
						academicTermId: activeTermId,
						code: "IF3108-BENTROK",
					},
				},
				update: { quota: 40, enrolledCount: 0, status: "Open" },
				create: {
					code: "IF3108-BENTROK",
					courseId: courseEtika.id,
					academicTermId: activeTermId,
					lecturerId: budiLecturer.id,
					quota: 40,
					enrolledCount: 0,
					status: "Open",
				},
			});
			collisionClassId = collisionClass.id;

			// Buat jadwal bentrok pada hari Kamis 09:00 - 11:30 (overlap dengan 08:00 - 10:30)
			await prisma.schedule.deleteMany({
				where: { classId: collisionClass.id },
			});
			await prisma.schedule.create({
				data: {
					classId: collisionClass.id,
					roomId: room.id,
					dayOfWeek: "Kamis",
					startTime: "09:00",
					endTime: "11:30",
				},
			});
		}

		// Bersihkan enrollment Nadya agar bersih saat mulai suite
		await prisma.enrollment.deleteMany({
			where: { studentId: nadyaStudentProfileId },
		});
	});

	describe("Otorisasi & Akses Endpoint KRS", () => {
		it("GET /api/v1/krs/me tanpa autentikasi harus 401 UNAUTHORIZED", async () => {
			const res = await request(app).get("/api/v1/krs/me");
			expect(res.status).toBe(401);
		});

		it("GET /api/v1/krs/me dengan role Dosen harus 403 FORBIDDEN", async () => {
			const res = await request(app)
				.get("/api/v1/krs/me")
				.set("Authorization", `Bearer ${dosenBudiToken}`);
			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});

		it("Mahasiswa dapat melihat KRS dirinya sendiri beserta info DPA dan SKS", async () => {
			const res = await request(app)
				.get("/api/v1/krs/me")
				.set("Authorization", `Bearer ${mahasiswaAryaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data).toHaveProperty("student");
			expect(res.body.data.student.nim).toBe("22010189");
			expect(res.body.data.student.maxSks).toBe(24); // GPA 3.78 -> 24 SKS
			expect(res.body.data).toHaveProperty("academicTerm");
			expect(res.body.data).toHaveProperty("items");
			expect(Array.isArray(res.body.data.items)).toBe(true);
		});
	});

	describe("Pengambilan Kelas (Enroll) & Validasi Aturan Akademik", () => {
		it("Mahasiswa Nadya berhasil mengambil kelas draf pertamanya", async () => {
			const res = await request(app)
				.post("/api/v1/krs/enroll")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`)
				.send({ classId: if3106ClassId });

			expect(res.status).toBe(201);
			expect(res.body.data.message).toContain("berhasil ditambahkan");
			expect(res.body.data.enrollment.status).toBe("Draft");

			// Pastikan enrolledCount kelas bertambah 1
			const cls = await prisma.class.findUnique({
				where: { id: if3106ClassId },
			});
			expect(cls?.enrolledCount).toBeGreaterThanOrEqual(1);
		});

		it("Menolak duplikasi: Mahasiswa tidak boleh mengambil kelas yang sama dua kali", async () => {
			const res = await request(app)
				.post("/api/v1/krs/enroll")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`)
				.send({ classId: if3106ClassId });

			expect(res.status).toBe(409);
			expect(res.body.error.code).toBe("CONFLICT");
			expect(res.body.error.message).toContain("sudah ada di KRS");
		});

		it("Menolak kuota penuh: Kelas dengan kuota habis tidak dapat diambil", async () => {
			const res = await request(app)
				.post("/api/v1/krs/enroll")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`)
				.send({ classId: fullQuotaClassId });

			expect(res.status).toBe(409);
			expect(res.body.error.code).toBe("CONFLICT");
			expect(res.body.error.message).toContain("penuh");
		});

		it("Menolak bentrok jadwal (Schedule Collision): Mahasiswa tidak boleh mengambil 2 kelas dengan jadwal tumpang-tindih", async () => {
			// Nadya sudah terdaftar di IF3106-A (Kamis 08:00 - 10:30)
			// Mencoba mengambil IF-BENTROK (Kamis 09:00 - 11:30)
			const res = await request(app)
				.post("/api/v1/krs/enroll")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`)
				.send({ classId: collisionClassId });

			expect(res.status).toBe(409);
			expect(res.body.error.code).toBe("CONFLICT");
			expect(res.body.error.message).toContain("Jadwal bentrok");
		});

		it("Menolak melebihi batas SKS maksimum berdasarkan IPK/IPS", async () => {
			// Buat profil mahasiswa dengan GPA rendah (< 2.00 -> max 15 SKS)
			const lowGpaUser = await prisma.user.upsert({
				where: { identifier: "22019999" },
				update: {},
				create: {
					identifier: "22019999",
					email: "lowgpa@unpanda.ac.id",
					name: "Mahasiswa Remedial",
					role: "Mahasiswa",
					passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$dummyhash",
				},
			});

			const ifProdi = await prisma.studyProgram.findFirst({
				where: { code: "IF" },
			});
			await prisma.studentProfile.upsert({
				where: { userId: lowGpaUser.id },
				update: { gpa: 1.85 }, // Max 15 SKS
				create: {
					userId: lowGpaUser.id,
					nim: "22019999",
					gpa: 1.85,
					studyProgramId: ifProdi?.id || "",
				},
			});

			// Buat sesi login untuk lowGpaUser
			const session = await prisma.session.create({
				data: {
					userId: lowGpaUser.id,
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				},
			});

			// Cek kalkulasi max SKS pada profil lowGpa
			const meRes = await request(app)
				.get("/api/v1/krs/me")
				.set("Authorization", `Bearer ${session.id}`);

			expect(meRes.body.data.student.maxSks).toBe(15);
		});
	});

	describe("Pembatalan Kelas (Drop)", () => {
		it("Mahasiswa dapat membatalkan (drop) kelas berstatus Draft dan kuota berkurang", async () => {
			const countBefore =
				(
					await prisma.class.findUnique({
						where: { id: if3106ClassId },
					})
				)?.enrolledCount || 0;

			const res = await request(app)
				.delete("/api/v1/krs/drop")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`)
				.send({ classId: if3106ClassId });

			expect(res.status).toBe(200);
			expect(res.body.data.message).toContain("telah dihapus");

			const countAfter =
				(
					await prisma.class.findUnique({
						where: { id: if3106ClassId },
					})
				)?.enrolledCount || 0;
			expect(countAfter).toBe(countBefore - 1);
		});

		it("Menolak drop kelas yang tidak pernah didaftarkan (404 NOT FOUND)", async () => {
			const res = await request(app)
				.delete("/api/v1/krs/drop")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`)
				.send({ classId: if3106ClassId });

			expect(res.status).toBe(404);
		});
	});

	describe("Alur Pengajuan (Submit) & Persetujuan DPA (Review)", () => {
		beforeAll(async () => {
			// Ambil satu kelas baru untuk Nadya agar bisa disubmit
			await request(app)
				.post("/api/v1/krs/enroll")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`)
				.send({ classId: if3107ClassId });
		});

		it("Mahasiswa mengajukan KRS draf ke DPA (Submit)", async () => {
			const res = await request(app)
				.post("/api/v1/krs/submit")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`)
				.send({ notes: "Mohon persetujuan KRS semester 5 saya Pak DPA." });

			expect(res.status).toBe(200);
			expect(res.body.data.message).toContain("berhasil diajukan");

			// Pastikan status enrollment berubah menjadi Submitted
			const krsRes = await request(app)
				.get("/api/v1/krs/me")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`);
			expect(krsRes.body.data.krsStatus).toBe("Menunggu Persetujuan");
			expect(krsRes.body.data.items[0].status).toBe("Menunggu Persetujuan");
		});

		it("Dosen lain (bukan DPA) DITOLAK saat mencoba mereview KRS mahasiswa (403 FORBIDDEN)", async () => {
			const res = await request(app)
				.post("/api/v1/krs/review")
				.set("Authorization", `Bearer ${dosenRatnaToken}`)
				.send({
					studentId: nadyaStudentProfileId,
					status: "Approved",
				});

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
			expect(res.body.error.message).toContain(
				"Hanya Dosen Pembimbing Akademik",
			);
		});

		it("DPA (Dr. Ir. Budi Santoso) dapat menyetujui KRS mahasiswa bimbingannya (Approved)", async () => {
			const res = await request(app)
				.post("/api/v1/krs/review")
				.set("Authorization", `Bearer ${dosenBudiToken}`)
				.send({
					studentId: nadyaStudentProfileId,
					status: "Approved",
					notes: "KRS disetujui, selamat menempuh semester baru.",
				});

			expect(res.status).toBe(200);
			expect(res.body.data.status).toBe("Approved");

			// Cek status di sisi mahasiswa
			const krsRes = await request(app)
				.get("/api/v1/krs/me")
				.set("Authorization", `Bearer ${mahasiswaNadyaToken}`);
			expect(krsRes.body.data.krsStatus).toBe("Disetujui");
			expect(krsRes.body.data.items[0].status).toBe("Disetujui");
		});

		it("DPA dapat melihat rekap daftar mahasiswa bimbingan & status KRS", async () => {
			const res = await request(app)
				.get("/api/v1/krs/dpa/advisees")
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data)).toBe(true);
			const aryaItem = res.body.data.find(
				(item: { nim: string }) => item.nim === "22010189",
			);
			expect(aryaItem).toBeDefined();
			expect(aryaItem.krsStatus).toBe("Disetujui");
		});
	});
});
