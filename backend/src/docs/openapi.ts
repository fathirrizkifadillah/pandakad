/**
 * Spesifikasi OpenAPI 3.1.0 Lengkap untuk Sistem Akademik Universitas Panda Raya (PANDAKAD REST API).
 */

export const openapiSpec = {
	openapi: "3.1.0",
	info: {
		title: "PANDAKAD REST API - Sistem Akademik Universitas Panda Raya",
		version: "1.0.0",
		description: `
Dokumentasi Resmi REST API Sistem Informasi Akademik Universitas Panda Raya (UNPANDA).
Sistem ini melayani administrasi akademik Fakultas Teknologi dan Informatika (FTI) untuk tiga peran pengguna:
* **Admin (BAAK / Staf IT)**: Manajemen data master, penjadwalan kuliah, pembukaan periode akademik, agregasi kampus, dan laporan.
* **Dosen**: Manajemen kelas diampu, persetujuan KRS bimbingan (DPA), absensi perkuliahan (16 sesi), dan penginputan nilai berbobot.
* **Mahasiswa**: Perencanaan studi (KRS mandiri dengan locking kuota dan kuota SKS berbasis IPS), jadwal kuliah, kartu hasil studi (KHS), dan transkrip kumulatif.

### Autentikasi & Keamanan
Autentikasi menggunakan database session token yang dikirimkan melalui **HttpOnly Signed Cookie** (\`sessionId\`) atau fallback **Bearer Token** pada header \`Authorization\`.
Proteksi mencakup Argon2id password hashing, Helmet security headers, rate limiting, mitigasi CSV formula injection, dan RBAC granular.
    `,
		contact: {
			name: "Biro Administrasi Akademik & Kemahasiswaan (BAAK) UNPANDA",
			email: "baak@unpanda.ac.id",
			url: "https://unpanda.ac.id",
		},
		license: {
			name: "Proprietary UNPANDA FTI",
		},
	},
	servers: [
		{
			url: "http://localhost:5000",
			description: "Local Development Server",
		},
	],
	tags: [
		{
			name: "Health",
			description: "Pemeriksaan kesehatan server dan konektivitas database",
		},
		{
			name: "Auth",
			description: "Autentikasi sesi, verifikasi peran, dan manajemen login",
		},
		{
			name: "Master Data",
			description:
				"Data master program studi, periode akademik, gedung, ruangan, dan mata kuliah",
		},
		{
			name: "Classes",
			description:
				"Manajemen kelas perkuliahan dan algoritma deteksi bentrok jadwal",
		},
		{
			name: "KRS",
			description:
				"Kartu Rencana Studi: pemilihan mata kuliah, locking kuota, dan approval DPA",
		},
		{
			name: "Grades",
			description:
				"Komponen penilaian (10/20/35/35), audit trail, KHS, dan transkrip kumulatif",
		},
		{
			name: "Attendance",
			description:
				"Presensi matriks 16 sesi dan verifikasi kelayakan UAS (>= 75%)",
		},
		{
			name: "Dashboard",
			description:
				"Agregasi metrik statistik untuk Admin, Dosen, dan Mahasiswa",
		},
		{
			name: "Reports",
			description:
				"Ekspor rekapitulasi nilai dan presensi standar RFC 4180 CSV",
		},
	],
	paths: {
		"/health": {
			get: {
				tags: ["Health"],
				summary: "Status kesehatan layanan",
				responses: {
					"200": {
						description: "Server dan database beroperasi normal",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/HealthResponse" },
							},
						},
					},
					"503": {
						description: "Layanan mengalami gangguan (database terputus)",
					},
				},
			},
		},
		"/api/v1/auth/login": {
			post: {
				tags: ["Auth"],
				summary: "Masuk ke sistem akademik",
				description:
					"Mengotentikasi pengguna menggunakan NIM/NIP/Identifier dan kata sandi, lalu membuat sesi baru di database.",
				requestBody: {
					required: true,
					content: {
						"application/json": {
							schema: { $ref: "#/components/schemas/LoginInput" },
						},
					},
				},
				responses: {
					"200": {
						description:
							"Berhasil masuk. Sesi dibuat dan cookie sessionId diset.",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/LoginSuccessResponse" },
							},
						},
					},
					"401": {
						description: "NIM/NIP atau kata sandi tidak valid",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/ErrorResponse" },
							},
						},
					},
					"429": {
						description:
							"Terlalu banyak percobaan masuk (Rate limit terlampaui)",
					},
				},
			},
		},
		"/api/v1/auth/me": {
			get: {
				tags: ["Auth"],
				summary: "Ambil profil pengguna yang sedang login",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description: "Profil pengguna berhasil didapatkan",
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/UserProfileResponse" },
							},
						},
					},
					"401": { description: "Sesi tidak valid atau telah kedaluwarsa" },
				},
			},
		},
		"/api/v1/auth/logout": {
			post: {
				tags: ["Auth"],
				summary: "Keluar dari sistem",
				description:
					"Menghapus sesi pengguna dari database dan membersihkan cookie.",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": { description: "Sesi berhasil dihapus" },
				},
			},
		},
		"/api/v1/master/study-programs": {
			get: {
				tags: ["Master Data"],
				summary: "Daftar program studi FTI",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": { description: "Daftar seluruh program studi aktif" },
				},
			},
		},
		"/api/v1/master/terms": {
			get: {
				tags: ["Master Data"],
				summary: "Daftar seluruh periode akademik",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description: "Daftar semester dan status jendela KRS/Nilai",
					},
				},
			},
			post: {
				tags: ["Master Data"],
				summary: "Buat periode akademik baru (Khusus Admin)",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"201": { description: "Periode berhasil dibuat" },
					"403": { description: "Hanya Admin yang berhak membuat periode" },
					"409": { description: "Kode periode duplikat" },
				},
			},
		},
		"/api/v1/classes": {
			get: {
				tags: ["Classes"],
				summary: "Daftar kelas perkuliahan semester aktif",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description: "Daftar kelas beserta dosen, kuota, dan jadwal",
					},
				},
			},
			post: {
				tags: ["Classes"],
				summary: "Buka rombongan belajar kelas baru (Khusus Admin)",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"201": { description: "Kelas berhasil dibuka" },
					"409": { description: "Kode kelas duplikat pada semester terkait" },
				},
			},
		},
		"/api/v1/krs/eligible-classes": {
			get: {
				tags: ["KRS"],
				summary: "Daftar mata kuliah yang dapat diambil mahasiswa",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"Daftar kelas dengan indikasi kuota dan status prasyarat",
					},
				},
			},
		},
		"/api/v1/krs/enroll": {
			post: {
				tags: ["KRS"],
				summary: "Pilih / ambil kelas rencana studi",
				description:
					"Mengambil kelas dengan locking kuota atomik database, validasi batas SKS, dan deteksi bentrok jadwal.",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description: "Mata kuliah berhasil ditambahkan ke KRS draft",
					},
					"409": {
						description: "Bentrok jadwal kuliah atau kuota kelas penuh",
					},
				},
			},
		},
		"/api/v1/krs/submit": {
			post: {
				tags: ["KRS"],
				summary: "Ajukan KRS ke Dosen Pembimbing Akademik (DPA)",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description: "KRS berhasil diajukan dengan status SUBMITTED",
					},
				},
			},
		},
		"/api/v1/grades/class/{classId}": {
			get: {
				tags: ["Grades"],
				summary: "Daftar nilai mahasiswa dalam kelas (Dosen Pengampu / Admin)",
				parameters: [
					{
						name: "classId",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description: "Daftar mahasiswa dan perincian nilai komponen",
					},
					"403": { description: "Dosen bukan pengampu kelas ini" },
				},
			},
		},
		"/api/v1/grades/batch": {
			post: {
				tags: ["Grades"],
				summary: "Input nilai kolektif kelas (Batch Grading)",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"Nilai berhasil disimpan beserta kalkulasi bobot otomatis",
					},
				},
			},
		},
		"/api/v1/grades/khs": {
			get: {
				tags: ["Grades"],
				summary: "Kartu Hasil Studi (KHS) mahasiswa semester berjalan",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"Daftar nilai semester, Indeks Prestasi Semester (IPS), dan batas SKS berikutnya",
					},
				},
			},
		},
		"/api/v1/grades/transcript": {
			get: {
				tags: ["Grades"],
				summary: "Transkrip nilai kumulatif mahasiswa",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"Seluruh riwayat nilai, total SKS lulus, dan Indeks Prestasi Kumulatif (IPK)",
					},
				},
			},
		},
		"/api/v1/attendance/session": {
			post: {
				tags: ["Attendance"],
				summary:
					"Pencatatan sesi perkuliahan & absensi mahasiswa (Pertemuan 1 - 16)",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": { description: "Presensi sesi perkuliahan berhasil disimpan" },
				},
			},
		},
		"/api/v1/attendance/my-recap": {
			get: {
				tags: ["Attendance"],
				summary: "Rekapitulasi presensi perkuliahan mahasiswa",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"Rekap persentase kehadiran dan status kelayakan UAS (>= 75%)",
					},
				},
			},
		},
		"/api/v1/dashboard/admin": {
			get: {
				tags: ["Dashboard"],
				summary: "Metrik agregat institusi (Admin BAAK)",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"Statistik lengkap mahasiswa, dosen, kelas, dan okupansi ruangan",
					},
					"403": { description: "Hanya Admin yang berhak mengakses" },
				},
			},
		},
		"/api/v1/dashboard/lecturer": {
			get: {
				tags: ["Dashboard"],
				summary: "Portal Dosen (Kelas diampu, bimbingan, jadwal hari ini)",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"Ringkasan beban mengajar dan persentase kelengkapan nilai",
					},
				},
			},
		},
		"/api/v1/dashboard/student": {
			get: {
				tags: ["Dashboard"],
				summary: "Portal Mahasiswa (IPK, SKS, jadwal hari ini, presensi)",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": { description: "Ringkasan akademik mahasiswa berjalan" },
				},
			},
		},
		"/api/v1/reports/grades/{classId}/csv": {
			get: {
				tags: ["Reports"],
				summary: "Unduh rekapitulasi nilai akhir kelas format CSV",
				parameters: [
					{
						name: "classId",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"File CSV berstandar RFC 4180 dengan mitigasi formula injection",
						content: {
							"text/csv": {
								schema: { type: "string" },
							},
						},
					},
					"403": {
						description:
							"Dosen tidak berhak mengunduh rekap kelas dosen lain (IDOR)",
					},
				},
			},
		},
		"/api/v1/reports/attendance/{classId}/csv": {
			get: {
				tags: ["Reports"],
				summary: "Unduh matriks absensi 16 sesi perkuliahan format CSV",
				parameters: [
					{
						name: "classId",
						in: "path",
						required: true,
						schema: { type: "string", format: "uuid" },
					},
				],
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"File CSV matriks absensi P1 s.d. P16 dan status kelayakan UAS",
						content: {
							"text/csv": {
								schema: { type: "string" },
							},
						},
					},
				},
			},
		},
		"/api/v1/reports/summary/academic": {
			get: {
				tags: ["Reports"],
				summary: "Ringkasan eksekutif prestasi akademik kampus (Khusus Admin)",
				security: [{ SessionCookie: [] }, { BearerAuth: [] }],
				responses: {
					"200": {
						description:
							"Statistik rata-rata IPK kampus, IPK per prodi, dan sebaran nilai A-E",
					},
				},
			},
		},
	},
	components: {
		securitySchemes: {
			SessionCookie: {
				type: "apiKey",
				in: "cookie",
				name: "sessionId",
				description:
					"Signed HTTP-only cookie berisi identifier sesi database yang valid",
			},
			BearerAuth: {
				type: "http",
				scheme: "bearer",
				description:
					"Fallback Bearer token session identifier (berguna untuk testing / integrasi non-browser)",
			},
		},
		schemas: {
			HealthResponse: {
				type: "object",
				properties: {
					status: { type: "string", example: "ok" },
					service: { type: "string", example: "pandakad-backend" },
					timestamp: { type: "string", format: "date-time" },
					database: { type: "string", example: "connected" },
					uptime: { type: "number", example: 120.5 },
				},
			},
			LoginInput: {
				type: "object",
				required: ["identifier", "password", "role"],
				properties: {
					identifier: {
						type: "string",
						example: "ADM001",
						description: "NIM / NIP / ID Staf",
					},
					password: {
						type: "string",
						example: "Panda2026!",
						description: "Kata sandi akun",
					},
					role: {
						type: "string",
						enum: ["Admin", "Dosen", "Mahasiswa"],
						example: "Admin",
					},
				},
			},
			LoginSuccessResponse: {
				type: "object",
				properties: {
					status: { type: "string", example: "success" },
					data: {
						type: "object",
						properties: {
							user: {
								type: "object",
								properties: {
									id: { type: "string", format: "uuid" },
									identifier: { type: "string" },
									name: { type: "string" },
									email: { type: "string" },
									role: { type: "string" },
								},
							},
							sessionId: { type: "string", format: "uuid" },
						},
					},
				},
			},
			UserProfileResponse: {
				type: "object",
				properties: {
					status: { type: "string", example: "success" },
					data: {
						type: "object",
						properties: {
							id: { type: "string", format: "uuid" },
							identifier: { type: "string" },
							name: { type: "string" },
							email: { type: "string" },
							role: { type: "string" },
						},
					},
				},
			},
			ErrorResponse: {
				type: "object",
				properties: {
					error: {
						type: "object",
						properties: {
							code: { type: "string", example: "BAD_REQUEST" },
							message: {
								type: "string",
								example: "Permintaan data tidak valid",
							},
							details: { type: "object" },
						},
					},
				},
			},
		},
	},
};
