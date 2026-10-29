import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../middlewares/errorHandler.js";

const INDONESIAN_DAYS = [
	"Minggu",
	"Senin",
	"Selasa",
	"Rabu",
	"Kamis",
	"Jumat",
	"Sabtu",
];

export function getCurrentIndonesianDay(): string {
	const dayIndex = new Date().getDay();
	return INDONESIAN_DAYS[dayIndex];
}

export class DashboardService {
	/**
	 * Mengambil data ringkasan metrik statistik untuk BAAK & Administrator Utama.
	 */
	async getAdminDashboard(termId?: string) {
		// 1. Tentukan periode akademik yang relevan (aktif atau sesuai filter termId)
		const term = termId
			? await prisma.academicTerm.findUnique({ where: { id: termId } })
			: await prisma.academicTerm.findFirst({ where: { isActive: true } });

		if (!term) {
			throw new NotFoundError("Periode akademik aktif tidak ditemukan");
		}

		// 2. Eksekusi query agregasi secara paralel via Promise.all
		const [
			totalStudents,
			totalLecturers,
			totalCourses,
			totalClasses,
			totalRooms,
			totalUsers,
			totalEnrollments,
			krsSubmittedCount,
			krsApprovedCount,
			studyPrograms,
			scheduledRoomsCount,
		] = await Promise.all([
			prisma.studentProfile.count({ where: { status: "Aktif" } }),
			prisma.lecturerProfile.count({ where: { status: "Aktif" } }),
			prisma.course.count({ where: { isActive: true } }),
			prisma.class.count({ where: { academicTermId: term.id } }),
			prisma.room.count({ where: { isActive: true } }),
			prisma.user.count({ where: { isActive: true } }),
			prisma.enrollment.count({ where: { academicTermId: term.id } }),
			prisma.enrollment.count({
				where: { academicTermId: term.id, status: "Submitted" },
			}),
			prisma.enrollment.count({
				where: { academicTermId: term.id, status: "Approved" },
			}),
			prisma.studyProgram.findMany({
				where: { isActive: true },
				select: {
					id: true,
					code: true,
					name: true,
					degree: true,
					accreditation: true,
					_count: {
						select: {
							students: true,
							lecturerProfiles: true,
							courses: true,
						},
					},
				},
				orderBy: { code: "asc" },
			}),
			prisma.schedule.groupBy({
				by: ["roomId"],
				where: {
					class: { academicTermId: term.id },
				},
			}),
		]);

		// Menghitung rasio pemanfaatan ruangan (ruangan dengan minimal 1 jadwal dibagi total ruangan)
		const occupancyRate =
			totalRooms > 0
				? Math.round((scheduledRoomsCount.length / totalRooms) * 100)
				: 0;

		return {
			activePeriod: {
				id: term.id,
				code: term.code,
				name: term.name,
				academicYear: term.academicYear,
				semester: term.semester,
				isKrsOpen: term.isKrsOpen,
				isGradeInputOpen: term.isGradeInputOpen,
				krsStartDate: term.krsStartDate,
				krsEndDate: term.krsEndDate,
				gradeInputStartDate: term.gradeInputStartDate,
				gradeInputEndDate: term.gradeInputEndDate,
			},
			stats: {
				totalStudents,
				totalLecturers,
				totalCourses,
				totalClasses,
				totalRooms,
				totalUsers,
				totalEnrollments,
				occupancyRate,
				krsOverview: {
					submitted: krsSubmittedCount,
					approved: krsApprovedCount,
					draft: totalEnrollments - (krsSubmittedCount + krsApprovedCount),
				},
			},
			studyPrograms: studyPrograms.map((sp) => ({
				id: sp.id,
				code: sp.code,
				name: sp.name,
				degree: sp.degree,
				accreditation: sp.accreditation,
				studentCount: sp._count.students,
				lecturerCount: sp._count.lecturerProfiles,
				courseCount: sp._count.courses,
			})),
		};
	}

