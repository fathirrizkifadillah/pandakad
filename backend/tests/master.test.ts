import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("Milestone 2: Master Data & Academic Terms Suite", () => {
	let adminToken = "";
	let mahasiswaToken = "";

	beforeAll(async () => {
		// Dapatkan token Admin
		const adminLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "ADM001",
			password: "Panda2026!",
			role: "Admin",
		});
		adminToken = adminLogin.body.data.sessionId;

		// Dapatkan token Mahasiswa
		const mhsLogin = await request(app).post("/api/v1/auth/login").send({
			identifier: "22010189",
			password: "Panda2026!",
			role: "Mahasiswa",
		});
		mahasiswaToken = mhsLogin.body.data.sessionId;
	});

	describe("Pengaturan Institusi (Single Tenant UNPANDA & FTI)", () => {
		it("GET /api/v1/master/settings harus dapat diakses publik tanpa login", async () => {
			const res = await request(app).get("/api/v1/master/settings");

			expect(res.status).toBe(200);
			expect(res.body.data).toMatchObject({
				id: "default",
				name: "Universitas Panda Raya",
				shortName: "UNPANDA",
				facultyName: "Fakultas Teknologi dan Informatika (FTI)",
				accreditation: "Unggul",
			});
		});

		it("PUT /api/v1/master/settings oleh Mahasiswa harus ditolak 403 FORBIDDEN", async () => {
			const res = await request(app)
				.put("/api/v1/master/settings")
				.set("Authorization", `Bearer ${mahasiswaToken}`)
				.send({ phone: "(024) 999-8877" });

			expect(res.status).toBe(403);
			expect(res.body.error.code).toBe("FORBIDDEN");
		});

		it("PUT /api/v1/master/settings oleh Admin harus berhasil mengupdate 200 OK", async () => {
			const res = await request(app)
				.put("/api/v1/master/settings")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ phone: "(024) 844-5566" });

			expect(res.status).toBe(200);
			expect(res.body.data.phone).toBe("(024) 844-5566");
		});
	});

	describe("Periode Akademik & Jendela KRS/Nilai", () => {
		const dynamicTermCode = `2027${Math.floor(1000 + Math.random() * 9000)}`;

		it("GET /api/v1/master/terms/active harus mengembalikan periode yang sedang aktif", async () => {
			const res = await request(app)
				.get("/api/v1/master/terms/active")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.isActive).toBe(true);
			expect(res.body.data.code).toBe("20261");
			expect(res.body.data.semester).toBe("Ganjil");
		});

		it("GET /api/v1/master/terms harus mengembalikan daftar semua periode akademik", async () => {
			const res = await request(app)
				.get("/api/v1/master/terms")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(res.status).toBe(200);
			expect(Array.isArray(res.body.data)).toBe(true);
			expect(res.body.data.length).toBeGreaterThanOrEqual(2);
		});

		it("POST /api/v1/master/terms oleh Mahasiswa harus ditolak 403", async () => {
			const res = await request(app)
				.post("/api/v1/master/terms")
				.set("Authorization", `Bearer ${mahasiswaToken}`)
				.send({
					code: "20271",
					name: "Semester Ganjil 2027/2028",
					academicYear: "2027/2028",
					semester: "Ganjil",
				});

			expect(res.status).toBe(403);
		});

		it("POST /api/v1/master/terms oleh Admin dengan data valid harus sukses 201 Created", async () => {
			const res = await request(app)
				.post("/api/v1/master/terms")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					code: dynamicTermCode,
					name: "Semester Ganjil 2027/2028",
					academicYear: "2027/2028",
					semester: "Ganjil",
					startDate: "2027-09-01",
					endDate: "2028-01-31",
					krsStartDate: "2027-08-15T00:00:00Z",
					krsEndDate: "2027-09-10T23:59:59Z",
					gradeInputStartDate: "2028-01-10T00:00:00Z",
					gradeInputEndDate: "2028-02-05T23:59:59Z",
					isActive: false,
					isKrsOpen: false,
					isGradeInputOpen: false,
				});

			expect(res.status).toBe(201);
			expect(res.body.data.code).toBe(dynamicTermCode);
		});

		it("POST /api/v1/master/terms dengan kode duplikat harus mengembalikan 409 CONFLICT", async () => {
			const res = await request(app)
				.post("/api/v1/master/terms")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					code: dynamicTermCode, // Menggunakan kode yang sama
					name: "Semester Ganjil Duplikat",
					academicYear: "2027/2028",
					semester: "Ganjil",
					startDate: "2027-09-01",
					endDate: "2028-01-31",
					krsStartDate: "2027-08-15T00:00:00Z",
					krsEndDate: "2027-09-10T23:59:59Z",
					gradeInputStartDate: "2028-01-10T00:00:00Z",
					gradeInputEndDate: "2028-02-05T23:59:59Z",
				});

			expect(res.status).toBe(409);
			expect(res.body.error.code).toBe("CONFLICT");
		});
	});

	describe("Program Studi, Gedung & Ruangan", () => {
		it("GET /api/v1/master/programs harus mengembalikan daftar prodi FTI", async () => {
			const res = await request(app)
				.get("/api/v1/master/programs")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.length).toBeGreaterThanOrEqual(3);
			const codes = res.body.data.map((p: { code: string }) => p.code);
			expect(codes).toContain("IF");
			expect(codes).toContain("SI");
			expect(codes).toContain("TK");
		});

		it("GET /api/v1/master/buildings harus mengembalikan gedung kampus beserta ruangannya", async () => {
			const res = await request(app)
				.get("/api/v1/master/buildings")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.length).toBeGreaterThanOrEqual(4);
			const geda = res.body.data.find(
				(b: { code: string }) => b.code === "GD-A",
			);
			expect(geda).toBeDefined();
			expect(geda.rooms.length).toBeGreaterThanOrEqual(1);
		});

		it("GET /api/v1/master/rooms harus mengembalikan daftar ruangan kelas dan lab", async () => {
			const res = await request(app)
				.get("/api/v1/master/rooms")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.length).toBeGreaterThanOrEqual(8);
			const labAi = res.body.data.find(
				(r: { code: string }) => r.code === "LAB-AI-302",
			);
			expect(labAi).toBeDefined();
			expect(labAi.type).toBe("Laboratorium");
		});
	});

	describe("Katalog Mata Kuliah & Kurikulum", () => {
		it("GET /api/v1/master/courses harus mengembalikan daftar mata kuliah FTI", async () => {
			const res = await request(app)
				.get("/api/v1/master/courses")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.length).toBeGreaterThanOrEqual(8);
		});

		it("GET /api/v1/master/courses?search=Kecerdasan harus memfilter mata kuliah AI", async () => {
			const res = await request(app)
				.get("/api/v1/master/courses?search=Kecerdasan")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.length).toBe(1);
			expect(res.body.data[0].code).toBe("IF3101");
			expect(res.body.data[0].name).toContain("Kecerdasan Buatan");
		});

		it("GET /api/v1/master/courses?semester=5 harus mengembalikan matkul semester 5", async () => {
			const res = await request(app)
				.get("/api/v1/master/courses?semester=5")
				.set("Authorization", `Bearer ${mahasiswaToken}`);

			expect(res.status).toBe(200);
			for (const c of res.body.data) {
				expect(c.semester).toBe(5);
			}
		});

		it("POST /api/v1/master/courses oleh Mahasiswa harus ditolak 403", async () => {
			const res = await request(app)
				.post("/api/v1/master/courses")
				.set("Authorization", `Bearer ${mahasiswaToken}`)
				.send({
					code: "IF3199",
					name: "Mata Kuliah Ilegal",
					sks: 3,
					semester: 6,
					studyProgramId: "non-existent",
				});

			expect(res.status).toBe(403);
		});
	});
});
