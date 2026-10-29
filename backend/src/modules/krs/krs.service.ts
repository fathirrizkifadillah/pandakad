import { prisma } from "../../lib/prisma.js";
import {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
} from "../../middlewares/errorHandler.js";
import type {
	ApproveKrsInput,
	DropClassInput,
	EnrollClassInput,
} from "./krs.schema.js";

function parseTimeToMinutes(timeStr: string): number {
	const parts = timeStr.split(":").map((v) => Number.parseInt(v, 10));
	const hours = parts[0] ?? 0;
	const minutes = parts[1] ?? 0;
	return hours * 60 + minutes;
}

export function calculateMaxSks(gpa: number): number {
	if (gpa >= 3.0) return 24;
	if (gpa >= 2.5) return 21;
	if (gpa >= 2.0) return 18;
	return 15;
}

export function mapStatusToFrontend(
	status: string,
): "Disetujui" | "Menunggu Persetujuan" | "Draft" | "Ditolak" {
	switch (status) {
		case "Approved":
			return "Disetujui";
		case "Submitted":
			return "Menunggu Persetujuan";
		case "Draft":
			return "Draft";
		default:
			return "Ditolak";
	}
}

export class KrsService {
	/**
	 * Mendapatkan data KRS Mahasiswa untuk semester aktif/tertentu
	 */
	async getStudentKRS(studentUserId: string, academicTermId?: string) {
		const student = await prisma.studentProfile.findUnique({
			where: { userId: studentUserId },
			include: {
				user: { select: { name: true, email: true, identifier: true } },
				studyProgram: { select: { code: true, name: true } },
				academicAdvisor: {
					include: { user: { select: { name: true, email: true } } },
				},
			},
		});

		if (!student) {
			throw new NotFoundError(
				"Profil mahasiswa tidak ditemukan untuk akun ini.",
			);
		}

		// Cari term
		let targetTermId = academicTermId;
		if (!targetTermId) {
			const activeTerm = await prisma.academicTerm.findFirst({
				where: { isActive: true },
			});
			if (!activeTerm) {
				throw new NotFoundError(
					"Tidak ada tahun akademik yang sedang aktif saat ini.",
				);
			}
			targetTermId = activeTerm.id;
		}

		const term = await prisma.academicTerm.findUnique({
			where: { id: targetTermId },
		});
		if (!term) {
			throw new NotFoundError("Periode akademik tidak ditemukan.");
		}

		const enrollments = await prisma.enrollment.findMany({
			where: {
				studentId: student.id,
				academicTermId: targetTermId,
			},
			include: {
				class: {
					include: {
						course: true,
						schedules: {
							include: { room: true },
						},
						lecturer: {
							include: { user: { select: { name: true } } },
						},
					},
				},
			},
			orderBy: { createdAt: "asc" },
		});

		const totalSks = enrollments.reduce(
			(sum, item) => sum + item.class.course.sks,
			0,
		);
		const maxSks = calculateMaxSks(Number(student.gpa));

		const items = enrollments.map((en) => {
			const primarySchedule = en.class.schedules[0];
			const roomName = primarySchedule?.room?.name || "Ruang TBD";
			const scheduleDay = primarySchedule?.dayOfWeek || "-";
			const scheduleTime = primarySchedule
				? `${primarySchedule.startTime} - ${primarySchedule.endTime}`
				: "-";

			return {
				id: en.id,
				classId: en.classId,
				kode: en.class.course.code,
				nama: en.class.course.name,
				kelas: en.class.code.split("-")[1] || "A",
				sks: en.class.course.sks,
				semester: en.class.course.semester,
				dosen: en.class.lecturer.user.name,
				ruang: roomName,
				hari: scheduleDay,
				jam: scheduleTime,
				kuota: en.class.quota,
				terisi: en.class.enrolledCount,
				kategori: en.class.course.category,
				status: mapStatusToFrontend(en.status),
				rawStatus: en.status,
				tanggalDipilih: en.createdAt.toISOString(),
			};
		});

		// Cek overall KRS status
		let krsStatus: "Draft" | "Menunggu Persetujuan" | "Disetujui" | "Kosong" =
			"Kosong";
		if (enrollments.length > 0) {
			if (enrollments.every((e) => e.status === "Approved")) {
				krsStatus = "Disetujui";
			} else if (
				enrollments.some(
					(e) => e.status === "Submitted" || e.status === "Approved",
				)
			) {
				krsStatus = "Menunggu Persetujuan";
			} else {
				krsStatus = "Draft";
			}
		}

		return {
			student: {
				id: student.id,
				nim: student.nim,
				name: student.user.name,
				prodi: student.studyProgram.name,
				semester: student.currentSemester,
				gpa: Number(student.gpa),
				maxSks,
				totalSks,
				dpa: student.academicAdvisor?.user.name || "Belum Ditentukan",
			},
			academicTerm: {
				id: term.id,
				code: term.code,
				name: term.name,
				isKrsOpen: term.isKrsOpen,
				krsStartDate: term.krsStartDate,
				krsEndDate: term.krsEndDate,
			},
			krsStatus,
			items,
		};
	}