	/**
	 * Mengambil data ringkasan metrik untuk Portal Dosen (kelas diampu, bimbingan KRS, jadwal mengajar).
	 */
	async getLecturerDashboard(
		userId: string,
		dayFilter?: string,
		termId?: string,
	) {
		// 1. Dapatkan profil dosen berdasarkan userId
		const lecturer = await prisma.lecturerProfile.findUnique({
			where: { userId },
			include: {
				user: { select: { name: true, email: true, avatar: true } },
				studyProgram: { select: { code: true, name: true } },
			},
		});

		if (!lecturer) {
			throw new NotFoundError("Profil Dosen tidak ditemukan");
		}

		// 2. Dapatkan periode akademik
		const term = termId
			? await prisma.academicTerm.findUnique({ where: { id: termId } })
			: await prisma.academicTerm.findFirst({ where: { isActive: true } });

		if (!term) {
			throw new NotFoundError("Periode akademik aktif tidak ditemukan");
		}

		// 3. Ambil kelas yang diampu oleh dosen ini pada periode terkait
		const classes = await prisma.class.findMany({
			where: {
				lecturerId: lecturer.id,
				academicTermId: term.id,
			},
			include: {
				course: { select: { code: true, name: true, sks: true } },
				schedules: {
					include: {
						room: { select: { code: true, name: true } },
					},
				},
				enrollments: {
					select: {
						id: true,
						grade: {
							select: {
								id: true,
								status: true,
								finalScore: true,
								letterGrade: true,
							},
						},
					},
				},
			},
			orderBy: { code: "asc" },
		});

		// 4. Hitung statistik pengajaran dan mahasiswa binaan
		let totalStudents = 0;
		let totalGradedFinal = 0;
		for (const cls of classes) {
			totalStudents += cls.enrolledCount;
			for (const enr of cls.enrollments) {
				if (enr.grade && enr.grade.status === "Final") {
					totalGradedFinal++;
				}
			}
		}

		const gradingCompleteness =
			totalStudents > 0
				? Math.round((totalGradedFinal / totalStudents) * 100)
				: 100;

		// 5. Cek mahasiswa bimbingan akademik (DPA) yang menunggu persetujuan KRS
		const pendingKrsApprovals = await prisma.enrollment.count({
			where: {
				academicTermId: term.id,
				status: "Submitted",
				student: {
					academicAdvisorId: lecturer.id,
				},
			},
		});

		// 6. Tentukan jadwal mengajar hari ini
		const targetDay = dayFilter || getCurrentIndonesianDay();
		const todaySchedules: Array<{
			classId: string;
			classCode: string;
			courseCode: string;
			courseName: string;
			sks: number;
			room: string;
			startTime: string;
			endTime: string;
			enrolledCount: number;
		}> = [];

		for (const cls of classes) {
			for (const sch of cls.schedules) {
				if (sch.dayOfWeek.toLowerCase() === targetDay.toLowerCase()) {
					todaySchedules.push({
						classId: cls.id,
						classCode: cls.code,
						courseCode: cls.course.code,
						courseName: cls.course.name,
						sks: cls.course.sks,
						room: `${sch.room.code} (${sch.room.name})`,
						startTime: sch.startTime,
						endTime: sch.endTime,
						enrolledCount: cls.enrolledCount,
					});
				}
			}
		}

		// Sort jadwal hari ini berdasarkan jam mulai
		todaySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime));

		return {
			lecturer: {
				id: lecturer.id,
				name: lecturer.user.name,
				nidn: lecturer.nidn,
				nip: lecturer.nip,
				title: lecturer.title,
				email: lecturer.user.email,
				prodi:
					lecturer.studyProgram?.name || "Fakultas Teknologi dan Informatika",
				prodiCode: lecturer.studyProgram?.code || "FTI",
			},
			activePeriod: {
				id: term.id,
				code: term.code,
				name: term.name,
				academicYear: term.academicYear,
				semester: term.semester,
				isGradeInputOpen: term.isGradeInputOpen,
			},
			stats: {
				totalClasses: classes.length,
				totalStudents,
				pendingKrsApprovals,
				gradingCompleteness,
				todaySessionCount: todaySchedules.length,
			},
			todaySchedule: {
				day: targetDay,
				sessions: todaySchedules,
			},
			classes: classes.map((cls) => ({
				id: cls.id,
				code: cls.code,
				courseCode: cls.course.code,
				courseName: cls.course.name,
				sks: cls.course.sks,
				quota: cls.quota,
				enrolledCount: cls.enrolledCount,
				status: cls.status,
				schedules: cls.schedules.map((s) => ({
					dayOfWeek: s.dayOfWeek,
					startTime: s.startTime,
					endTime: s.endTime,
					room: s.room.code,
				})),
			})),
		};
	}

	/**
	 * Mengambil data ringkasan metrik untuk Portal Mahasiswa (IPK, SKS, Jadwal Hari Ini, Presensi).
	 */
	async getStudentDashboard(
		userId: string,
		dayFilter?: string,
		termId?: string,
	) {
		// 1. Ambil data profil mahasiswa
		const student = await prisma.studentProfile.findUnique({
			where: { userId },
			include: {
				user: { select: { name: true, email: true, avatar: true } },
				studyProgram: { select: { code: true, name: true } },
				academicAdvisor: {
					include: {
						user: { select: { name: true } },
					},
				},
			},
		});

		if (!student) {
			throw new NotFoundError("Profil Mahasiswa tidak ditemukan");
		}

		// 2. Ambil periode akademik
		const term = termId
			? await prisma.academicTerm.findUnique({ where: { id: termId } })
			: await prisma.academicTerm.findFirst({ where: { isActive: true } });

		if (!term) {
			throw new NotFoundError("Periode akademik aktif tidak ditemukan");
		}

		// 3. Ambil seluruh enrollment mahasiswa pada periode ini
		const enrollments = await prisma.enrollment.findMany({
			where: {
				studentId: student.id,
				academicTermId: term.id,
			},
			include: {
				class: {
					include: {
						course: { select: { code: true, name: true, sks: true } },
						lecturer: {
							include: { user: { select: { name: true } } },
						},
						schedules: {
							include: { room: { select: { code: true, name: true } } },
						},
						attendanceSessions: {
							select: {
								id: true,
								sessionNumber: true,
								records: {
									where: { studentId: student.id },
									select: { status: true },
								},
							},
						},
					},
				},
				grade: true,
			},
			orderBy: { class: { code: "asc" } },
		});

		// 4. Hitung SKS yang sedang diambil semester ini
		let currentSemesterSks = 0;
		for (const enr of enrollments) {
			currentSemesterSks += enr.class.course.sks;
		}

		// 5. Hitung tingkat presensi agregat mahasiswa
		let totalConductedSessions = 0;
		let totalPresentSessions = 0;

		const enrolledClassesSummary = enrollments.map((enr) => {
			const conductedSessions = enr.class.attendanceSessions.length;
			let presentCount = 0;
			for (const sess of enr.class.attendanceSessions) {
				const rec = sess.records[0];
				if (rec && rec.status === "Hadir") {
					presentCount++;
				}
			}

			totalConductedSessions += conductedSessions;
			totalPresentSessions += presentCount;

			const classAttendancePct =
				conductedSessions > 0
					? Math.round((presentCount / conductedSessions) * 100)
					: 100;

			return {
				enrollmentId: enr.id,
				status: enr.status,
				classId: enr.class.id,
				classCode: enr.class.code,
				courseCode: enr.class.course.code,
				courseName: enr.class.course.name,
				sks: enr.class.course.sks,
				lecturerName: enr.class.lecturer.user.name,
				attendancePercentage: classAttendancePct,
				schedules: enr.class.schedules.map((s) => ({
					dayOfWeek: s.dayOfWeek,
					startTime: s.startTime,
					endTime: s.endTime,
					room: s.room.code,
				})),
			};
		});

		const overallAttendancePercentage =
			totalConductedSessions > 0
				? Math.round((totalPresentSessions / totalConductedSessions) * 100)
				: 100;

		const isEligibleForUas = overallAttendancePercentage >= 75;

		// 6. Cari jadwal kuliah hari ini untuk mahasiswa ini
		const targetDay = dayFilter || getCurrentIndonesianDay();
		const todaySchedules: Array<{
			classId: string;
			classCode: string;
			courseCode: string;
			courseName: string;
			sks: number;
			lecturerName: string;
			room: string;
			startTime: string;
			endTime: string;
		}> = [];

		for (const enr of enrollments) {
			for (const sch of enr.class.schedules) {
				if (sch.dayOfWeek.toLowerCase() === targetDay.toLowerCase()) {
					todaySchedules.push({
						classId: enr.class.id,
						classCode: enr.class.code,
						courseCode: enr.class.course.code,
						courseName: enr.class.course.name,
						sks: enr.class.course.sks,
						lecturerName: enr.class.lecturer.user.name,
						room: `${sch.room.code} (${sch.room.name})`,
						startTime: sch.startTime,
						endTime: sch.endTime,
					});
				}
			}
		}

		todaySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime));

		return {
			student: {
				id: student.id,
				name: student.user.name,
				nim: student.nim,
				email: student.user.email,
				prodi: student.studyProgram.name,
				prodiCode: student.studyProgram.code,
				entryYear: student.entryYear,
				currentSemester: student.currentSemester,
				status: student.status,
				academicAdvisor:
					student.academicAdvisor?.user.name || "Belum Ditentukan",
			},
			activePeriod: {
				id: term.id,
				code: term.code,
				name: term.name,
				academicYear: term.academicYear,
				semester: term.semester,
				isKrsOpen: term.isKrsOpen,
			},
			stats: {
				gpa: Number(student.gpa),
				totalSksPassed: student.totalSks,
				currentSemesterSks,
				currentSemesterClassCount: enrollments.length,
				overallAttendancePercentage,
				isEligibleForUas,
			},
			todaySchedule: {
				day: targetDay,
				sessions: todaySchedules,
			},
			enrolledClasses: enrolledClassesSummary,
		};
	}
}

export const dashboardService = new DashboardService();
