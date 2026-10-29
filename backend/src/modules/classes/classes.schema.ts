import { z } from "zod";

export const scheduleItemSchema = z.object({
	roomId: z.string().uuid("ID Ruangan harus berupa UUID"),
	dayOfWeek: z.enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], {
		errorMap: () => ({
			message:
				"Hari perkuliahan harus salah satu dari: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu",
		}),
	}),
	startTime: z
		.string()
		.regex(
			/^([01]\d|2[0-3]):([0-5]\d)$/,
			"Format waktu mulai harus HH:mm (contoh: 08:00)",
		),
	endTime: z
		.string()
		.regex(
			/^([01]\d|2[0-3]):([0-5]\d)$/,
			"Format waktu selesai harus HH:mm (contoh: 10:30)",
		),
});

export const createClassSchema = z.object({
	code: z
		.string()
		.min(3, "Kode kelas minimal 3 karakter (contoh: IF3101-A)")
		.max(20),
	courseId: z.string().uuid("ID Mata Kuliah harus berupa UUID"),
	academicTermId: z.string().uuid("ID Periode Akademik harus berupa UUID"),
	lecturerId: z.string().uuid("ID Dosen Pengampu harus berupa UUID"),
	quota: z.coerce.number().int().min(1).max(100).default(40),
	schedules: z
		.array(scheduleItemSchema)
		.min(1, "Minimal harus ada 1 jadwal perkuliahan"),
});

export const addScheduleSchema = scheduleItemSchema;

export type ScheduleItemInput = z.infer<typeof scheduleItemSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
