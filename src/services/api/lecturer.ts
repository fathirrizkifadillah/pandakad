import type { KelasDosenItem } from "../../types";
import { adaptKelasDosen } from "./adapters.js";
import { apiClient } from "./apiClient.js";

export const lecturerApi = {
	/**
	 * Mengambil data ringkasan dashboard dosen.
	 */
	async getLecturerDashboard(day?: string): Promise<any> {
		return apiClient.get("/api/v1/dashboard/lecturer", {
			params: { day },
		});
	},

	/**
	 * Mengambil daftar kelas yang diampu dosen pada semester ini.
	 */
	async getTaughtClasses(): Promise<KelasDosenItem[]> {
		const res = await apiClient.get<any>("/api/v1/dashboard/lecturer");
		return (res.classes || []).map(adaptKelasDosen);
	},

	/**
	 * Mengambil daftar mahasiswa di kelas untuk input nilai.
	 */
	async getClassStudentsForGrading(classId: string): Promise<any> {
		return apiClient.get(`/api/v1/grades/class/${classId}`);
	},

	/**
	 * Menyimpan nilai mahasiswa secara kolektif (batch).
	 */
	async saveBatchGrades(
		classId: string,
		grades: Array<{
			enrollmentId: string;
			attendanceScore: number;
			assignmentScore: number;
			midtermScore: number;
			finalExamScore: number;
			status?: "Draft" | "Final";
		}>,
	): Promise<any> {
		return apiClient.post("/api/v1/grades/batch", {
			classId,
			grades,
		});
	},

	/**
	 * Mengambil catatan presensi sesi kuliah tertentu.
	 */
	async getSessionAttendance(
		classId: string,
		sessionNumber: number,
	): Promise<any> {
		return apiClient.get(
			`/api/v1/attendance/class/${classId}/session/${sessionNumber}`,
		);
	},

	/**
	 * Menyimpan atau memperbarui catatan presensi sesi kuliah.
	 */
	async saveAttendanceSession(payload: {
		classId: string;
		sessionNumber: number;
		date?: string;
		startTime?: string;
		endTime?: string;
		topic?: string;
		records: Array<{
			studentId: string;
			status: "Hadir" | "Izin" | "Sakit" | "Alpa";
			notes?: string;
		}>;
	}): Promise<any> {
		return apiClient.post("/api/v1/attendance/session", payload);
	},

	/**
	 * Mengambil rekap presensi kelas.
	 */
	async getClassAttendanceRecap(classId: string): Promise<any> {
		return apiClient.get(`/api/v1/attendance/class/${classId}/recap`);
	},
};