	/**
	 * Mahasiswa mengambil kelas (Enroll) dengan transaksi atomik & proteksi balapan
	 */
	async enrollClass(studentUserId: string, input: EnrollClassInput) {
		return prisma.$transaction(async (tx) => {
			const student = await tx.studentProfile.findUnique({
				where: { userId: studentUserId },
			});
			if (!student) {
				throw new NotFoundError("Profil mahasiswa tidak ditemukan.");
			}

			// 1. Dapatkan kelas target beserta matkul, jadwal, dan periode akademiknya
			const targetClass = await tx.class.findUnique({
				where: { id: input.classId },
				include: {
					course: true,
					academicTerm: true,
					schedules: true,
				},
			});

			if (!targetClass) {
				throw new NotFoundError("Kelas yang dipilih tidak ditemukan.");
			}

			if (targetClass.status !== "Open") {
				throw new BadRequestError(
					`Kelas ${targetClass.code} saat ini berstatus ${targetClass.status} dan tidak menerima pendaftaran.`,
				);
			}

			// 2. Validasi Jendela Waktu KRS
			const term = targetClass.academicTerm;
			const now = new Date();
			if (!term.isKrsOpen || now < term.krsStartDate || now > term.krsEndDate) {
				throw new BadRequestError(
					"Periode pengisian KRS untuk semester ini sedang ditutup.",
				);
			}

			// 3. Cek apakah sudah pernah mengambil kelas ini
			const existingEnrollment = await tx.enrollment.findUnique({
				where: {
					studentId_classId: {
						studentId: student.id,
						classId: targetClass.id,
					},
				},
			});

			if (existingEnrollment) {
				throw new ConflictError(
					`Mata kuliah "${targetClass.course.name}" sudah ada di KRS kamu.`,
				);
			}

			// 4. Ambil seluruh enrollment aktif mahasiswa di semester ini
			const currentEnrollments = await tx.enrollment.findMany({
				where: {
					studentId: student.id,
					academicTermId: term.id,
				},
				include: {
					class: {
						include: {
							course: true,
							schedules: true,
						},
					},
				},
			});

			// Cek apakah ada enrollment yang sudah Approved/Submitted dan dikunci
			const isLocked = currentEnrollments.some(
				(e) => e.status === "Approved" || e.status === "Submitted",
			);
			if (isLocked) {
				throw new BadRequestError(
					"KRS Anda sudah diajukan atau disetujui DPA. Hubungi DPA untuk membuka kunci perubahan.",
				);
			}

			// Cek apakah mahasiswa sudah mengambil kelas lain dari MATA KULIAH YANG SAMA di semester ini
			const sameCourseClass = currentEnrollments.find(
				(e) => e.class.courseId === targetClass.courseId,
			);
			if (sameCourseClass) {
				throw new ConflictError(
					`Anda sudah terdaftar di kelas ${sameCourseClass.class.code} untuk mata kuliah ${targetClass.course.name}.`,
				);
			}

			// 5. Validasi Maksimum SKS berdasarkan IPK/IPS
			const maxSks = calculateMaxSks(Number(student.gpa));
			const currentTotalSks = currentEnrollments.reduce(
				(sum, e) => sum + e.class.course.sks,
				0,
			);
			const newTotalSks = currentTotalSks + targetClass.course.sks;

			if (newTotalSks > maxSks) {
				throw new BadRequestError(
					`Batas maksimal SKS yang dapat diambil adalah ${maxSks} SKS. Total SKS yang dipilih (${newTotalSks} SKS) melebihi batas.`,
				);
			}

			// 6. Validasi Bentrok Jadwal (Schedule Collision) dengan kelas lain yang sudah diambil
			for (const newSched of targetClass.schedules) {
				const newStart = parseTimeToMinutes(newSched.startTime);
				const newEnd = parseTimeToMinutes(newSched.endTime);

				for (const existing of currentEnrollments) {
					for (const existSched of existing.class.schedules) {
						if (existSched.dayOfWeek === newSched.dayOfWeek) {
							const existStart = parseTimeToMinutes(existSched.startTime);
							const existEnd = parseTimeToMinutes(existSched.endTime);

							// Rumus interval collision: startA < endB && endA > startB
							if (newStart < existEnd && newEnd > existStart) {
								throw new ConflictError(
									`Jadwal bentrok pada hari ${newSched.dayOfWeek} (${newSched.startTime}-${newSched.endTime}) dengan kelas ${existing.class.code} (${existSched.startTime}-${existSched.endTime}).`,
								);
							}
						}
					}
				}
			}

			// 7. Validasi Kuota Kelas (Concurrency Safe: cek quota saat transaksi)
			if (targetClass.enrolledCount >= targetClass.quota) {
				throw new ConflictError(
					`Kuota kelas ${targetClass.code} telah penuh (${targetClass.enrolledCount}/${targetClass.quota}). Silakan pilih kelas lain.`,
				);
			}

			// 8. Tambahkan Enrollment & Naikkan enrolledCount kelas secara atomik
			await tx.class.update({
				where: { id: targetClass.id },
				data: { enrolledCount: { increment: 1 } },
			});

			const newEnrollment = await tx.enrollment.create({
				data: {
					studentId: student.id,
					classId: targetClass.id,
					academicTermId: term.id,
					status: "Draft",
				},
				include: {
					class: {
						include: {
							course: true,
							schedules: { include: { room: true } },
						},
					},
				},
			});

			return {
				message: `Mata kuliah "${targetClass.course.name}" (+${targetClass.course.sks} SKS) berhasil ditambahkan ke KRS.`,
				enrollment: newEnrollment,
			};
		});
	}

