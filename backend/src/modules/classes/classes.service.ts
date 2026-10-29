import { prisma } from "../../lib/prisma.js";
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
} from "../../middlewares/errorHandler.js";
import type { CreateClassInput, ScheduleItemInput } from "./classes.schema.js";

/**
 * Konversi string "HH:mm" menjadi menit dari tengah malam (0 - 1439).
 */
export function timeToMinutes(time: string): number {
	const [h, m] = time.split(":").map(Number);
	return h * 60 + m;
}

/**
 * Memeriksa apakah dua rentang waktu saling tumpang tindih (overlapping).
 * Formula interval: StartA < EndB && EndA > StartB
 */
export function isTimeOverlapping(
	startA: string,
	endA: string,
	startB: string,
	endB: string,
): boolean {
	const sA = timeToMinutes(startA);
	const eA = timeToMinutes(endA);
	const sB = timeToMinutes(startB);
	const eB = timeToMinutes(endB);

	return sA < eB && eA > sB;
}

export class ClassesService {
	/**
	 * Algoritma Cek Bentrok Terpusat:
	 * Memeriksa bentrok ruangan dan bentrok jadwal mengajar dosen
	 * pada periode akademik yang sama.
	 */
	async checkScheduleConflicts(params: {
		academicTermId: string;
		lecturerId: string;
		schedules: ScheduleItemInput[];
		excludeClassId?: string;
	}): Promise<void> {
		const { academicTermId, lecturerId, schedules, excludeClassId } = params;

		for (const s of schedules) {
			// 1. Validasi urutan waktu
			if (timeToMinutes(s.startTime) >= timeToMinutes(s.endTime)) {
				throw new BadRequestError(
					`Waktu mulai perkuliahan (${s.startTime}) harus lebih awal daripada waktu selesai (${s.endTime}).`,
				);
			}

			// 2. Cek Bentrok Ruangan
			const roomSchedules = await prisma.schedule.findMany({
				where: {
					roomId: s.roomId,
					dayOfWeek: s.dayOfWeek,
					class: {
						academicTermId,
						...(excludeClassId ? { id: { not: excludeClassId } } : {}),
					},
				},
				include: {
					class: {
						include: { course: true },
					},
					room: true,
				},
			});

			for (const existing of roomSchedules) {
				if (
					isTimeOverlapping(
						s.startTime,
						s.endTime,
						existing.startTime,
						existing.endTime,
					)
				) {
					throw new ConflictError(
						`Jadwal bentrok: Ruangan ${existing.room.name} (${existing.room.code}) sudah digunakan oleh kelas ${existing.class.code} (${existing.class.course.name}) pada hari ${s.dayOfWeek} pukul ${existing.startTime} - ${existing.endTime}.`,
					);
				}
			}

			// 3. Cek Bentrok Jadwal Dosen
			const lecturerSchedules = await prisma.schedule.findMany({
				where: {
					dayOfWeek: s.dayOfWeek,
					class: {
						academicTermId,
						lecturerId,
						...(excludeClassId ? { id: { not: excludeClassId } } : {}),
					},
				},
				include: {
					class: {
						include: {
							course: true,
							lecturer: { include: { user: true } },
						},
					},
				},
			});

			for (const existing of lecturerSchedules) {
				if (
					isTimeOverlapping(
						s.startTime,
						s.endTime,
						existing.startTime,
						existing.endTime,
					)
				) {
					const lecturerName = existing.class.lecturer.user.name;
					throw new ConflictError(
						`Jadwal bentrok: Dosen ${lecturerName} sudah memiliki jadwal mengajar di kelas ${existing.class.code} (${existing.class.course.name}) pada hari ${s.dayOfWeek} pukul ${existing.startTime} - ${existing.endTime}.`,
					);
				}
			}
		}
	}

