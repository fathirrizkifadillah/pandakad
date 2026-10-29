import { z } from "zod";

export const updateSettingsSchema = z.object({
	name: z.string().min(3).optional(),
	shortName: z.string().min(2).optional(),
	facultyName: z.string().min(3).optional(),
	email: z.string().email().optional(),
	phone: z.string().min(5).optional(),
	address: z.string().min(5).optional(),
	logoUrl: z.string().optional(),
});

export const academicTermSchema = z.object({
	code: z.string().min(4, "Kode semester minimal 4 karakter (mis. 20261)"),
	name: z.string().min(3, "Nama semester minimal 3 karakter"),
	academicYear: z
		.string()
		.regex(
			/^\d{4}\/\d{4}$/,
			"Format tahun ajaran harus YYYY/YYYY (mis. 2026/2027)",
		),
	semester: z.enum(["Ganjil", "Genap", "Pendek"]),
	startDate: z.string().or(z.date()),
	endDate: z.string().or(z.date()),
	krsStartDate: z.string().or(z.date()),
	krsEndDate: z.string().or(z.date()),
	gradeInputStartDate: z.string().or(z.date()),
	gradeInputEndDate: z.string().or(z.date()),
	isActive: z.boolean().default(false),
	isKrsOpen: z.boolean().default(false),
	isGradeInputOpen: z.boolean().default(false),
});

export const courseSchema = z.object({
	code: z.string().min(3, "Kode mata kuliah minimal 3 karakter"),
	name: z.string().min(3, "Nama mata kuliah minimal 3 karakter"),
	sks: z.coerce.number().int().min(1).max(6),
	semester: z.coerce.number().int().min(1).max(8),
	category: z.enum(["Wajib", "Pilihan"]).default("Wajib"),
	studyProgramId: z.string().uuid("ID Program Studi harus berupa UUID"),
	description: z.string().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type AcademicTermInput = z.infer<typeof academicTermSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