	/**
	 * Mahasiswa membatalkan kelas (Drop) dengan transaksi atomik & pengembalian kuota
	 */
	async dropClass(studentUserId: string, input: DropClassInput) {
		return prisma.$transaction(async (tx) => {
			const student = await tx.studentProfile.findUnique({
				where: { userId: studentUserId },
			});
			if (!student) {
				throw new NotFoundError("Profil mahasiswa tidak ditemukan.");
			}

			const targetClass = await tx.class.findUnique({
				where: { id: input.classId },
				include: { course: true, academicTerm: true },
			});

			if (!targetClass) {
				throw new NotFoundError("Kelas tidak ditemukan.");
			}

			// Cek jendela KRS
			const term = targetClass.academicTerm;
			const now = new Date();
			if (!term.isKrsOpen || now < term.krsStartDate || now > term.krsEndDate) {
				throw new BadRequestError(
					"Periode pengisian KRS sedang ditutup, tidak dapat mengubah kelas.",
				);
			}

			// Cek apakah mahasiswa terdaftar di kelas ini
			const enrollment = await tx.enrollment.findUnique({
				where: {
					studentId_classId: {
						studentId: student.id,
						classId: targetClass.id,
					},
				},
			});

			if (!enrollment) {
				throw new NotFoundError(
					"Anda tidak terdaftar di kelas ini dalam KRS Anda.",
				);
			}

			if (enrollment.status === "Approved") {
				throw new BadRequestError(
					"KRS yang sudah disetujui DPA tidak dapat dibatalkan secara mandiri.",
				);
			}

			// Hapus enrollment dan kurangi enrolledCount secara atomik
			await tx.enrollment.delete({
				where: { id: enrollment.id },
			});

			if (targetClass.enrolledCount > 0) {
				await tx.class.update({
					where: { id: targetClass.id },
					data: { enrolledCount: { decrement: 1 } },
				});
			}

			return {
				message: `Mata kuliah "${targetClass.course.name}" telah dihapus dari KRS.`,
			};
		});
	}

	/**
	 * Mahasiswa mengajukan KRS ke DPA (Submit)
	 */
	async submitKRS(studentUserId: string, notes?: string) {
		return prisma.$transaction(async (tx) => {
			const student = await tx.studentProfile.findUnique({
				where: { userId: studentUserId },
			});
			if (!student) {
				throw new NotFoundError("Profil mahasiswa tidak ditemukan.");
			}

			const activeTerm = await tx.academicTerm.findFirst({
				where: { isActive: true },
			});
			if (!activeTerm) {
				throw new BadRequestError(
					"Tidak ada tahun akademik yang sedang aktif.",
				);
			}

			const draftEnrollments = await tx.enrollment.findMany({
				where: {
					studentId: student.id,
					academicTermId: activeTerm.id,
					status: "Draft",
				},
			});

			if (draftEnrollments.length === 0) {
				throw new BadRequestError(
					"Pilih minimal 1 mata kuliah dalam status draf sebelum mengajukan KRS!",
				);
			}

			await tx.enrollment.updateMany({
				where: {
					studentId: student.id,
					academicTermId: activeTerm.id,
					status: "Draft",
				},
				data: {
					status: "Submitted",
					notes: notes || "Diajukan oleh mahasiswa untuk persetujuan DPA.",
				},
			});

			return {
				message: "KRS berhasil diajukan ke Dosen Pembimbing Akademik (DPA).",
			};
		});
	}

