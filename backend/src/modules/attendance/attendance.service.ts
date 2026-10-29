import { prisma } from "../../lib/prisma.js";
import {
	ForbiddenError,
	NotFoundError,
} from "../../middlewares/errorHandler.js";
import type { RecordSessionAttendanceInput } from "./attendance.schema.js";

export class AttendanceService {
	/**
	 * Dosen / Admin mencatat atau memperbarui absensi satu sesi perkuliahan (pertemuan 1 - 16)
	 */
	async recordSessionAttendance(
		userId: string,
		userRole: string,
		input: RecordSessionAttendanceInput,
	) {
		const targetClass = await prisma.class.findUnique({
			where: { id: input.classId },
			include: { course: true, lecturer: true },
		});

		if (!targetClass) {
			throw new NotFoundError("Kelas perkuliahan tidak ditemukan.");
		}

		// Validasi otorisasi: Dosen hanya boleh mengabsen kelasnya sendiri
		if (userRole === "Dosen") {
			const lecturer = await prisma.lecturerProfile.findUnique({
				where: { userId },
			});
			if (!lecturer || targetClass.lecturerId !== lecturer.id) {
				throw new ForbiddenError(
					"Anda tidak memiliki akses untuk mencatat absensi pada kelas ini.",
				);
			}
		}

		return prisma.$transaction(async (tx) => {
			const sessionDate = input.date ? new Date(input.date) : new Date();

			// 1. Buat atau perbarui sesi pertemuan
			const session = await tx.attendanceSession.upsert({
				where: {
					classId_sessionNumber: {
						classId: input.classId,
						sessionNumber: input.sessionNumber,
					},
				},
				update: {
					date: sessionDate,
					startTime: input.startTime,
					endTime: input.endTime,
					topic: input.topic,
				},
				create: {
					classId: input.classId,
					sessionNumber: input.sessionNumber,
					date: sessionDate,
					startTime: input.startTime,
					endTime: input.endTime,
					topic: input.topic || `Pertemuan ${input.sessionNumber}`,
				},
			});

			// 2. Simpan atau perbarui absensi masing-masing mahasiswa
			for (const record of input.records) {
				await tx.attendanceRecord.upsert({
					where: {
						sessionId_studentId: {
							sessionId: session.id,
							studentId: record.studentId,
						},
					},
					update: {
						status: record.status,
						notes: record.notes,
					},
					create: {
						sessionId: session.id,
						studentId: record.studentId,
						status: record.status,
						notes: record.notes,
					},
				});
			}

			return {
				message: `Presensi Pertemuan ${input.sessionNumber} kelas ${targetClass.course.name} (${targetClass.code}) berhasil disimpan (${input.records.length} mahasiswa).`,
				session: {
					id: session.id,
					sessionNumber: session.sessionNumber,
					date: session.date,
					topic: session.topic,
					recordsCount: input.records.length,
				},
			};
		});
	}

	/**
	 * Mengambil data kehadiran kelas pada sesi pertemuan tertentu
	 */
	async getSessionAttendance(
		userId: string,
		userRole: string,
		classId: string,
		sessionNumber: number,
	) {
		const targetClass = await prisma.class.findUnique({
			where: { id: classId },
			include: { course: true },
		});

		if (!targetClass) {
			throw new NotFoundError("Kelas perkuliahan tidak ditemukan.");
		}

		if (userRole === "Dosen") {
			const lecturer = await prisma.lecturerProfile.findUnique({
				where: { userId },
			});
			if (!lecturer || targetClass.lecturerId !== lecturer.id) {
				throw new ForbiddenError(
					"Anda tidak memiliki akses melihat absensi kelas ini.",
				);
			}
		}

		// Dapatkan seluruh mahasiswa yang terdaftar sah di kelas ini
		const enrollments = await prisma.enrollment.findMany({
			where: { classId, status: "Approved" },
			include: {
				student: {
					include: { user: { select: { name: true } } },
				},
			},
			orderBy: { student: { nim: "asc" } },
		});

		// Cari apakah sesi sudah pernah dibuat
		const session = await prisma.attendanceSession.findUnique({
			where: {
				classId_sessionNumber: {
					classId,
					sessionNumber,
				},
			},
			include: { records: true },
		});

		const recordMap = new Map<string, string>();
		if (session) {
			for (const r of session.records) {
				recordMap.set(r.studentId, r.status);
			}
		}

		const students = enrollments.map((en) => {
			const status = recordMap.get(en.student.id) || "Hadir";
			return {
				studentId: en.student.id,
				nim: en.student.nim,
				nama: en.student.user.name,
				status,
			};
		});

		return {
			classInfo: {
				id: targetClass.id,
				code: targetClass.code,
				courseName: targetClass.course.name,
				courseCode: targetClass.course.code,
				sessionNumber,
			},
			session: session
				? {
						id: session.id,
						date: session.date,
						topic: session.topic,
						startTime: session.startTime,
						endTime: session.endTime,
					}
				: null,
			students,
		};
	}

