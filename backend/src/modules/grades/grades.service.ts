import { prisma } from "../../lib/prisma.js";
import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
} from "../../middlewares/errorHandler.js";
import type {
	BatchInputGradesInput,
	UpdateSingleGradeInput,
} from "./grades.schema.js";

export function calculateFinalScore(
	attendance: number,
	assignment: number,
	midterm: number,
	finalExam: number,
): { finalScore: number; letterGrade: string; gradePoint: number } {
	// Formula resmi FTI UNPANDA: 10% kehadiran + 20% tugas + 35% UTS + 35% UAS
	const finalScore = Number(
		(
			attendance * 0.1 +
			assignment * 0.2 +
			midterm * 0.35 +
			finalExam * 0.35
		).toFixed(1),
	);

	let letterGrade = "E";
	let gradePoint = 0.0;

	if (finalScore >= 85) {
		letterGrade = "A";
		gradePoint = 4.0;
	} else if (finalScore >= 80) {
		letterGrade = "A-";
		gradePoint = 3.75;
	} else if (finalScore >= 75) {
		letterGrade = "B+";
		gradePoint = 3.5;
	} else if (finalScore >= 70) {
		letterGrade = "B";
		gradePoint = 3.0;
	} else if (finalScore >= 65) {
		letterGrade = "B-";
		gradePoint = 2.75;
	} else if (finalScore >= 60) {
		letterGrade = "C+";
		gradePoint = 2.5;
	} else if (finalScore >= 55) {
		letterGrade = "C";
		gradePoint = 2.0;
	} else if (finalScore >= 40) {
		letterGrade = "D";
		gradePoint = 1.0;
	} else {
		letterGrade = "E";
		gradePoint = 0.0;
	}

	return { finalScore, letterGrade, gradePoint };
}

export function getPredicateByIpk(ipk: number): string {
	if (ipk >= 3.51) return "Cumlaude";
	if (ipk >= 3.01) return "Sangat Memuaskan";
	if (ipk >= 2.76) return "Memuaskan";
	return "Cukup";
}

