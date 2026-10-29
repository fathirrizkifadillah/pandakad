import { z } from "zod";

export const enrollClassSchema = z.object({
	classId: z.string().uuid("ID Kelas harus berupa UUID yang valid"),
});

export const dropClassSchema = z.object({
	classId: z.string().uuid("ID Kelas harus berupa UUID yang valid"),
});

export const submitKrsSchema = z.object({
	notes: z.string().max(255).optional(),
});

export const approveKrsSchema = z.object({
	studentId: z.string().uuid("ID Mahasiswa harus berupa UUID yang valid"),
	status: z.enum(["Approved", "Rejected"], {
		errorMap: () => ({ message: "Status harus 'Approved' atau 'Rejected'" }),
	}),
	notes: z.string().max(500).optional(),
});

export const krsQuerySchema = z.object({
	academicTermId: z.string().uuid().optional(),
});

export type EnrollClassInput = z.infer<typeof enrollClassSchema>;
export type DropClassInput = z.infer<typeof dropClassSchema>;
export type SubmitKrsInput = z.infer<typeof submitKrsSchema>;
export type ApproveKrsInput = z.infer<typeof approveKrsSchema>;
export type KrsQueryInput = z.infer<typeof krsQuerySchema>;