	/**
	 * Dosen melihat rekapitulasi kehadiran lengkap satu kelas (seluruh 16 pertemuan)
	 */
	async getClassAttendanceRecap(
		userId: string,
		userRole: string,
		classId: string,
	) {
		const targetClass = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				course: true,
				attendanceSessions: {
					include: { records: true },
					orderBy: { sessionNumber: "asc" },
				},
			},
		});

		if (!targetClass) {
			throw new NotFoundError("Kelas tidak ditemukan.");
		}

		if (userRole === "Dosen") {
			const lecturer = await prisma.lecturerProfile.findUnique({
				where: { userId },
			});
			if (!lecturer || targetClass.lecturerId !== lecturer.id) {
				throw new ForbiddenError(
					"Anda tidak memiliki akses rekapitulasi kelas ini.",
				);
			}
		}

		const enrollments = await prisma.enrollment.findMany({
			where: { classId, status: "Approved" },
			include: {
				student: {
					include: { user: { select: { name: true } } },
				},
			},
			orderBy: { student: { nim: "asc" } },
		});

		const totalSessionsHeld = targetClass.attendanceSessions.length;

		const studentRecaps = enrollments.map((en) => {
			let hadir = 0;
			let izin = 0;
			let sakit = 0;
			let alpa = 0;

			for (const sess of targetClass.attendanceSessions) {
				const rec = sess.records.find((r) => r.studentId === en.student.id);
				if (rec) {
					if (rec.status === "Hadir") hadir++;
					else if (rec.status === "Izin") izin++;
					else if (rec.status === "Sakit") sakit++;
					else if (rec.status === "Alpa") alpa++;
				} else {
					alpa++; // Default alpa jika sesi terlaksana namun tidak diabsen
				}
			}

			const percentage =
				totalSessionsHeld > 0
					? Math.round((hadir / totalSessionsHeld) * 100)
					: 100;
			const isEligibleForExam = percentage >= 75;

			return {
				studentId: en.student.id,
				nim: en.student.nim,
				nama: en.student.user.name,
				totalPertemuan: totalSessionsHeld,
				hadir,
				izin,
				sakit,
				alpa,
				persentase: percentage,
				statusUjian: isEligibleForExam
					? "Memenuhi Syarat"
					: "Tidak Memenuhi Syarat",
			};
		});

		return {
			classInfo: {
				id: targetClass.id,
				code: targetClass.code,
				courseName: targetClass.course.name,
				totalSessionsHeld,
			},
			students: studentRecaps,
		};
	}

	/**
	 * Mahasiswa melihat rekapitulasi presensi seluruh mata kuliah yang diambilnya
	 */
	async getStudentAttendanceRecap(
		studentUserId: string,
		academicTermId?: string,
	) {
		const student = await prisma.studentProfile.findUnique({
			where: { userId: studentUserId },
			include: { user: true },
		});

		if (!student) {
			throw new NotFoundError("Profil mahasiswa tidak ditemukan.");
		}

		let targetTermId = academicTermId;
		if (!targetTermId) {
			const activeTerm = await prisma.academicTerm.findFirst({
				where: { isActive: true },
			});
			targetTermId = activeTerm?.id;
		}

		if (!targetTermId) {
			throw new NotFoundError("Periode akademik tidak ditentukan.");
		}

		const enrollments = await prisma.enrollment.findMany({
			where: {
				studentId: student.id,
				academicTermId: targetTermId,
				status: "Approved",
			},
			include: {
				class: {
					include: {
						course: true,
						lecturer: { include: { user: { select: { name: true } } } },
						attendanceSessions: {
							include: {
								records: { where: { studentId: student.id } },
							},
						},
					},
				},
			},
			orderBy: { class: { course: { code: "asc" } } },
		});

		const items = enrollments.map((en) => {
			const cls = en.class;
			const totalPertemuan = cls.attendanceSessions.length;

			let hadir = 0;
			let izin = 0;
			let sakit = 0;
			let alpa = 0;

			for (const sess of cls.attendanceSessions) {
				const rec = sess.records[0];
				if (rec) {
					if (rec.status === "Hadir") hadir++;
					else if (rec.status === "Izin") izin++;
					else if (rec.status === "Sakit") sakit++;
					else if (rec.status === "Alpa") alpa++;
				} else {
					alpa++;
				}
			}

			const persentase =
				totalPertemuan > 0 ? Math.round((hadir / totalPertemuan) * 100) : 100;

			return {
				id: en.id,
				kode: cls.course.code,
				matkul: cls.course.name,
				sks: cls.course.sks,
				dosen: cls.lecturer.user.name,
				totalPertemuan,
				hadir,
				izin,
				sakit,
				alpa,
				persentase,
				isEligible: persentase >= 75,
				status: persentase >= 75 ? "Memenuhi Syarat" : "Perhatian",
			};
		});

		return items;
	}
}

export const attendanceService = new AttendanceService();
