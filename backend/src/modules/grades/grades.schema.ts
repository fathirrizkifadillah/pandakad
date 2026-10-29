import { z } from "zod";

export const studentGradeInputSchema = z.object({
	enrollmentId: z.string().uuid("ID Enrollment harus berupa UUID yang valid"),
	attendanceScore: z
		.number({ invalid_type_error: "Nilai kehadiran harus berupa angka" })
		.min(0, "Nilai minimal 0")
		.max(100, "Nilai maksimal 100"),
	assignmentScore: z
		.number({ invalid_type_error: "Nilai tugas harus berupa angka" })
		.min(0, "Nilai minimal 0")
		.max(100, "Nilai maksimal 100"),
	midtermScore: z
		.number({ invalid_type_error: "Nilai UTS harus berupa angka" })
		.min(0, "Nilai minimal 0")
		.max(100, "Nilai maksimal 100"),
	finalExamScore: z
		.number({ invalid_type_error: "Nilai UAS harus berupa angka" })
		.min(0, "Nilai minimal 0")
		.max(100, "Nilai maksimal 100"),
	reason: z.string().max(255).optional(),
});

export const batchInputGradesSchema = z.object({
	classId: z.string().uuid("ID Kelas harus berupa UUID yang valid"),
	grades: z
		.array(studentGradeInputSchema)
		.min(1, "Minimal 1 nilai mahasiswa harus disertakan"),
	status: z.enum(["Draft", "Final"], {
		errorMap: () => ({ message: "Status nilai harus 'Draft' atau 'Final'" }),
	}),
});

export const updateSingleGradeSchema = z.object({
	attendanceScore: z.number().min(0).max(100).optional(),
	assignmentScore: z.number().min(0).max(100).optional(),
	midtermScore: z.number().min(0).max(100).optional(),
	finalExamScore: z.number().min(0).max(100).optional(),
	status: z.enum(["Draft", "Final"]).optional(),
	reason: z
		.string()
		.min(5, "Alasan perubahan nilai wajib diisi (minimal 5 karakter)")
		.max(255),
});

export const khsQuerySchema = z.object({
	academicTermId: z.string().uuid().optional(),
});

export type StudentGradeInput = z.infer<typeof studentGradeInputSchema>;
export type BatchInputGradesInput = z.infer<typeof batchInputGradesSchema>;
export type UpdateSingleGradeInput = z.infer<typeof updateSingleGradeSchema>;
export type KhsQueryInput = z.infer<typeof khsQuerySchema>;
