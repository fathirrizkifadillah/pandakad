import type { User } from "@prisma/client";
import argon2 from "argon2";
import { prisma } from "../../lib/prisma.js";
import { UnauthorizedError } from "../../middlewares/errorHandler.js";
import type { LoginInput } from "./auth.schema.js";

export type SafeUser = Omit<User, "passwordHash">;

export class AuthService {
	/**
	 * Autentikasi pengguna berdasarkan NIM/NIP, password, dan role yang dipilih.
	 * Menerapkan prinsip keamanan anti user enumeration (generic error).
	 */
	async login(
		input: LoginInput,
	): Promise<{ user: SafeUser; sessionId: string }> {
		const user = await prisma.user.findUnique({
			where: { identifier: input.identifier },
		});

		// 1. Generic error jika user tidak ditemukan atau nonaktif
		if (!user?.isActive) {
			throw new UnauthorizedError(
				"NIM/NIP atau kata sandi tidak valid untuk peran yang dipilih",
			);
		}

		// 2. Pastikan role cocok dengan portal yang dipilih
		if (user.role !== input.role) {
			throw new UnauthorizedError(
				"NIM/NIP atau kata sandi tidak valid untuk peran yang dipilih",
			);
		}

		// 3. Verifikasi hash kata sandi dengan Argon2
		const isPasswordValid = await argon2.verify(
			user.passwordHash,
			input.password,
		);
		if (!isPasswordValid) {
			throw new UnauthorizedError(
				"NIM/NIP atau kata sandi tidak valid untuk peran yang dipilih",
			);
		}

		// 4. Buat sesi baru di database dengan masa berlaku 7 hari
		const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
		const expiresAt = new Date(Date.now() + sessionDurationMs);

		const session = await prisma.session.create({
			data: {
				userId: user.id,
				expiresAt,
			},
		});

		// 5. Exclude passwordHash dari payload balik
		const { passwordHash: _, ...safeUser } = user;

		return {
			user: safeUser,
			sessionId: session.id,
		};
	}

	/**
	 * Mengakhiri sesi (logout) dengan menghapus record session dari database.
	 */
	async logout(sessionId: string): Promise<void> {
		try {
			await prisma.session.delete({
				where: { id: sessionId },
			});
		} catch {
			// Jika session sudah tidak ada, abaikan agar logout tetap idempotent
		}
	}

	/**
	 * Memvalidasi apakah sessionId aktif dan belum kedaluwarsa.
	 */
	async validateSession(sessionId: string): Promise<SafeUser | null> {
		const session = await prisma.session.findUnique({
			where: { id: sessionId },
			include: { user: true },
		});

		if (!session) {
			return null;
		}

		// Periksa waktu kedaluwarsa
		if (new Date() > session.expiresAt) {
			// Bersihkan session yang sudah expired secara asinkron
			await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
			return null;
		}

		if (!session.user.isActive) {
			return null;
		}

		const { passwordHash: _, ...safeUser } = session.user;
		return safeUser;
	}

	/**
	 * Mengambil seluruh daftar akun pengguna untuk Administrator BAAK.
	 */
	async listUsers(role?: string, search?: string) {
		const whereClause: Record<string, unknown> = { isActive: true };
		if (role && role !== "Semua") {
			whereClause.role = role;
		}
		if (search) {
			whereClause.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ identifier: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
			];
		}

		return prisma.user.findMany({
			where: whereClause,
			select: {
				id: true,
				identifier: true,
				name: true,
				email: true,
				role: true,
				isActive: true,
				studentProfile: {
					select: {
						nim: true,
						studyProgram: { select: { name: true } },
					},
				},
				lecturerProfile: {
					select: {
						nidn: true,
						nip: true,
						studyProgram: { select: { name: true } },
					},
				},
			},
			orderBy: [{ role: "asc" }, { name: "asc" }],
		});
	}
}

export const authService = new AuthService();
