import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../middlewares/errorHandler.js";
import type {
	AcademicTermInput,
	CourseInput,
	UpdateSettingsInput,
} from "./master.schema.js";

export class MasterService {
	// ==========================================
	// 1. Pengaturan Institusi (UNPANDA & FTI)
	// ==========================================
	async getSettings() {
		const settings = await prisma.institutionSettings.findUnique({
			where: { id: "default" },
		});
		if (!settings) {
			throw new NotFoundError("Pengaturan institusi belum diinisialisasi.");
		}
		return settings;
	}

	async updateSettings(data: UpdateSettingsInput) {
		return prisma.institutionSettings.update({
			where: { id: "default" },
			data,
		});
	}

	// ==========================================
	// 2. Periode / Tahun Akademik
	// ==========================================
	async getTerms() {
		return prisma.academicTerm.findMany({
			orderBy: { code: "desc" },
		});
	}

	async getActiveTerm() {
		const term = await prisma.academicTerm.findFirst({
			where: { isActive: true },
		});
		if (!term) {
			throw new NotFoundError(
				"Tidak ada periode akademik yang aktif saat ini.",
			);
		}
		return term;
	}

	async createTerm(input: AcademicTermInput) {
		return prisma.academicTerm.create({
			data: {
				code: input.code,
				name: input.name,
				academicYear: input.academicYear,
				semester: input.semester,
				startDate: new Date(input.startDate),
				endDate: new Date(input.endDate),
				krsStartDate: new Date(input.krsStartDate),
				krsEndDate: new Date(input.krsEndDate),
				gradeInputStartDate: new Date(input.gradeInputStartDate),
				gradeInputEndDate: new Date(input.gradeInputEndDate),
				isActive: input.isActive,
				isKrsOpen: input.isKrsOpen,
				isGradeInputOpen: input.isGradeInputOpen,
			},
		});
	}

	async activateTerm(termId: string) {
		const targetTerm = await prisma.academicTerm.findUnique({
			where: { id: termId },
		});
		if (!targetTerm) {
			throw new NotFoundError("Periode akademik tidak ditemukan.");
		}

		// Transaksi atomik: Nonaktifkan semua periode lain, lalu aktifkan yang dipilih
		return prisma.$transaction(async (tx) => {
			await tx.academicTerm.updateMany({
				data: { isActive: false },
			});

			const activated = await tx.academicTerm.update({
				where: { id: termId },
				data: { isActive: true },
			});

			await tx.institutionSettings.update({
				where: { id: "default" },
				data: { activeTermId: termId },
			});

			return activated;
		});
	}

	// ==========================================
	// 3. Program Studi & Gedung / Ruangan
	// ==========================================
	async getStudyPrograms() {
		return prisma.studyProgram.findMany({
			where: { isActive: true },
			include: {
				_count: {
					select: { courses: true, students: true },
				},
			},
			orderBy: { code: "asc" },
		});
	}

	async getBuildings() {
		return prisma.building.findMany({
			where: { isActive: true },
			include: {
				rooms: {
					where: { isActive: true },
					orderBy: { code: "asc" },
				},
			},
			orderBy: { code: "asc" },
		});
	}

	async getRooms(buildingId?: string) {
		return prisma.room.findMany({
			where: {
				isActive: true,
				...(buildingId ? { buildingId } : {}),
			},
			include: {
				building: {
					select: { id: true, code: true, name: true },
				},
			},
			orderBy: { code: "asc" },
		});
	}

	// ==========================================
	// 4. Katalog Kurikulum & Mata Kuliah
	// ==========================================
	async getCourses(filters: {
		studyProgramId?: string;
		semester?: number;
		search?: string;
	}) {
		const whereClause: Record<string, unknown> = { isActive: true };

		if (filters.studyProgramId) {
			whereClause.studyProgramId = filters.studyProgramId;
		}

		if (filters.semester) {
			whereClause.semester = Number(filters.semester);
		}

		if (filters.search) {
			whereClause.OR = [
				{ name: { contains: filters.search, mode: "insensitive" } },
				{ code: { contains: filters.search, mode: "insensitive" } },
			];
		}

		return prisma.course.findMany({
			where: whereClause,
			include: {
				studyProgram: {
					select: { id: true, code: true, name: true, degree: true },
				},
			},
			orderBy: [{ semester: "asc" }, { code: "asc" }],
		});
	}

	async createCourse(input: CourseInput) {
		return prisma.course.create({
			data: input,
		});
	}
}

export const masterService = new MasterService();
