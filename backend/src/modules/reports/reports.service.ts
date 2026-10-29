import { Role } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
	ForbiddenError,
	NotFoundError,
} from "../../middlewares/errorHandler.js";
import { buildCsv } from "./reports.csv.js";

export class ReportsService {
	/**
	 * Memvalidasi otorisasi akses kelas:
	 * Admin diizinkan mengakses semua kelas,
	 * Dosen hanya diizinkan mengakses kelas yang dia ampu sendiri.
	 */
	private async verifyClassAccess(classId: string, userId: string, role: Role) {
		const cls = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				course: { select: { code: true, name: true, sks: true } },
				academicTerm: { select: { code: true, name: true } },
				lecturer: {
					include: {
						user: { select: { name: true, email: true } },
					},
				},
			},
		});

		if (!cls) {
			throw new NotFoundError(
				`Kelas dengan ID ${classId} tidak ditemukan di sistem`,
			);
		}

		if (role === Role.Dosen) {
			const lecturerProfile = await prisma.lecturerProfile.findUnique({
				where: { userId },
			});

			if (!lecturerProfile || cls.lecturerId !== lecturerProfile.id) {
				throw new ForbiddenError(
					"Akses Ditolak: Anda hanya berhak mengunduh laporan dari kelas yang Anda ampu.",
				);
			}
		}

		return cls;
	}

	/**
	 * Ekspor Rekapitulasi Nilai Akhir Kelas dalam format CSV standar RFC 4180.
	 */
	async exportGradesCsv(classId: string, userId: string, role: Role) {
		const cls = await this.verifyClassAccess(classId, userId, role);

		// Ambil semua mahasiswa yang terdaftar di kelas ini beserta nilai mereka
		const enrollments = await prisma.enrollment.findMany({
			where: { classId: cls.id },
			include: {
				student: {
					include: {
						user: { select: { name: true } },
						studyProgram: { select: { name: true, code: true } },
					},
				},
				grade: true,
			},
			orderBy: { student: { nim: "asc" } },
		});

		const headers = [
			"No",
			"NIM",
			"Nama Mahasiswa",
			"Program Studi",
			"Kehadiran (10%)",
			"Tugas (20%)",
			"UTS (35%)",
			"UAS (35%)",
			"Nilai Akhir",
			"Nilai Huruf",
			"Bobot",
			"Status Kelulusan",
		];

		const rows = enrollments.map((enr, idx) => {
			const nim = enr.student.nim;
			const name = enr.student.user.name;
			const prodi = enr.student.studyProgram.name;
			const grade = enr.grade;

			if (!grade) {
				return [
					idx + 1,
					nim,
					name,
					prodi,
					"0.00",
					"0.00",
					"0.00",
					"0.00",
					"0.00",
					"E",
					"0.00",
					"BELUM DINILAI",
				];
			}

			const isPass = Number(grade.gradePoint) >= 2.0;

			return [
				idx + 1,
				nim,
				name,
				prodi,
				Number(grade.attendanceScore).toFixed(2),
				Number(grade.assignmentScore).toFixed(2),
				Number(grade.midtermScore).toFixed(2),
				Number(grade.finalExamScore).toFixed(2),
				Number(grade.finalScore).toFixed(2),
				grade.letterGrade,
				Number(grade.gradePoint).toFixed(2),
				isPass ? "LULUS" : "TIDAK LULUS",
			];
		});

		const csvContent = buildCsv(headers, rows);
		const sanitizedCode = cls.code.replace(/[^a-zA-Z0-9_-]/g, "_");
		const filename = `rekap_nilai_${sanitizedCode}_${cls.course.code}.csv`;

		return { filename, csvContent, count: enrollments.length };
	}

	/**
	 * Ekspor Rekapitulasi Presensi Matriks 16 Pertemuan Kelas dalam format CSV standar RFC 4180.
	 */
	async exportAttendanceCsv(classId: string, userId: string, role: Role) {
		const cls = await this.verifyClassAccess(classId, userId, role);

		// 1. Ambil 16 sesi perkuliahan
		const sessions = await prisma.attendanceSession.findMany({
			where: { classId: cls.id },
			include: {
				records: true,
			},
			orderBy: { sessionNumber: "asc" },
		});

		// 2. Ambil seluruh mahasiswa terdaftar
		const enrollments = await prisma.enrollment.findMany({
			where: { classId: cls.id },
			include: {
				student: {
					include: {
						user: { select: { name: true } },
						studyProgram: { select: { name: true } },
					},
				},
			},
			orderBy: { student: { nim: "asc" } },
		});

		// 3. Bangun Header Matrix P1 s.d. P16
		const sessionHeaders = Array.from({ length: 16 }, (_, i) => `P${i + 1}`);
		const headers = [
			"No",
			"NIM",
			"Nama Mahasiswa",
			"Program Studi",
			...sessionHeaders,
			"Total Hadir",
			"Total Izin",
			"Total Sakit",
			"Total Alpa",
			"Persentase Kehadiran (%)",
			"Status UAS",
		];

		// Map sessionNumber -> session object untuk lookup cepat
		const sessionMap = new Map<number, (typeof sessions)[0]>();
		for (const s of sessions) {
			sessionMap.set(s.sessionNumber, s);
		}

		const totalConductedSessions = sessions.length;

		const rows = enrollments.map((enr, idx) => {
			const nim = enr.student.nim;
			const name = enr.student.user.name;
			const prodi = enr.student.studyProgram.name;

			let hadirCount = 0;
			let izinCount = 0;
			let sakitCount = 0;
			let alpaCount = 0;

			const sessionCells: string[] = [];

			for (let p = 1; p <= 16; p++) {
				const sess = sessionMap.get(p);
				if (!sess) {
					sessionCells.push("-");
					continue;
				}

				const rec = sess.records.find((r) => r.studentId === enr.student.id);
				const status = rec ? rec.status : "Alpa";

				if (status === "Hadir") {
					hadirCount++;
					sessionCells.push("H");
				} else if (status === "Izin") {
					izinCount++;
					sessionCells.push("I");
				} else if (status === "Sakit") {
					sakitCount++;
					sessionCells.push("S");
				} else {
					alpaCount++;
					sessionCells.push("A");
				}
			}

			const percentage =
				totalConductedSessions > 0
					? Math.round((hadirCount / totalConductedSessions) * 100)
					: 100;

			const isUasEligible = percentage >= 75;

			return [
				idx + 1,
				nim,
				name,
				prodi,
				...sessionCells,
				hadirCount,
				izinCount,
				sakitCount,
				alpaCount,
				`${percentage}%`,
				isUasEligible ? "ELIGIBLE" : "TIDAK MEMENUHI SYARAT",
			];
		});

		const csvContent = buildCsv(headers, rows);
		const sanitizedCode = cls.code.replace(/[^a-zA-Z0-9_-]/g, "_");
		const filename = `rekap_presensi_${sanitizedCode}_${cls.course.code}.csv`;

		return { filename, csvContent, count: enrollments.length };
	}

	/**
	 * Rekapitulasi Eksekutif Prestasi Akademik Kampus (Khusus Administrator BAAK).
	 */
	async getAcademicSummaryReport(termId?: string) {
		const term = termId
			? await prisma.academicTerm.findUnique({ where: { id: termId } })
			: await prisma.academicTerm.findFirst({ where: { isActive: true } });

		if (!term) {
			throw new NotFoundError("Periode akademik tidak ditemukan");
		}

		// 1. Rata-rata IPK per Program Studi
		const studyPrograms = await prisma.studyProgram.findMany({
			where: { isActive: true },
			include: {
				students: {
					select: { gpa: true, totalSks: true, status: true },
				},
				_count: {
					select: { courses: true },
				},
			},
			orderBy: { code: "asc" },
		});

		const prodiSummary = studyPrograms.map((sp) => {
			const activeStudents = sp.students.filter((s) => s.status === "Aktif");
			let totalGpa = 0;
			for (const st of activeStudents) {
				totalGpa += Number(st.gpa);
			}

			const avgGpa =
				activeStudents.length > 0
					? Number((totalGpa / activeStudents.length).toFixed(2))
					: 0.0;

			return {
				code: sp.code,
				name: sp.name,
				totalStudents: activeStudents.length,
				averageGpa: avgGpa,
				courseCount: sp._count.courses,
			};
		});

		// 2. Distribusi Nilai Huruf Seluruh Kampus pada Periode Terkait
		const gradeDistributionRaw = await prisma.grade.groupBy({
			by: ["letterGrade"],
			where: {
				enrollment: {
					academicTermId: term.id,
				},
			},
			_count: {
				id: true,
			},
		});

		const gradeDistribution: Record<string, number> = {
			A: 0,
			"A-": 0,
			"B+": 0,
			B: 0,
			"B-": 0,
			"C+": 0,
			C: 0,
			D: 0,
			E: 0,
		};

		for (const gd of gradeDistributionRaw) {
			gradeDistribution[gd.letterGrade] = gd._count.id;
		}

		// 3. Rata-rata IPK Kampus
		const allActiveStudents = await prisma.studentProfile.findMany({
			where: { status: "Aktif" },
			select: { gpa: true },
		});

		let campusGpaSum = 0;
		for (const st of allActiveStudents) {
			campusGpaSum += Number(st.gpa);
		}
		const campusAverageGpa =
			allActiveStudents.length > 0
				? Number((campusGpaSum / allActiveStudents.length).toFixed(2))
				: 0.0;

		return {
			term: {
				id: term.id,
				code: term.code,
				name: term.name,
				academicYear: term.academicYear,
				semester: term.semester,
			},
			campusAverageGpa,
			totalActiveStudents: allActiveStudents.length,
			studyPrograms: prodiSummary,
			gradeDistribution,
		};
	}
}

export const reportsService = new ReportsService();
