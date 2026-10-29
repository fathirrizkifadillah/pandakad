import type {
	JadwalKuliahItem,
	KRSItem,
	MataKuliah,
	NilaiSemesterItem,
	PresensiItem,
} from "../../types";
import {
	adaptJadwalKuliah,
	adaptKrsItem,
	adaptMataKuliah,
	adaptNilaiSemesterItem,
	adaptPresensiItem,
} from "./adapters.js";
import { apiClient } from "./apiClient.js";

export const studentApi = {
	/**
	 * Mengambil katalog kelas yang dapat diambil mahasiswa pada semester aktif.
	 */
	async getEligibleClasses(): Promise<MataKuliah[]> {
		const res = await apiClient.get<{ eligibleClasses: any[] }>(
			"/api/v1/krs/eligible-classes",
		);
		return (res.eligibleClasses || []).map(adaptMataKuliah);
	},

	/**
	 * Mengambil daftar kartu rencana studi mahasiswa saat ini.
	 */
	async getMyKrs(): Promise<KRSItem[]> {
		const res = await apiClient.get<{ enrollments: any[] }>(
			"/api/v1/krs/my-study-card",
		);
		return (res.enrollments || []).map(adaptKrsItem);
	},

	/**
	 * Mengambil / mendaftarkan mata kuliah ke rencana studi.
	 */
	async enrollClass(classId: string): Promise<any> {
		return apiClient.post("/api/v1/krs/enroll", { classId });
	},

	/**
	 * Membatalkan mata kuliah dari kartu rencana studi.
	 */
	async dropClass(enrollmentId: string): Promise<any> {
		return apiClient.delete(`/api/v1/krs/drop/${enrollmentId}`);
	},

	/**
	 * Mengajukan KRS ke Dosen Pembimbing Akademik (DPA).
	 */
	async submitKrs(): Promise<any> {
		return apiClient.post("/api/v1/krs/submit");
	},

	/**
	 * Mengambil data ringkasan dashboard mahasiswa berjalan.
	 */
	async getStudentDashboard(day?: string): Promise<any> {
		return apiClient.get("/api/v1/dashboard/student", {
			params: { day },
		});
	},

	/**
	 * Mengambil Kartu Hasil Studi (KHS) mahasiswa semester berjalan.
	 */
	async getMyKhs(): Promise<{
		grades: NilaiSemesterItem[];
		ips: number;
		maxSksNextTerm: number;
	}> {
		const res = await apiClient.get<{
			grades: any[];
			ips: number;
			maxSksNextTerm: number;
		}>("/api/v1/grades/khs");
		return {
			grades: (res.grades || []).map(adaptNilaiSemesterItem),
			ips: res.ips ?? 3.84,
			maxSksNextTerm: res.maxSksNextTerm ?? 24,
		};
	},

	/**
	 * Mengambil transkrip nilai kumulatif mahasiswa.
	 */
	async getMyTranscript(): Promise<{
		grades: NilaiSemesterItem[];
		ipk: number;
		totalSksPassed: number;
	}> {
		const res = await apiClient.get<{
			grades: any[];
			ipk: number;
			totalSksPassed: number;
		}>("/api/v1/grades/transcript");
		return {
			grades: (res.grades || []).map(adaptNilaiSemesterItem),
			ipk: res.ipk ?? 3.84,
			totalSksPassed: res.totalSksPassed ?? 84,
		};
	},

	/**
	 * Mengambil rekapitulasi presensi kuliah mahasiswa.
	 */
	async getMyAttendance(): Promise<PresensiItem[]> {
		const res = await apiClient.get<any[]>("/api/v1/attendance/my-recap");
		return (res || []).map(adaptPresensiItem);
	},

	/**
	 * Mengambil jadwal kuliah hari ini.
	 */
	async getTodaySchedule(day?: string): Promise<JadwalKuliahItem[]> {
		const res = await apiClient.get<any>("/api/v1/dashboard/student", {
			params: { day },
		});
		const sessions = res.todaySchedule?.sessions || [];
		return sessions.map(adaptJadwalKuliah);
	},
};
