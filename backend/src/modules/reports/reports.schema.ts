import { z } from "zod";

export const classReportParamSchema = z.object({
	classId: z.string().uuid("ID Kelas harus berupa UUID yang valid"),
});

export const academicSummaryQuerySchema = z.object({
	termId: z.string().uuid("ID Periode Akademik harus berupa UUID").optional(),
});

export type ClassReportParam = z.infer<typeof classReportParamSchema>;
export type AcademicSummaryQuery = z.infer<typeof academicSummaryQuerySchema>;
