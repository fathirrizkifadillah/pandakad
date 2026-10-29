import type {
	JadwalKuliahItem,
	PeriodeAkademik,
	UserManagementItem,
} from "../../types";
import {
	adaptJadwalKuliah,
	adaptPeriodeAkademik,
	adaptUserManagement,
} from "./adapters.js";
import { apiClient } from "./apiClient.js";

export const adminApi = {
	/**
	 * Mengambil data ringkasan dashboard administrator BAAK.
	 */
	async getAdminDashboard(termId?: string): Promise<any> {
		return apiClient.get("/api/v1/dashboard/admin", {
			params: { termId },
		});
	},

	/**
	 * Mengambil seluruh periode akademik.
	 */
	async getAcademicTerms(): Promise<PeriodeAkademik[]> {
		const res = await apiClient.get<any[]>("/api/v1/master/terms");
		return (res || []).map(adaptPeriodeAkademik);
	},

	/**
	 * Mengaktifkan periode akademik tertentu.
	 */
	async activateTerm(termId: string): Promise<any> {
		return apiClient.patch(`/api/v1/master/terms/${termId}/activate`);
	},

	/**
	 * Mengambil seluruh program studi.
	 */
	async getStudyPrograms(): Promise<any[]> {
		return apiClient.get<any[]>("/api/v1/master/programs");
	},

	/**
	 * Mengambil seluruh kurikulum mata kuliah.
	 */
	async getCourses(): Promise<any[]> {
		return apiClient.get<any[]>("/api/v1/master/courses");
	},

	/**
	 * Mengambil seluruh ruangan kampus.
	 */
	async getRooms(): Promise<any[]> {
		return apiClient.get<any[]>("/api/v1/master/rooms");
	},

	/**
	 * Mengambil seluruh gedung kampus.
	 */
	async getBuildings(): Promise<any[]> {
		return apiClient.get<any[]>("/api/v1/master/buildings");
	},

	/**
	 * Mengambil seluruh kelas dan jadwal perkuliahan.
	 */
	async getAllClasses(params?: {
		academicTermId?: string;
		search?: string;
	}): Promise<JadwalKuliahItem[]> {
		const res = await apiClient.get<any[]>("/api/v1/classes", { params });
		const flatSchedules: JadwalKuliahItem[] = [];

		for (const cls of res || []) {
			const schedules = cls.schedules || [];
			if (schedules.length === 0) {
				flatSchedules.push(
					adaptJadwalKuliah(
						{
							classId: cls.id,
							courseCode: cls.course?.code,
							courseName: cls.course?.name,
							sks: cls.course?.sks,
							lecturerName: cls.lecturer?.user?.name,
							classCode: cls.code,
							room: "Belum Ditentukan",
							day: "Senin",
							startTime: "08:00",
							endTime: "10:30",
						},
						flatSchedules.length,
					),
				);
			} else {
				for (const s of schedules) {
					flatSchedules.push(
						adaptJadwalKuliah(
							{
								classId: cls.id,
								courseCode: cls.course?.code,
								courseName: cls.course?.name,
								sks: cls.course?.sks,
								lecturerName: cls.lecturer?.user?.name,
								classCode: cls.code,
								room: s.room?.name || s.room?.code || "Ruang Kuliah",
								day: s.day,
								startTime: s.startTime,
								endTime: s.endTime,
							},
							flatSchedules.length,
						),
					);
				}
			}
		}

		return flatSchedules;
	},

	/**
	 * Mengambil seluruh akun pengguna untuk Administrator BAAK.
	 */
	async getUsers(params?: {
		role?: string;
		search?: string;
	}): Promise<UserManagementItem[]> {
		const res = await apiClient.get<any[]>("/api/v1/auth/users", { params });
		return (res || []).map(adaptUserManagement);
	},

	/**
	 * Mengambil ringkasan eksekutif laporan akademik.
	 */
	async getAcademicSummaryReport(termId?: string): Promise<any> {
		return apiClient.get("/api/v1/reports/summary/academic", {
			params: { termId },
		});
	},

	/**
	 * Mengunduh file CSV rekap nilai kelas secara langsung melalui browser.
	 */
	triggerDownloadGradesCsv(classId: string): void {
		window.open(`/api/v1/reports/grades/${classId}/csv`, "_blank");
	},

	/**
	 * Mengunduh file CSV matriks absensi kelas secara langsung melalui browser.
	 */
	triggerDownloadAttendanceCsv(classId: string): void {
		window.open(`/api/v1/reports/attendance/${classId}/csv`, "_blank");
	},
};
