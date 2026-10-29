import { z } from "zod";

export const attendanceStatusEnum = z.enum(["Hadir", "Izin", "Sakit", "Alpa"], {
	errorMap: () => ({
		message: "Status kehadiran harus salah satu dari: Hadir, Izin, Sakit, Alpa",
	}),
});

export const singleStudentAttendanceSchema = z.object({
	studentId: z.string().uuid("ID Mahasiswa harus berupa UUID yang valid"),
	status: attendanceStatusEnum,
	notes: z.string().max(255).optional(),
});

export const recordSessionAttendanceSchema = z.object({
	classId: z.string().uuid("ID Kelas harus berupa UUID yang valid"),
	sessionNumber: z
		.number()
		.int("Nomor pertemuan harus bilangan bulat")
		.min(1, "Pertemuan minimal 1")
		.max(16, "Pertemuan maksimal 16"),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
		.optional(),
	startTime: z
		.string()
		.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam mulai harus HH:mm")
		.optional(),
	endTime: z
		.string()
		.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam selesai harus HH:mm")
		.optional(),
	topic: z.string().max(255).optional(),
	records: z
		.array(singleStudentAttendanceSchema)
		.min(1, "Minimal 1 data kehadiran mahasiswa harus disertakan"),
});

export const studentAttendanceQuerySchema = z.object({
	academicTermId: z.string().uuid().optional(),
});

export type AttendanceStatus = z.infer<typeof attendanceStatusEnum>;
export type SingleStudentAttendanceInput = z.infer<
	typeof singleStudentAttendanceSchema
>;
export type RecordSessionAttendanceInput = z.infer<
	typeof recordSessionAttendanceSchema
>;
export type StudentAttendanceQueryInput = z.infer<
	typeof studentAttendanceQuerySchema
>;