	/**
	 * Mendaftarkan kelas perkuliahan baru beserta jadwalnya dalam satu transaksi atomik.
	 */
	async createClass(input: CreateClassInput) {
		// 1. Verifikasi bentrok jadwal terlebih dahulu
		await this.checkScheduleConflicts({
			academicTermId: input.academicTermId,
			lecturerId: input.lecturerId,
			schedules: input.schedules,
		});

		// 2. Eksekusi pembuatan kelas dan jadwal secara atomik
		return prisma.class.create({
			data: {
				code: input.code,
				courseId: input.courseId,
				academicTermId: input.academicTermId,
				lecturerId: input.lecturerId,
				quota: input.quota,
				status: "Open",
				schedules: {
					create: input.schedules.map((s) => ({
						roomId: s.roomId,
						dayOfWeek: s.dayOfWeek,
						startTime: s.startTime,
						endTime: s.endTime,
					})),
				},
			},
			include: {
				course: true,
				lecturer: { include: { user: true } },
				schedules: {
					include: {
						room: {
							include: { building: true },
						},
					},
				},
			},
		});
	}

	/**
	 * Mengambil daftar kelas perkuliahan dengan filter fleksibel.
	 */
	async getClasses(filters: {
		termId?: string;
		studyProgramId?: string;
		courseId?: string;
		lecturerId?: string;
		search?: string;
	}) {
		let termId = filters.termId;

		// Jika termId tidak disertakan, default ke periode aktif
		if (!termId) {
			const activeTerm = await prisma.academicTerm.findFirst({
				where: { isActive: true },
			});
			termId = activeTerm?.id;
		}

		const whereClause: Record<string, unknown> = {};
		if (termId) whereClause.academicTermId = termId;
		if (filters.courseId) whereClause.courseId = filters.courseId;
		if (filters.lecturerId) whereClause.lecturerId = filters.lecturerId;
		if (filters.studyProgramId) {
			whereClause.course = { studyProgramId: filters.studyProgramId };
		}

		if (filters.search) {
			whereClause.OR = [
				{ code: { contains: filters.search, mode: "insensitive" } },
				{
					course: {
						name: { contains: filters.search, mode: "insensitive" },
					},
				},
			];
		}

		return prisma.class.findMany({
			where: whereClause,
			include: {
				course: {
					include: { studyProgram: true },
				},
				lecturer: {
					include: { user: true },
				},
				academicTerm: true,
				schedules: {
					include: {
						room: { include: { building: true } },
					},
				},
			},
			orderBy: [{ course: { semester: "asc" } }, { code: "asc" }],
		});
	}

	/**
	 * Mengambil detail satu kelas perkuliahan.
	 */
	async getClassById(id: string) {
		const cls = await prisma.class.findUnique({
			where: { id },
			include: {
				course: {
					include: { studyProgram: true },
				},
				lecturer: {
					include: { user: true },
				},
				academicTerm: true,
				schedules: {
					include: {
						room: { include: { building: true } },
					},
				},
			},
		});

		if (!cls) {
			throw new NotFoundError("Kelas perkuliahan tidak ditemukan.");
		}

		return cls;
	}

	/**
	 * Mengambil kelas yang diampu oleh Dosen yang sedang login.
	 */
	async getLecturerClasses(userId: string, termId?: string) {
		const lecturer = await prisma.lecturerProfile.findUnique({
			where: { userId },
		});
		if (!lecturer) {
			throw new NotFoundError("Profil dosen tidak ditemukan.");
		}

		return this.getClasses({
			lecturerId: lecturer.id,
			termId,
		});
	}

	/**
	 * Menghapus kelas (hanya jika belum ada mahasiswa yang mendaftar / enrolledCount === 0).
	 */
	async deleteClass(id: string) {
		const cls = await prisma.class.findUnique({
			where: { id },
		});

		if (!cls) {
			throw new NotFoundError("Kelas tidak ditemukan.");
		}

		if (cls.enrolledCount > 0) {
			throw new ConflictError(
				`Kelas tidak dapat dihapus karena sudah ada ${cls.enrolledCount} mahasiswa yang terdaftar.`,
			);
		}

		return prisma.class.delete({
			where: { id },
		});
	}
}

export const classesService = new ClassesService();
