import type { Role, User } from "../../types";
import { adaptUser } from "./adapters.js";
import { apiClient } from "./apiClient.js";

export const authApi = {
	/**
	 * Melakukan login riil ke backend sistem akademik.
	 */
	async login(identifier: string, password: string, role: Role): Promise<User> {
		const res = await apiClient.post<{ user: any; sessionId: string }>(
			"/api/v1/auth/login",
			{
				identifier,
				password,
				role,
			},
		);

		return adaptUser(res.user);
	},

	/**
	 * Mengambil data sesi pengguna yang sedang aktif (cek signed cookie).
	 */
	async getMe(): Promise<User | null> {
		try {
			const user = await apiClient.get<any>("/api/v1/auth/me");
			return adaptUser(user);
		} catch {
			return null;
		}
	},

	/**
	 * Mengakhiri sesi pengguna di database dan membersihkan cookie sesi.
	 */
	async logout(): Promise<void> {
		try {
			await apiClient.post("/api/v1/auth/logout");
		} catch {
			// Tetap lanjutkan logout lokal meskipun server offline
		}
	},
};
