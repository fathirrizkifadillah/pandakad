import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

describe("Milestone 3: Classes, Schedules & Conflict Detection Suite", () => {
	let adminToken = "";
	let dosenBudiToken = "";
	let mahasiswaToken = "";

	let activeTermId = "";
	let if3102CourseId = "";
	let ratnaLecturerId = "";
	let budiLecturerId = "";
	let labAiRoomId = "";
	let gdARoomId = "";

	beforeAll(async () => {
		// 1. Login Admin
		const adminLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "ADM001",
			password: "Panda2026!",
			role: "Admin",
		});
		adminToken = adminLogin.body.data.sessionId;

		// 2. Login Dosen Budi
		const dosenLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "198503152010121002",
			password: "Panda2026!",
			role: "Dosen",
		});
		dosenBudiToken = dosenLogin.body.data.sessionId;

		// 3. Login Mahasiswa
		const mhsLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "22010189",
			password: "Panda2026!",
			role: "Mahasiswa",
		});
		mahasiswaToken = mhsLogin.body.data.sessionId;

		// Ambil referensi ID entitas yang sudah ada di database
		const term = await prisma.academicTerm.findFirst({
			where: { isActive: true },
		});
		activeTermId = term?.id || "";

		const course = await prisma.course.findUnique({
			where: { code: "IF3102" },
		});
		if3102CourseId = course?.id || "";

		const ratna = await prisma.lecturerProfile.findFirst({
			where: { user: { identifier: "198807202014042001" } },
		});
		ratnaLecturerId = ratna?.id || "";

		const budi = await prisma.lecturerProfile.findFirst({
			where: { user: { identifier: "198503152010121002" } },
		});
		budiLecturerId = budi?.id || "";

		const labAi = await prisma.room.findUnique({
			where: { code: "LAB-AI-302" },
		});
		labAiRoomId = labAi?.id || "";

		const gdA = await prisma.room.findUnique({
			where: { code: "GDA-105" },
		});
		gdARoomId = gdA?.id || "";
	});

	describe("Katalog & Pencarian Kelas", () => {
		it("GET /api/v1/classes harus mengembalikan daftar kelas yang dibuka di semester aktif", async () => {
			const res = await request(app)
				.get("/api/v1/classes")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data)).toBe(true);
			expect(res.body.data.length).toBeGreaterThanOrEqual(8);

			// Periksa kelengkapan relasi
			const firstClass = res.body.data[0];
			expect(firstClass).toHaveProperty("course");
			expect(firstClass).toHaveProperty("lecturer");
			expect(firstClass).toHaveProperty("schedules");
			expect(firstClass.schedules[0]).toHaveProperty("room");
		});

		it("GET /api/v1/classes?search=IF3101 harus memfilter kelas berdasarkan kode", async () => {
			const res = await request(app)
				.get("/api/v1/classes?search=IF3101")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.length).toBeGreaterThanOrEqual(1);
			expect(res.body.data[0].code).toContain("IF3101");
		});
	});

	describe("Rute Kelas Pengajar (Dosen Portal)", () => {
		it("GET /api/v1/classes/my-classes oleh Dosen Budi harus mengembalikan kelas yang diampu", async () => {
			const res = await request(app)
				.get("/api/v1/classes/my-classes")
				.set("Authorization", `Bearer ${dosenBudiToken}`);

			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data)).toBe(true);
			expect(res.body.data.length).toBeGreaterThanOrEqual(1);

			// Pastikan semua kelas memang diampu oleh Budi
			for (const c of res.body.data) {
				expect(c.lecturer.user.identifier).toBe("198503152010121002");
			}
		});

		it("GET /api/v1/classes/my-classes oleh Mahasiswa harus ditolak 403 FORBIDDEN", async () => {
			const res = await request(app)
				.get("/api/v1/classes/my-classes")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});
	});

	describe("Algoritma Deteksi Bentrok Jadwal (Conflict Detection)", () => {
		it("harus menolak jadwal jika waktu mulai lebih lambat daripada waktu selesai (400 BAD_REQUEST)", async () => {
			const res = await request(app)
				.post("/api/v1/classes")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					code: "IF3102-X",
					courseId: if3102CourseId,
					academicTermId: activeTermId,
					lecturerId: ratnaLecturerId,
					quota: 40,
					schedules: [
						{
							roomId: gdARoomId,
							dayOfWeek: "Selasa",
							startTime: "12:00",
							endTime: "10:00", // Waktu selesai mendahului waktu mulai
						},
					],
				});

			expect(res.status).toBe(400);
			expect(res.body.error.code).toBe("BAD_REQUEST");
			expect(res.body.error.message).toContain("lebih awal");
		});

		it("harus MENOLAK jadwal karena BENTROK RUANGAN (409 CONFLICT)", async () => {
			// Skenario: LAB-AI-302 sudah dipakai IF3101-A pada hari Senin pukul 08:00 - 10:30.
			// Coba jadwalkan kelas baru di LAB-AI-302 pada hari Senin pukul 09:30 - 11:30 (tumpang tindih).
			const res = await request(app)
				.post("/api/v1/classes")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					code: "IF3102-BENTROK-RUANG",
					courseId: if3102CourseId,
					academicTermId: activeTermId,
					lecturerId: ratnaLecturerId,
					quota: 35,
					schedules: [
						{
							roomId: labAiRoomId,
							dayOfWeek: "Senin",
							startTime: "09:30",
							endTime: "11:30",
						},
					],
				});

			expect(res.status).toBe(409);
			expect(res.body.error.code).toBe("CONFLICT");
			expect(res.body.error.message).toContain("Jadwal bentrok");
			expect(res.body.error.message).toContain("Ruangan");
			expect(res.body.error.message).toContain("LAB-AI-302");
		});

		it("harus MENOLAK jadwal karena BENTROK DOSEN PENGAJAR (409 CONFLICT)", async () => {
			// Skenario: Dosen Budi sudah mengajar IF3101-A pada hari Senin pukul 08:00 - 10:30.
			// Coba jadwalkan Dosen Budi mengajar kelas lain di ruangan berbeda (GDA-105) pada hari Senin pukul 10:00 - 12:00 (tumpang tindih).
			const res = await request(app)
				.post("/api/v1/classes")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					code: "IF3102-BENTROK-DOSEN",
					courseId: if3102CourseId,
					academicTermId: activeTermId,
					lecturerId: budiLecturerId,
					quota: 35,
					schedules: [
						{
							roomId: gdARoomId,
							dayOfWeek: "Senin",
							startTime: "10:00",
							endTime: "12:00",
						},
					],
				});

			expect(res.status).toBe(409);
			expect(res.body.error.code).toBe("CONFLICT");
			expect(res.body.error.message).toContain("Jadwal bentrok");
			expect(res.body.error.message).toContain("Dosen");
			expect(res.body.error.message).toContain("Budi Santoso");
		});

		it("harus BERHASIL membuat kelas jika jadwal TIDAK bentrok (201 CREATED)", async () => {
			// Skenario: Menjadwalkan kelas di GDA-105 pada hari Selasa pukul 13:00 - 15:30 (bebas dari bentrok)
			const res = await request(app)
				.post("/api/v1/classes")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					code: "IF3102-B-TEST",
					courseId: if3102CourseId,
					academicTermId: activeTermId,
					lecturerId: ratnaLecturerId,
					quota: 40,
					schedules: [
						{
							roomId: gdARoomId,
							dayOfWeek: "Selasa",
							startTime: "13:00",
							endTime: "15:30",
						},
					],
				});

			expect(res.status).toBe(201);
			expect(res.body.data.code).toBe("IF3102-B-TEST");

			// Bersihkan kelas uji
			const createdId = res.body.data.id;
			const deleteRes = await request(app)
				.delete(`/api/v1/classes/${createdId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(deleteRes.status).toBe(200);
		});
	});
});