export class GradesService {
	/**
	 * Dosen melihat daftar mahasiswa di kelas yang diampu untuk penginputan nilai
	 */
	async getClassStudentsForGrading(
		userId: string,
		userRole: string,
		classId: string,
	) {
		const targetClass = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				course: true,
				academicTerm: true,
				lecturer: true,
			},
		});

		if (!targetClass) {
			throw new NotFoundError("Kelas perkuliahan tidak ditemukan.");
		}

		// Otorisasi: Dosen hanya boleh melihat & menilai kelas miliknya sendiri (Admin punya bypass)
		if (userRole === "Dosen") {
			const lecturer = await prisma.lecturerProfile.findUnique({
				where: { userId },
			});
			if (!lecturer || targetClass.lecturerId !== lecturer.id) {
				throw new ForbiddenError(
					"Anda tidak memiliki akses untuk menginput nilai pada kelas ini.",
				);
			}
		}

		const enrollments = await prisma.enrollment.findMany({
			where: {
				classId,
				status: "Approved", // Hanya mahasiswa yang KRS-nya sudah disetujui
			},
			include: {
				student: {
					include: { user: { select: { name: true, email: true } } },
				},
				grade: true,
			},
			orderBy: { student: { nim: "asc" } },
		});

		const students = enrollments.map((en) => {
			const attendance = Number(en.grade?.attendanceScore ?? 0);
			const assignment = Number(en.grade?.assignmentScore ?? 0);
			const midterm = Number(en.grade?.midtermScore ?? 0);
			const finalExam = Number(en.grade?.finalExamScore ?? 0);
			const finalScore = Number(en.grade?.finalScore ?? 0);
			const letterGrade = en.grade?.letterGrade ?? "E";
			const gradePoint = Number(en.grade?.gradePoint ?? 0);
			const status = en.grade?.status ?? "Draft";

			return {
				enrollmentId: en.id,
				gradeId: en.grade?.id ?? null,
				nim: en.student.nim,
				nama: en.student.user.name,
				kehadiran: attendance,
				tugas: assignment,
				uts: midterm,
				uas: finalExam,
				nilaiAkhir: finalScore,
				nilaiHuruf: letterGrade,
				bobot: gradePoint,
				status,
			};
		});

		return {
			classInfo: {
				id: targetClass.id,
				code: targetClass.code,
				courseName: targetClass.course.name,
				courseCode: targetClass.course.code,
				sks: targetClass.course.sks,
				term: targetClass.academicTerm.name,
				isGradeInputOpen: targetClass.academicTerm.isGradeInputOpen,
			},
			students,
		};
	}

	/**
	 * Dosen / Admin menyimpan nilai batch (Draft atau Final)
	 */
	async batchSaveGrades(
		userId: string,
		userRole: string,
		input: BatchInputGradesInput,
	) {
		const targetClass = await prisma.class.findUnique({
			where: { id: input.classId },
			include: { academicTerm: true },
		});

		if (!targetClass) {
			throw new NotFoundError("Kelas tidak ditemukan.");
		}

		// Validasi otorisasi dosen
		let lecturerProfileId: string | null = null;
		if (userRole === "Dosen") {
			const lecturer = await prisma.lecturerProfile.findUnique({
				where: { userId },
			});
			if (!lecturer || targetClass.lecturerId !== lecturer.id) {
				throw new ForbiddenError(
					"Anda tidak berhak memasukkan nilai untuk kelas ini.",
				);
			}
			lecturerProfileId = lecturer.id;
		}

		// Validasi jendela periode input nilai (jika role Dosen)
		if (userRole === "Dosen") {
			const term = targetClass.academicTerm;
			const now = new Date();
			const isWithinWindow =
				term.isGradeInputOpen ||
				(now >= term.gradeInputStartDate && now <= term.gradeInputEndDate);

			if (!isWithinWindow) {
				throw new BadRequestError(
					"Periode penginputan nilai untuk semester ini sedang ditutup oleh BAAK.",
				);
			}
		}

		return prisma.$transaction(async (tx) => {
			const updatedGrades = [];

			for (const item of input.grades) {
				const enrollment = await tx.enrollment.findUnique({
					where: { id: item.enrollmentId },
					include: { grade: true, student: true },
				});

				if (!enrollment) {
					throw new NotFoundError(
						`Enrollment ID ${item.enrollmentId} tidak ditemukan.`,
					);
				}

				const { finalScore, letterGrade, gradePoint } = calculateFinalScore(
					item.attendanceScore,
					item.assignmentScore,
					item.midtermScore,
					item.finalExamScore,
				);

				const prevGrade = enrollment.grade;
				const isNew = !prevGrade;

				const savedGrade = await tx.grade.upsert({
					where: { enrollmentId: item.enrollmentId },
					update: {
						attendanceScore: item.attendanceScore,
						assignmentScore: item.assignmentScore,
						midtermScore: item.midtermScore,
						finalExamScore: item.finalExamScore,
						finalScore,
						letterGrade,
						gradePoint,
						status: input.status,
						submittedAt: input.status === "Final" ? new Date() : undefined,
						submittedById: lecturerProfileId,
					},
					create: {
						enrollmentId: item.enrollmentId,
						attendanceScore: item.attendanceScore,
						assignmentScore: item.assignmentScore,
						midtermScore: item.midtermScore,
						finalExamScore: item.finalExamScore,
						finalScore,
						letterGrade,
						gradePoint,
						status: input.status,
						submittedAt: input.status === "Final" ? new Date() : undefined,
						submittedById: lecturerProfileId,
					},
				});

				// Rekam Audit Trail
				await tx.gradeAuditLog.create({
					data: {
						gradeId: savedGrade.id,
						changedById: userId,
						component: "final",
						previousScore: prevGrade?.finalScore ?? null,
						newScore: finalScore,
						previousGrade: prevGrade?.letterGrade ?? null,
						newGrade: letterGrade,
						reason:
							item.reason ||
							(isNew
								? `Input nilai awal (${input.status})`
								: `Pembaruan nilai (${input.status})`),
					},
				});

				// Jika status Final, perbarui akumulasi IPK dan total SKS mahasiswa
				if (input.status === "Final") {
					await this.recalculateStudentGPA(tx, enrollment.studentId);
				}

				updatedGrades.push(savedGrade);
			}

			return {
				message: `Berhasil menyimpan ${updatedGrades.length} nilai mahasiswa dengan status ${input.status}.`,
				count: updatedGrades.length,
				status: input.status,
			};
		});
	}

	/**
	 * Koreksi nilai tunggal mahasiswa dengan kewajiban mengisi alasan (Audit Trail)
	 */
	async updateSingleGrade(
		userId: string,
		userRole: string,
		gradeId: string,
		input: UpdateSingleGradeInput,
	) {
		const existingGrade = await prisma.grade.findUnique({
			where: { id: gradeId },
			include: {
				enrollment: {
					include: { class: true, student: true },
				},
			},
		});

		if (!existingGrade) {
			throw new NotFoundError("Data nilai tidak ditemukan.");
		}

		if (userRole === "Dosen") {
			const lecturer = await prisma.lecturerProfile.findUnique({
				where: { userId },
			});
			if (
				!lecturer ||
				existingGrade.enrollment.class.lecturerId !== lecturer.id
			) {
				throw new ForbiddenError(
					"Anda tidak berhak mengubah nilai pada mata kuliah ini.",
				);
			}
		}

		return prisma.$transaction(async (tx) => {
			const attendance =
				input.attendanceScore ?? Number(existingGrade.attendanceScore);
			const assignment =
				input.assignmentScore ?? Number(existingGrade.assignmentScore);
			const midterm = input.midtermScore ?? Number(existingGrade.midtermScore);
			const finalExam =
				input.finalExamScore ?? Number(existingGrade.finalExamScore);

			const { finalScore, letterGrade, gradePoint } = calculateFinalScore(
				attendance,
				assignment,
				midterm,
				finalExam,
			);

			const updated = await tx.grade.update({
				where: { id: gradeId },
				data: {
					attendanceScore: attendance,
					assignmentScore: assignment,
					midtermScore: midterm,
					finalExamScore: finalExam,
					finalScore,
					letterGrade,
					gradePoint,
					status: input.status ?? existingGrade.status,
					submittedAt: new Date(),
				},
			});

			// Catat log audit secara terperinci
			await tx.gradeAuditLog.create({
				data: {
					gradeId,
					changedById: userId,
					component: "koreksi",
					previousScore: existingGrade.finalScore,
					newScore: finalScore,
					previousGrade: existingGrade.letterGrade,
					newGrade: letterGrade,
					reason: input.reason,
				},
			});

			// Sinkronkan IPK mahasiswa
			await this.recalculateStudentGPA(tx, existingGrade.enrollment.studentId);

			return {
				message: `Nilai berhasil diperbarui dan audit log tersimpan: ${input.reason}`,
				grade: updated,
			};
		});
	}

	/**
	 * Mengambil riwayat audit log perubahan nilai
	 */
	async getGradeAuditLogs(gradeId: string) {
		const logs = await prisma.gradeAuditLog.findMany({
			where: { gradeId },
			include: {
				changedBy: { select: { name: true, role: true, email: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		return logs.map((log) => ({
			id: log.id,
			changedBy: log.changedBy.name,
			role: log.changedBy.role,
			previousScore: log.previousScore ? Number(log.previousScore) : null,
			newScore: Number(log.newScore),
			previousGrade: log.previousGrade,
			newGrade: log.newGrade,
			reason: log.reason,
			createdAt: log.createdAt.toISOString(),
		}));
	}

	/**
	 * Mahasiswa melihat Kartu Hasil Studi (KHS) per semester
	 */
	async getStudentKHS(studentUserId: string, academicTermId?: string) {
		const student = await prisma.studentProfile.findUnique({
			where: { userId: studentUserId },
			include: { user: true, studyProgram: true },
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

		const term = await prisma.academicTerm.findUnique({
			where: { id: targetTermId },
		});
		if (!term) {
			throw new NotFoundError("Data periode akademik tidak ditemukan.");
		}

		const enrollments = await prisma.enrollment.findMany({
			where: {
				studentId: student.id,
				academicTermId: targetTermId,
				status: "Approved",
			},
			include: {
				class: { include: { course: true } },
				grade: true,
			},
			orderBy: { class: { course: { code: "asc" } } },
		});

		let totalSksSemester = 0;
		let totalBobotSks = 0;

		const items = enrollments.map((en, index) => {
			const sks = en.class.course.sks;
			const isFinal = en.grade?.status === "Final";

			const tugas = isFinal ? Number(en.grade?.assignmentScore ?? 0) : 0;
			const uts = isFinal ? Number(en.grade?.midtermScore ?? 0) : 0;
			const uas = isFinal ? Number(en.grade?.finalExamScore ?? 0) : 0;
			const nilaiAkhir = isFinal ? Number(en.grade?.finalScore ?? 0) : 0;
			const nilaiHuruf = isFinal
				? (en.grade?.letterGrade ?? "-")
				: "Belum Rilis";
			const bobot = isFinal ? Number(en.grade?.gradePoint ?? 0) : 0;

			if (isFinal) {
				totalSksSemester += sks;
				totalBobotSks += sks * bobot;
			}

			return {
				no: index + 1,
				kode: en.class.course.code,
				matkul: en.class.course.name,
				sks,
				nilaiTugas: tugas,
				nilaiUTS: uts,
				nilaiUAS: uas,
				nilaiAkhir,
				nilaiHuruf,
				bobot,
				statusPublikasi: isFinal ? "Final" : "Belum Rilis",
			};
		});

		const ips =
			totalSksSemester > 0
				? Number((totalBobotSks / totalSksSemester).toFixed(2))
				: 0.0;

		return {
			student: {
				nim: student.nim,
				nama: student.user.name,
				prodi: student.studyProgram.name,
				semester: student.currentSemester,
			},
			term: {
				id: term.id,
				name: term.name,
				code: term.code,
			},
			ips,
			totalSks: totalSksSemester,
			predicate: getPredicateByIpk(ips),
			items,
		};
	}

	/**
	 * Mahasiswa melihat Transkrip Akademik Kumulatif Lengkap
	 */
	async getStudentTranscript(studentUserId: string) {
		const student = await prisma.studentProfile.findUnique({
			where: { userId: studentUserId },
			include: { user: true, studyProgram: true },
		});

		if (!student) {
			throw new NotFoundError("Profil mahasiswa tidak ditemukan.");
		}

		// Ambil seluruh enrollment yang nilainya sudah berstatus Final
		const enrollments = await prisma.enrollment.findMany({
			where: {
				studentId: student.id,
				grade: { status: "Final" },
			},
			include: {
				class: {
					include: {
						course: true,
						academicTerm: true,
					},
				},
				grade: true,
			},
			orderBy: [
				{ class: { academicTerm: { code: "asc" } } },
				{ class: { course: { code: "asc" } } },
			],
		});

		// Aturan Pengulangan Mata Kuliah: ambil nilai tertinggi jika matkul pernah diulang
		const courseBestGradeMap = new Map<
			string,
			{
				courseCode: string;
				courseName: string;
				sks: number;
				gradePoint: number;
				letterGrade: string;
				termName: string;
			}
		>();

		for (const en of enrollments) {
			const courseId = en.class.courseId;
			const gradePoint = Number(en.grade?.gradePoint ?? 0);
			const existing = courseBestGradeMap.get(courseId);

			if (!existing || gradePoint > existing.gradePoint) {
				courseBestGradeMap.set(courseId, {
					courseCode: en.class.course.code,
					courseName: en.class.course.name,
					sks: en.class.course.sks,
					gradePoint,
					letterGrade: en.grade?.letterGrade ?? "E",
					termName: en.class.academicTerm.name,
				});
			}
		}

		let totalSksKumulatif = 0;
		let totalBobotKumulatif = 0;
		let totalSksLulus = 0;

		const transcriptItems = Array.from(courseBestGradeMap.values()).map(
			(c, index) => {
				totalSksKumulatif += c.sks;
				totalBobotKumulatif += c.sks * c.gradePoint;
				if (c.letterGrade !== "E") {
					totalSksLulus += c.sks;
				}

				return {
					no: index + 1,
					kode: c.courseCode,
					matkul: c.courseName,
					sks: c.sks,
					nilaiHuruf: c.letterGrade,
					bobot: c.gradePoint,
					semester: c.termName,
				};
			},
		);

		const ipk =
			totalSksKumulatif > 0
				? Number((totalBobotKumulatif / totalSksKumulatif).toFixed(2))
				: 0.0;

		return {
			student: {
				nim: student.nim,
				nama: student.user.name,
				prodi: student.studyProgram.name,
				entryYear: student.entryYear,
				currentSemester: student.currentSemester,
			},
			summary: {
				ipk,
				totalSksKumulatif,
				totalSksLulus,
				predicate: getPredicateByIpk(ipk),
			},
			items: transcriptItems,
		};
	}

	/**
	 * Helper untuk menghitung ulang dan memperbarui IPK profil mahasiswa secara otomatis
	 */
	private async recalculateStudentGPA(
		tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
		studentProfileId: string,
	) {
		const finalEnrollments = await tx.enrollment.findMany({
			where: {
				studentId: studentProfileId,
				grade: { status: "Final" },
			},
			include: {
				class: { include: { course: true } },
				grade: true,
			},
		});

		// Hitung akumulasi
		const bestGrades = new Map<string, { sks: number; gradePoint: number }>();
		for (const en of finalEnrollments) {
			const point = Number(en.grade?.gradePoint ?? 0);
			const exist = bestGrades.get(en.class.courseId);
			if (!exist || point > exist.gradePoint) {
				bestGrades.set(en.class.courseId, {
					sks: en.class.course.sks,
					gradePoint: point,
				});
			}
		}

		let totalSks = 0;
		let totalPoints = 0;
		for (const item of bestGrades.values()) {
			totalSks += item.sks;
			totalPoints += item.sks * item.gradePoint;
		}

		const newGpa =
			totalSks > 0 ? Number((totalPoints / totalSks).toFixed(2)) : 0.0;

		await tx.studentProfile.update({
			where: { id: studentProfileId },
			data: {
				gpa: newGpa,
				totalSks,
			},
		});
	}
}

export const gradesService = new GradesService();
