import { PrismaClient, Role } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
	console.log(
		"🌱 Memulai seeding database UNPANDA (Data Master & Pengguna)...",
	);

	// 1. Pengaturan Institusi Tunggal (Single Tenant UNPANDA & FTI)
	const settings = await prisma.institutionSettings.upsert({
		where: { id: "default" },
		update: {
			name: "Universitas Panda Raya",
			shortName: "UNPANDA",
			code: "061032",
			accreditation: "Unggul",
			facultyName: "Fakultas Teknologi dan Informatika (FTI)",
			email: "baak@unpanda.ac.id",
			phone: "(024) 844-5566",
			address: "Kawasan Kampus Terpadu UNPANDA, Jl. Raya Panda Hijau No. 1",
			logoUrl: "/assets/logo_unpanda.png",
		},
		create: {
			id: "default",
			name: "Universitas Panda Raya",
			shortName: "UNPANDA",
			code: "061032",
			accreditation: "Unggul",
			facultyName: "Fakultas Teknologi dan Informatika (FTI)",
			email: "baak@unpanda.ac.id",
			phone: "(024) 844-5566",
			address: "Kawasan Kampus Terpadu UNPANDA, Jl. Raya Panda Hijau No. 1",
			logoUrl: "/assets/logo_unpanda.png",
		},
	});
	console.log("✅ Pengaturan institusi UNPANDA siap.");

	// 2. Program Studi di Lingkungan FTI UNPANDA
	const prodis = [
		{
			code: "IF",
			name: "Teknik Informatika",
			degree: "S1",
			accreditation: "Unggul",
			headOfProgram: "Dr. Ir. Budi Santoso, M.Kom.",
		},
		{
			code: "SI",
			name: "Sistem Informasi",
			degree: "S1",
			accreditation: "Unggul",
			headOfProgram: "Prof. Dr. Ratna Wulandari, S.T., M.T.",
		},
		{
			code: "TK",
			name: "Teknik Komputer",
			degree: "S1",
			accreditation: "Baik Sekali",
			headOfProgram: "Denny Prasetyo, M.Cs.",
		},
	];

	const prodiMap = new Map<string, string>();
	for (const p of prodis) {
		const res = await prisma.studyProgram.upsert({
			where: { code: p.code },
			update: {
				name: p.name,
				degree: p.degree,
				accreditation: p.accreditation,
				headOfProgram: p.headOfProgram,
			},
			create: p,
		});
		prodiMap.set(p.code, res.id);
		console.log(
			`🎓 Program Studi siap: [${res.degree}] ${res.name} (${res.code})`,
		);
	}

	// 3. Periode / Tahun Akademik
	const terms = [
		{
			code: "20261",
			name: "Semester Ganjil 2026/2027",
			academicYear: "2026/2027",
			semester: "Ganjil",
			startDate: new Date("2026-09-01"),
			endDate: new Date("2027-01-31"),
			krsStartDate: new Date("2026-08-15T00:00:00Z"),
			krsEndDate: new Date("2026-09-10T23:59:59Z"),
			gradeInputStartDate: new Date("2027-01-10T00:00:00Z"),
			gradeInputEndDate: new Date("2027-02-05T23:59:59Z"),
			isActive: true,
			isKrsOpen: true,
			isGradeInputOpen: false,
		},
		{
			code: "20252",
			name: "Semester Genap 2025/2026",
			academicYear: "2025/2026",
			semester: "Genap",
			startDate: new Date("2026-02-01"),
			endDate: new Date("2026-06-30"),
			krsStartDate: new Date("2026-01-15T00:00:00Z"),
			krsEndDate: new Date("2026-02-10T23:59:59Z"),
			gradeInputStartDate: new Date("2026-06-10T00:00:00Z"),
			gradeInputEndDate: new Date("2026-07-05T23:59:59Z"),
			isActive: false,
			isKrsOpen: false,
			isGradeInputOpen: false,
		},
	];

	let activeTermId = "";
	for (const t of terms) {
		const res = await prisma.academicTerm.upsert({
			where: { code: t.code },
			update: t,
			create: t,
		});
		if (res.isActive) activeTermId = res.id;
		console.log(
			`📅 Periode Akademik siap: ${res.name} [Aktif: ${res.isActive}]`,
		);
	}

	// Update activeTermId di InstitutionSettings
	if (activeTermId) {
		await prisma.institutionSettings.update({
			where: { id: settings.id },
			data: { activeTermId },
		});
	}

	// 4. Gedung Kampus UNPANDA
	const buildings = [
		{ code: "GD-A", name: "Gedung Kuliah Terpadu A", floors: 4 },
		{ code: "GD-B", name: "Gedung Kuliah Terpadu B", floors: 4 },
		{ code: "GD-C", name: "Gedung Riset & Laboratorium Komputasi", floors: 5 },
		{ code: "GD-REK", name: "Gedung Rektorat UNPANDA", floors: 4 },
	];

	const buildingMap = new Map<string, string>();
	for (const b of buildings) {
		const res = await prisma.building.upsert({
			where: { code: b.code },
			update: b,
			create: b,
		});
		buildingMap.set(b.code, res.id);
		console.log(`🏢 Gedung siap: ${res.name} (${res.code})`);
	}

	// 5. Ruangan Kelas & Laboratorium
	const rooms = [
		{
			code: "GDA-105",
			name: "Gedung A 105",
			buildingCode: "GD-A",
			capacity: 45,
			type: "Teori",
		},
		{
			code: "GDB-204",
			name: "Gedung B 204",
			buildingCode: "GD-B",
			capacity: 45,
			type: "Teori",
		},
		{
			code: "GDC-301",
			name: "Gedung C 301",
			buildingCode: "GD-C",
			capacity: 40,
			type: "Teori",
		},
		{
			code: "LAB-AI-302",
			name: "Lab AI 302",
			buildingCode: "GD-C",
			capacity: 40,
			type: "Laboratorium",
		},
		{
			code: "LAB-MM-1",
			name: "Lab Multimedia 1",
			buildingCode: "GD-C",
			capacity: 35,
			type: "Laboratorium",
		},
		{
			code: "LAB-NET-401",
			name: "Lab Jaringan 401",
			buildingCode: "GD-C",
			capacity: 35,
			type: "Laboratorium",
		},
		{
			code: "LAB-KOMP-201",
			name: "Lab Komputasi 201",
			buildingCode: "GD-C",
			capacity: 40,
			type: "Laboratorium",
		},
		{
			code: "LAB-CLOUD",
			name: "Lab Komputasi Awan",
			buildingCode: "GD-C",
			capacity: 40,
			type: "Laboratorium",
		},
	];

	for (const r of rooms) {
		const buildingId = buildingMap.get(r.buildingCode);
		if (!buildingId) continue;
		const res = await prisma.room.upsert({
			where: { code: r.code },
			update: {
				name: r.name,
				buildingId,
				capacity: r.capacity,
				type: r.type,
			},
			create: {
				code: r.code,
				name: r.name,
				buildingId,
				capacity: r.capacity,
				type: r.type,
			},
		});
		console.log(`🚪 Ruangan siap: ${res.name} (${res.code}) [${res.type}]`);
	}

	// 6. Kurikulum & Mata Kuliah (Katalog FTI)
	const ifProdiId = prodiMap.get("IF") || "";
	const courses = [
		{
			code: "IF3101",
			name: "Kecerdasan Buatan & Machine Learning",
			sks: 3,
			semester: 5,
			category: "Wajib",
			studyProgramId: ifProdiId,
			description:
				"Pembelajaran mesin, supervised/unsupervised learning, neural networks, dan implementasi computer vision modern.",
		},
		{
			code: "IF3102",
			name: "Rekayasa Perangkat Lunak Lanjut",
			sks: 3,
			semester: 5,
			category: "Wajib",
			studyProgramId: ifProdiId,
			description:
				"Arsitektur perangkat lunak, microservices, domain-driven design, dan continuous delivery pipeline.",
		},
		{
			code: "IF3103",
			name: "Desain Pengalaman Pengguna (UI/UX)",
			sks: 3,
			semester: 5,
			category: "Pilihan",
			studyProgramId: ifProdiId,
			description:
				"Prinsip interaksi manusia dan komputer, wireframing, prototyping Figma, usability testing, dan design systems.",
		},
		{
			code: "IF3104",
			name: "Keamanan Siber & Jaringan Komputer",
			sks: 3,
			semester: 5,
			category: "Wajib",
			studyProgramId: ifProdiId,
			description:
				"Kriptografi, keamanan perimeter, penetration testing, protokol TCP/IP, dan pertahanan siber berlapis.",
		},
		{
			code: "IF3105",
			name: "Komputasi Awan & DevOps",
			sks: 3,
			semester: 5,
			category: "Pilihan",
			studyProgramId: ifProdiId,
			description:
				"Infrastruktur awan, kontainerisasi Docker, orkestrasi Kubernetes, dan implementasi CI/CD terotomatisasi.",
		},
		{
			code: "IF3106",
			name: "Pemrograman Web Lanjut",
			sks: 3,
			semester: 5,
			category: "Wajib",
			studyProgramId: ifProdiId,
			description:
				"Pengembangan aplikasi web fullstack modern dengan React, Node.js, REST API, dan basis data PostgreSQL.",
		},
		{
			code: "IF3107",
			name: "Pengolahan Bahasa Alami (NLP)",
			sks: 3,
			semester: 5,
			category: "Pilihan",
			studyProgramId: ifProdiId,
			description:
				"Pemodelan bahasa, representasi token dan embedding, arsitektur Transformer, dan aplikasi Large Language Models (LLM).",
		},
		{
			code: "IF3108",
			name: "Etika Profesi & Hukum Siber",
			sks: 2,
			semester: 5,
			category: "Wajib",
			studyProgramId: ifProdiId,
			description:
				"Undang-undang ITE, hak kekayaan intelektual (HAKI), privasi data, dan etika profesional insinyur perangkat lunak.",
		},
	];

	for (const c of courses) {
		const res = await prisma.course.upsert({
			where: { code: c.code },
			update: c,
			create: c,
		});
		console.log(
			`📚 Mata Kuliah siap: [${res.code}] ${res.name} (${res.sks} SKS - Sem ${res.semester})`,
		);
	}

	// 7. Pengguna & Profil (User, LecturerProfile, StudentProfile)
	const defaultPasswordHash = await argon2.hash("Panda2026!");

	// Dosen Seed (7 Dosen Realistis FTI UNPANDA)
	const lecturers = [
		{
			identifier: "198503152010121002",
			nidn: "0615038501",
			name: "Dr. Ir. Budi Santoso, M.Kom.",
			email: "budi.santoso@unpanda.ac.id",
			expertise: "Kecerdasan Buatan & Sains Data",
			prodiCode: "IF",
		},
		{
			identifier: "198807202014042001",
			nidn: "0620078802",
			name: "Prof. Dr. Ratna Wulandari, S.T., M.T.",
			email: "ratna.wulandari@unpanda.ac.id",
			expertise: "Keamanan Siber & Jaringan Komputer",
			prodiCode: "IF",
		},
		{
			identifier: "199011122018031003",
			nidn: "0612119003",
			name: "Denny Prasetyo, M.Cs.",
			email: "denny.prasetyo@unpanda.ac.id",
			expertise: "Pemrograman Web & Mobile",
			prodiCode: "IF",
		},
		{
			identifier: "198204282008121001",
			nidn: "0628048201",
			name: "Dr. Eko Prasetyo, S.Kom., M.Cs.",
			email: "eko.prasetyo@unpanda.ac.id",
			expertise: "Arsitektur Perangkat Lunak & Cloud",
			prodiCode: "IF",
		},
		{
			identifier: "198909142015042002",
			nidn: "0614098902",
			name: "Dr. Maya Indah Permata, M.T.",
			email: "maya.indah@unpanda.ac.id",
			expertise: "Sistem Terdistribusi & IoT",
			prodiCode: "TK",
		},
		{
			identifier: "198711052012121004",
			nidn: "0605118701",
			name: "Ahmad Fauzi, S.T., M.Kom.",
			email: "ahmad.fauzi@unpanda.ac.id",
			expertise: "Data Mining & Business Intelligence",
			prodiCode: "SI",
		},
		{
			identifier: "199108222019032005",
			nidn: "0622089101",
			name: "Dian Kusuma Wardhani, M.Sc.",
			email: "dian.kusuma@unpanda.ac.id",
			expertise: "Interaksi Manusia Komputer & UI/UX",
			prodiCode: "IF",
		},
	];

	let mainAdvisorProfileId = "";
	for (const l of lecturers) {
		const user = await prisma.user.upsert({
			where: { identifier: l.identifier },
			update: {
				name: l.name,
				email: l.email,
				role: Role.Dosen,
				passwordHash: defaultPasswordHash,
				isActive: true,
			},
			create: {
				identifier: l.identifier,
				name: l.name,
				email: l.email,
				role: Role.Dosen,
				passwordHash: defaultPasswordHash,
				isActive: true,
			},
		});

		const lecturerProfile = await prisma.lecturerProfile.upsert({
			where: { userId: user.id },
			update: {
				nidn: l.nidn,
				nip: l.identifier,
				title: l.name,
				expertise: l.expertise,
				studyProgramId: prodiMap.get(l.prodiCode),
			},
			create: {
				userId: user.id,
				nidn: l.nidn,
				nip: l.identifier,
				title: l.name,
				expertise: l.expertise,
				studyProgramId: prodiMap.get(l.prodiCode),
			},
		});

		if (l.identifier === "198503152010121002") {
			mainAdvisorProfileId = lecturerProfile.id;
		}
	}

	// Admin Seed
	const admins = [
		{
			identifier: "ADM001",
			email: "admin.akademik@unpanda.ac.id",
			name: "Siti Rahmawati, S.Kom.",
		},
		{
			identifier: "ADM002",
			email: "hendra.kurniawan@unpanda.ac.id",
			name: "Hendra Kurniawan, S.T.",
		},
	];
	for (const a of admins) {
		await prisma.user.upsert({
			where: { identifier: a.identifier },
			update: {
				name: a.name,
				email: a.email,
				role: Role.Admin,
				passwordHash: defaultPasswordHash,
				isActive: true,
			},
			create: {
				identifier: a.identifier,
				name: a.name,
				email: a.email,
				role: Role.Admin,
				passwordHash: defaultPasswordHash,
				isActive: true,
			},
		});
	}

	// Mahasiswa Seed (20 Mahasiswa Realistis Lintas Angkatan & Prodi)
	const students = [
		// Angkatan 2022 (Semester 5 - Mahasiswa Utama / Frontend Mock)
		{
			nim: "22010189",
			name: "Arya Wicaksana",
			email: "arya.wicaksana@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2022,
			currentSemester: 5,
			gpa: 3.78,
			totalSks: 88,
		},
		{
			nim: "22010190",
			name: "Nadya Putri Savitri",
			email: "nadya.savitri@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2022,
			currentSemester: 5,
			gpa: 3.85,
			totalSks: 88,
		},
		{
			nim: "22010191",
			name: "Bayu Kurniawan",
			email: "bayu.kurniawan@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2022,
			currentSemester: 5,
			gpa: 3.42,
			totalSks: 84,
		},
		{
			nim: "22010192",
			name: "Cindy Permatasari",
			email: "cindy.permatasari@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2022,
			currentSemester: 5,
			gpa: 3.65,
			totalSks: 86,
		},
		{
			nim: "22010193",
			name: "David Jonathan",
			email: "david.jonathan@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2022,
			currentSemester: 5,
			gpa: 3.2,
			totalSks: 82,
		},
		{
			nim: "22020088",
			name: "Zahra Aulia",
			email: "zahra.aulia@unpanda.ac.id",
			prodiCode: "SI",
			entryYear: 2022,
			currentSemester: 5,
			gpa: 3.9,
			totalSks: 90,
		},
		{
			nim: "22020089",
			name: "Fajar Nugroho",
			email: "fajar.nugroho@unpanda.ac.id",
			prodiCode: "SI",
			entryYear: 2022,
			currentSemester: 5,
			gpa: 3.35,
			totalSks: 84,
		},
		{
			nim: "22030045",
			name: "Gilang Ramadhan",
			email: "gilang.ramadhan@unpanda.ac.id",
			prodiCode: "TK",
			entryYear: 2022,
			currentSemester: 5,
			gpa: 3.5,
			totalSks: 85,
		},

		// Angkatan 2021 (Semester 7 - Tingkat Akhir)
		{
			nim: "21010012",
			name: "Dimas Pratama",
			email: "dimas.pratama@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2021,
			currentSemester: 7,
			gpa: 3.82,
			totalSks: 126,
		},
		{
			nim: "21010088",
			name: "Kevin Sanjaya",
			email: "kevin.sanjaya@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2021,
			currentSemester: 7,
			gpa: 3.65,
			totalSks: 122,
		},
		{
			nim: "21020034",
			name: "Salsabila Azzahra",
			email: "salsabila.azzahra@unpanda.ac.id",
			prodiCode: "SI",
			entryYear: 2021,
			currentSemester: 7,
			gpa: 3.7,
			totalSks: 124,
		},
		{
			nim: "21030018",
			name: "Rizky Aditya",
			email: "rizky.aditya@unpanda.ac.id",
			prodiCode: "TK",
			entryYear: 2021,
			currentSemester: 7,
			gpa: 3.55,
			totalSks: 122,
		},

		// Angkatan 2023 (Semester 3)
		{
			nim: "23010045",
			name: "Farhan Maulana",
			email: "farhan.maulana@unpanda.ac.id",
			prodiCode: "SI",
			entryYear: 2023,
			currentSemester: 3,
			gpa: 3.65,
			totalSks: 48,
		},
		{
			nim: "23010046",
			name: "Zahra Amalia",
			email: "zahra.amalia@unpanda.ac.id",
			prodiCode: "SI",
			entryYear: 2023,
			currentSemester: 3,
			gpa: 3.58,
			totalSks: 48,
		},
		{
			nim: "23010101",
			name: "Tiara Maharani",
			email: "tiara.maharani@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2023,
			currentSemester: 3,
			gpa: 3.88,
			totalSks: 52,
		},
		{
			nim: "23020015",
			name: "Anisa Rahma",
			email: "anisa.rahma@unpanda.ac.id",
			prodiCode: "SI",
			entryYear: 2023,
			currentSemester: 3,
			gpa: 3.72,
			totalSks: 50,
		},
		{
			nim: "23030022",
			name: "Ilham Hidayat",
			email: "ilham.hidayat@unpanda.ac.id",
			prodiCode: "TK",
			entryYear: 2023,
			currentSemester: 3,
			gpa: 3.3,
			totalSks: 46,
		},

		// Angkatan 2024 (Semester 1 - Mahasiswa Baru)
		{
			nim: "24010001",
			name: "Bagas Satria",
			email: "bagas.satria@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2024,
			currentSemester: 1,
			gpa: 0.0,
			totalSks: 20,
		},
		{
			nim: "24010002",
			name: "Cantika Dewi",
			email: "cantika.dewi@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2024,
			currentSemester: 1,
			gpa: 0.0,
			totalSks: 20,
		},
		{
			nim: "24010012",
			name: "Rizky Ramadhan",
			email: "rizky.ramadhan@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2024,
			currentSemester: 1,
			gpa: 0.0,
			totalSks: 20,
		},
		{
			nim: "24010013",
			name: "Putri Anggraini",
			email: "putri.anggraini@unpanda.ac.id",
			prodiCode: "IF",
			entryYear: 2024,
			currentSemester: 1,
			gpa: 0.0,
			totalSks: 20,
		},
		{
			nim: "24020005",
			name: "Dafi Alamsyah",
			email: "dafi.alamsyah@unpanda.ac.id",
			prodiCode: "SI",
			entryYear: 2024,
			currentSemester: 1,
			gpa: 0.0,
			totalSks: 20,
		},
		{
			nim: "24030008",
			name: "Eka Saputra",
			email: "eka.saputra@unpanda.ac.id",
			prodiCode: "TK",
			entryYear: 2024,
			currentSemester: 1,
			gpa: 0.0,
			totalSks: 20,
		},
	];

	for (const s of students) {
		const user = await prisma.user.upsert({
			where: { identifier: s.nim },
			update: {
				name: s.name,
				email: s.email,
				role: Role.Mahasiswa,
				passwordHash: defaultPasswordHash,
				isActive: true,
			},
			create: {
				identifier: s.nim,
				name: s.name,
				email: s.email,
				role: Role.Mahasiswa,
				passwordHash: defaultPasswordHash,
				isActive: true,
			},
		});

		await prisma.studentProfile.upsert({
			where: { userId: user.id },
			update: {
				nim: s.nim,
				studyProgramId: prodiMap.get(s.prodiCode) || ifProdiId,
				entryYear: s.entryYear,
				currentSemester: s.currentSemester,
				gpa: s.gpa,
				totalSks: s.totalSks,
				academicAdvisorId: mainAdvisorProfileId,
			},
			create: {
				userId: user.id,
				nim: s.nim,
				studyProgramId: prodiMap.get(s.prodiCode) || ifProdiId,
				entryYear: s.entryYear,
				currentSemester: s.currentSemester,
				gpa: s.gpa,
				totalSks: s.totalSks,
				academicAdvisorId: mainAdvisorProfileId,
			},
		});
	}

	// 8. Kelas Perkuliahan & Jadwal Semester Aktif (20261)
	const activeTerm = await prisma.academicTerm.findUnique({
		where: { code: "20261" },
	});

	if (activeTerm) {
		const budiLecturer = await prisma.lecturerProfile.findFirst({
			where: { user: { identifier: "198503152010121002" } },
		});
		const ratnaLecturer = await prisma.lecturerProfile.findFirst({
			where: { user: { identifier: "198807202014042001" } },
		});
		const dennyLecturer = await prisma.lecturerProfile.findFirst({
			where: { user: { identifier: "199011122018031003" } },
		});

		const roomMap = new Map<string, string>();
		const allRooms = await prisma.room.findMany();
		for (const r of allRooms) {
			roomMap.set(r.code, r.id);
		}

		const courseMap = new Map<string, string>();
		const allCourses = await prisma.course.findMany();
		for (const c of allCourses) {
			courseMap.set(c.code, c.id);
		}

		const classesToSeed = [
			{
				code: "IF3101-A",
				courseCode: "IF3101",
				lecturerId: budiLecturer?.id || "",
				quota: 40,
				enrolledCount: 36,
				schedules: [
					{
						roomCode: "LAB-AI-302",
						dayOfWeek: "Senin",
						startTime: "08:00",
						endTime: "10:30",
					},
				],
			},
			{
				code: "IF3102-A",
				courseCode: "IF3102",
				lecturerId: ratnaLecturer?.id || "",
				quota: 45,
				enrolledCount: 42,
				schedules: [
					{
						roomCode: "GDB-204",
						dayOfWeek: "Senin",
						startTime: "13:00",
						endTime: "15:30",
					},
				],
			},
			{
				code: "IF3103-A",
				courseCode: "IF3103",
				lecturerId: dennyLecturer?.id || "",
				quota: 35,
				enrolledCount: 33,
				schedules: [
					{
						roomCode: "LAB-MM-1",
						dayOfWeek: "Selasa",
						startTime: "09:30",
						endTime: "12:00",
					},
				],
			},
			{
				code: "IF3104-A",
				courseCode: "IF3104",
				lecturerId: ratnaLecturer?.id || "",
				quota: 35,
				enrolledCount: 35,
				schedules: [
					{
						roomCode: "LAB-NET-401",
						dayOfWeek: "Rabu",
						startTime: "08:00",
						endTime: "10:30",
					},
				],
			},
			{
				code: "IF3105-A",
				courseCode: "IF3105",
				lecturerId: dennyLecturer?.id || "",
				quota: 40,
				enrolledCount: 38,
				schedules: [
					{
						roomCode: "LAB-CLOUD",
						dayOfWeek: "Kamis",
						startTime: "13:00",
						endTime: "15:30",
					},
				],
			},
			{
				code: "IF3106-A",
				courseCode: "IF3106",
				lecturerId: dennyLecturer?.id || "",
				quota: 40,
				enrolledCount: 39,
				schedules: [
					{
						roomCode: "LAB-KOMP-201",
						dayOfWeek: "Kamis",
						startTime: "08:00",
						endTime: "10:30",
					},
				],
			},
			{
				code: "IF3107-A",
				courseCode: "IF3107",
				lecturerId: budiLecturer?.id || "",
				quota: 35,
				enrolledCount: 30,
				schedules: [
					{
						roomCode: "LAB-AI-302",
						dayOfWeek: "Jumat",
						startTime: "08:30",
						endTime: "11:00",
					},
				],
			},
			{
				code: "IF3108-A",
				courseCode: "IF3108",
				lecturerId: budiLecturer?.id || "",
				quota: 50,
				enrolledCount: 45,
				schedules: [
					{
						roomCode: "GDA-105",
						dayOfWeek: "Jumat",
						startTime: "13:30",
						endTime: "15:10",
					},
				],
			},
		];

		for (const cls of classesToSeed) {
			const courseId = courseMap.get(cls.courseCode);
			if (!courseId || !cls.lecturerId) continue;

			const createdClass = await prisma.class.upsert({
				where: {
					academicTermId_code: {
						academicTermId: activeTerm.id,
						code: cls.code,
					},
				},
				update: {
					quota: cls.quota,
					enrolledCount: cls.enrolledCount,
					lecturerId: cls.lecturerId,
				},
				create: {
					code: cls.code,
					courseId,
					academicTermId: activeTerm.id,
					lecturerId: cls.lecturerId,
					quota: cls.quota,
					enrolledCount: cls.enrolledCount,
					status: "Open",
				},
			});

			for (const s of cls.schedules) {
				const roomId = roomMap.get(s.roomCode);
				if (!roomId) continue;

				// Buat jadwal jika belum ada
				const existingSchedule = await prisma.schedule.findFirst({
					where: {
						classId: createdClass.id,
						roomId,
						dayOfWeek: s.dayOfWeek,
					},
				});

				if (!existingSchedule) {
					await prisma.schedule.create({
						data: {
							classId: createdClass.id,
							roomId,
							dayOfWeek: s.dayOfWeek,
							startTime: s.startTime,
							endTime: s.endTime,
						},
					});
				}
			}

			console.log(`🏛️ Kelas & Jadwal siap: [${cls.code}] ${cls.courseCode}`);
		}

		// 9. Seeding KRS Mahasiswa Awal (Sesuai Frontend Mock: Arya Wicaksana)
		const aryaProfile = await prisma.studentProfile.findUnique({
			where: { nim: "22010189" },
		});
		const budiDpa = await prisma.lecturerProfile.findFirst({
			where: { user: { identifier: "198503152010121002" } },
		});

		if (aryaProfile && budiDpa) {
			const initialClasses = [
				"IF3101-A",
				"IF3102-A",
				"IF3103-A",
				"IF3104-A",
				"IF3105-A",
			];

			for (const code of initialClasses) {
				const targetClass = await prisma.class.findFirst({
					where: { academicTermId: activeTerm.id, code },
				});
				if (targetClass) {
					await prisma.enrollment.upsert({
						where: {
							studentId_classId: {
								studentId: aryaProfile.id,
								classId: targetClass.id,
							},
						},
						update: {
							status: "Approved",
							approvedById: budiDpa.id,
							approvedAt: new Date("2026-08-24T10:00:00Z"),
						},
						create: {
							studentId: aryaProfile.id,
							classId: targetClass.id,
							academicTermId: activeTerm.id,
							status: "Approved",
							approvedById: budiDpa.id,
							approvedAt: new Date("2026-08-24T10:00:00Z"),
							notes: "KRS disetujui DPA sesuai rencana studi semester 5.",
						},
					});
				}
			}
			console.log(
				"📝 Initial KRS Mahasiswa Arya Wicaksana (5 Kelas Approved) siap.",
			);
		}
	}

	console.log("🎉 Seeding Data Master, Kelas, Pengguna & KRS Berhasil!");
}

main()
	.catch((e) => {
		console.error("❌ Gagal seeding data master:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
