import { z } from "zod";

export const dashboardQuerySchema = z.object({
	termId: z.string().uuid("ID Periode Akademik harus berupa UUID").optional(),
	day: z
		.enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"], {
			invalid_type_error: "Nama hari tidak valid",
		})
		.optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
