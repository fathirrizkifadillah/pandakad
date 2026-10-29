import { Role } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
	identifier: z
		.string()
		.min(3, "NIM/NIP/ID minimal 3 karakter")
		.max(50, "NIM/NIP/ID maksimal 50 karakter")
		.trim(),
	password: z
		.string()
		.min(6, "Kata sandi minimal 6 karakter")
		.max(100, "Kata sandi maksimal 100 karakter"),
	role: z.nativeEnum(Role, {
		errorMap: () => ({
			message: "Role harus salah satu dari: Mahasiswa, Dosen, atau Admin",
		}),
	}),
});

export type LoginInput = z.infer<typeof loginSchema>;