	/**
	 * DPA atau Admin menyetujui / menolak pengajuan KRS mahasiswa
	 */
	async reviewKRS(
		reviewerUserId: string,
		reviewerRole: string,
		input: ApproveKrsInput,
	) {
		return prisma.$transaction(async (tx) => {
			const student = await tx.studentProfile.findUnique({
				where: { id: input.studentId },
				include: {
					user: { select: { name: true } },
					academicAdvisor: true,
				},
			});

			if (!student) {
				throw new NotFoundError("Mahasiswa tidak ditemukan.");
			}

			let approverProfileId: string | undefined;

			// Jika role Dosen, harus DPA mahasiswa yang bersangkutan
			if (reviewerRole === "Dosen") {
				const lecturer = await tx.lecturerProfile.findUnique({
					where: { userId: reviewerUserId },
				});

				if (!lecturer) {
					throw new NotFoundError("Profil dosen penilai tidak ditemukan.");
				}

				if (student.academicAdvisorId !== lecturer.id) {
					throw new ForbiddenError(
						"Hanya Dosen Pembimbing Akademik (DPA) mahasiswa ini yang berhak menyetujui KRS.",
					);
				}

				approverProfileId = lecturer.id;
			}

			const activeTerm = await tx.academicTerm.findFirst({
				where: { isActive: true },
			});
			if (!activeTerm) {
				throw new BadRequestError(
					"Tidak ada tahun akademik aktif untuk persetujuan KRS.",
				);
			}

			const pendingEnrollments = await tx.enrollment.findMany({
				where: {
					studentId: student.id,
					academicTermId: activeTerm.id,
				},
			});

			if (pendingEnrollments.length === 0) {
				throw new BadRequestError(
					"Mahasiswa ini belum memiliki mata kuliah yang diajukan di semester aktif.",
				);
			}

			await tx.enrollment.updateMany({
				where: {
					studentId: student.id,
					academicTermId: activeTerm.id,
				},
				data: {
					status: input.status,
					approvedById: approverProfileId,
					approvedAt: new Date(),
					notes: input.notes,
				},
			});

			return {
				message: `KRS mahasiswa ${student.user.name} berhasil ${input.status === "Approved" ? "disetujui" : "ditolak"}.`,
				status: input.status,
			};
		});
	}

	/**
	 * Dosen melihat daftar mahasiswa bimbingan akademik beserta status KRS mereka
	 */
	async getAdvisedStudentsKRS(lecturerUserId: string) {
		const lecturer = await prisma.lecturerProfile.findUnique({
			where: { userId: lecturerUserId },
		});
		if (!lecturer) {
			throw new NotFoundError("Profil dosen tidak ditemukan.");
		}

		const activeTerm = await prisma.academicTerm.findFirst({
			where: { isActive: true },
		});

		const students = await prisma.studentProfile.findMany({
			where: { academicAdvisorId: lecturer.id },
			include: {
				user: { select: { name: true, email: true } },
				studyProgram: { select: { name: true, code: true } },
				enrollments: {
					where: activeTerm ? { academicTermId: activeTerm.id } : undefined,
					include: { class: { include: { course: true } } },
				},
			},
		});

		return students.map((s) => {
			const totalSks = s.enrollments.reduce(
				(sum, e) => sum + e.class.course.sks,
				0,
			);
			let krsStatus = "Kosong";
			if (s.enrollments.length > 0) {
				if (s.enrollments.every((e) => e.status === "Approved")) {
					krsStatus = "Disetujui";
				} else if (s.enrollments.some((e) => e.status === "Submitted")) {
					krsStatus = "Menunggu Persetujuan";
				} else {
					krsStatus = "Draft";
				}
			}

			return {
				studentId: s.id,
				nim: s.nim,
				name: s.user.name,
				prodi: s.studyProgram.name,
				semester: s.currentSemester,
				gpa: Number(s.gpa),
				maxSks: calculateMaxSks(Number(s.gpa)),
				totalSks,
				krsStatus,
				coursesCount: s.enrollments.length,
			};
		});
	}
}

export const krsService = new KrsService();
