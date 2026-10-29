import type {
	JadwalKuliahItem,
	KelasDosenItem,
	KRSItem,
	MataKuliah,
	NilaiSemesterItem,
	PeriodeAkademik,
	PresensiItem,
	User,
	UserManagementItem,
} from "../../types";

/**
 * Adapter untuk mengubah data respons pengguna dari backend ke tipe User frontend.
 */
export function adaptUser(data: any): User {
	if (!data) {
		throw new Error("Data pengguna kosong");
	}

	const profile = data.studentProfile || data.lecturerProfile;
	const prodi =
		profile?.studyProgram?.name ||
		data.prodi ||
		(data.role === "Admin"
			? "Biro Administrasi Akademik & Kemahasiswaan (BAAK)"
			: "Fakultas Teknologi dan Informatika");

	return {
		id: data.id,
		name: data.name,
		role: data.role,
		identifier: data.identifier,
		email: data.email,
		avatar: data.avatar || undefined,
		prodi,
		semester: profile?.currentSemester || (data.semester ?? 5),
		ipk: profile?.gpa ? Number(profile.gpa) : (data.ipk ?? 3.84),
		sksTotal: profile?.totalSks ?? data.sksTotal ?? 84,
		dpa:
			profile?.academicAdvisor?.user?.name ||
			data.dpa ||
			"Dr. Ir. Budi Santoso, M.Kom.",
	};
}

/**
 * Adapter untuk mengubah entitas Class relasional backend menjadi MataKuliah katalog frontend.
 */
export function adaptMataKuliah(cls: any): MataKuliah {
	const schedule = cls.schedules?.[0];
	const hari = schedule?.dayOfWeek || "Senin";
	const jam =
		schedule?.startTime && schedule?.endTime
			? `${schedule.startTime} - ${schedule.endTime}`
			: "08:00 - 10:30";
	const ruang = schedule?.room
		? `${schedule.room.code} (${schedule.room.name})`
		: "Lab AI 302";

	return {
		id: cls.id,
		kode: cls.course?.code || cls.code || "IF3101",
		nama: cls.course?.name || "Mata Kuliah UNPANDA",
		sks: cls.course?.sks ?? 3,
		semester: cls.course?.semester ?? 5,
		dosen: cls.lecturer?.user?.name || "Dr. Ir. Budi Santoso, M.Kom.",
		ruang,
		hari,
		jam,
		kuota: cls.quota ?? 40,
		terisi: cls.enrolledCount ?? 0,
		prasyarat: cls.prerequisites || undefined,
		kategori: (cls.course?.category as "Wajib" | "Pilihan") || "Wajib",
	};
}

/**
 * Adapter untuk mengubah entitas Enrollment menjadi item rencana studi KRSItem.
 */
export function adaptKrsItem(enr: any): KRSItem {
	const base = adaptMataKuliah(enr.class || enr);

	let status: "Disetujui" | "Menunggu Persetujuan" | "Draft" = "Draft";
	if (enr.status === "Approved") status = "Disetujui";
	else if (enr.status === "Submitted") status = "Menunggu Persetujuan";

	return {
		...base,
		id: enr.id || base.id, // gunakan enrollment ID agar dapat di-drop
		status,
		tanggalDipilih: enr.createdAt
			? new Date(enr.createdAt).toLocaleDateString("id-ID")
			: undefined,
	};
}

/**
 * Adapter untuk mengubah rekapitulasi presensi backend ke PresensiItem frontend.
 */
export function adaptPresensiItem(rec: any): PresensiItem {
	return {
		id: rec.id || rec.classId || "pr-01",
		kode: rec.kode || rec.courseCode || "IF3101",
		matkul: rec.matkul || rec.courseName || "Mata Kuliah",
		dosen: rec.dosen || rec.lecturerName || "Dosen Pengampu",
		sks: rec.sks ?? 3,
		totalPertemuan: rec.totalPertemuan ?? rec.conductedSessions ?? 16,
		hadir: rec.hadir ?? rec.presentCount ?? 0,
		izin: rec.izin ?? rec.permissionCount ?? 0,
		sakit: rec.sakit ?? rec.sickCount ?? 0,
		alpa: rec.alpa ?? rec.absentCount ?? 0,
		persentase: rec.persentase ?? rec.attendancePercentage ?? 100,
	};
}

/**
 * Adapter untuk mengubah nilai semester KHS backend ke NilaiSemesterItem frontend.
 */
export function adaptNilaiSemesterItem(
	gradeItem: any,
	index: number,
): NilaiSemesterItem {
	return {
		no: index + 1,
		kode: gradeItem.kode || gradeItem.courseCode || "IF3101",
		matkul: gradeItem.matkul || gradeItem.courseName || "Mata Kuliah",
		sks: gradeItem.sks ?? 3,
		nilaiTugas: Number(gradeItem.nilaiTugas ?? gradeItem.assignmentScore ?? 0),
		nilaiUTS: Number(gradeItem.nilaiUTS ?? gradeItem.midtermScore ?? 0),
		nilaiUAS: Number(gradeItem.nilaiUAS ?? gradeItem.finalExamScore ?? 0),
		nilaiAkhir: Number(gradeItem.nilaiAkhir ?? gradeItem.finalScore ?? 0),
		nilaiHuruf: (gradeItem.nilaiHuruf || gradeItem.letterGrade || "E") as any,
		bobot: Number(gradeItem.bobot ?? gradeItem.gradePoint ?? 0),
	};
}

/**
 * Adapter untuk mengubah daftar kelas yang diampu dosen ke KelasDosenItem frontend.
 */
export function adaptKelasDosen(cls: any): KelasDosenItem {
	const schedule = cls.schedules?.[0];
	const jadwal = schedule
		? `${schedule.dayOfWeek}, ${schedule.startTime} - ${schedule.endTime}`
		: "Senin, 08:00 - 10:30";

	return {
		id: cls.id,
		kode: cls.course?.code || cls.courseCode || "IF3101",
		matkul: cls.course?.name || cls.courseName || "Mata Kuliah",
		kelas: cls.code || "A",
		prodi: cls.prodi || "S1 Teknik Informatika",
		sks: cls.course?.sks || cls.sks || 3,
		ruang: schedule?.room?.code || "Lab AI 302",
		jadwal,
		jumlahMahasiswa: cls.enrolledCount ?? 0,
	};
}

/**
 * Adapter untuk mengubah sesi jadwal hari ini ke JadwalKuliahItem frontend.
 */
export function adaptJadwalKuliah(sch: any, index: number): JadwalKuliahItem {
	return {
		id: sch.classId || `sch-${index}`,
		kode: sch.courseCode || "IF3101",
		matkul: sch.courseName || "Mata Kuliah",
		sks: sch.sks || 3,
		dosen: sch.lecturerName || "Dr. Ir. Budi Santoso, M.Kom.",
		ruang: sch.room || "Lab AI 302",
		hari: sch.day || "Senin",
		jam: `${sch.startTime} - ${sch.endTime}`,
		kelas: sch.classCode || "A",
	};
}

/**
 * Adapter untuk data master periode akademik.
 */
export function adaptPeriodeAkademik(term: any): PeriodeAkademik {
	let status: "Aktif" | "Ditutup" | "Mendatang" = "Ditutup";
	if (term.isActive) status = "Aktif";

	return {
		id: term.id,
		semester: term.semester,
		tahun: term.academicYear,
		status,
		krsMulai: term.krsStartDate
			? new Date(term.krsStartDate).toLocaleDateString("id-ID")
			: "10 Agu 2026",
		krsSelesai: term.krsEndDate
			? new Date(term.krsEndDate).toLocaleDateString("id-ID")
			: "28 Agu 2026",
		kuliahMulai: term.startDate
			? new Date(term.startDate).toLocaleDateString("id-ID")
			: "01 Sep 2026",
		kuliahSelesai: term.endDate
			? new Date(term.endDate).toLocaleDateString("id-ID")
			: "24 Des 2026",
		nilaiMulai: term.gradeInputStartDate
			? new Date(term.gradeInputStartDate).toLocaleDateString("id-ID")
			: "01 Des 2026",
		nilaiSelesai: term.gradeInputEndDate
			? new Date(term.gradeInputEndDate).toLocaleDateString("id-ID")
			: "15 Jan 2027",
	};
}

/**
 * Adapter untuk manajemen user admin.
 */
export function adaptUserManagement(user: any): UserManagementItem {
	const prodi =
		user.studentProfile?.studyProgram?.name ||
		user.lecturerProfile?.studyProgram?.name ||
		(user.role === "Admin" ? "BAAK" : "FTI");

	return {
		id: user.id,
		name: user.name,
		role: user.role,
		identifier: user.identifier,
		email: user.email,
		prodi,
		status: user.isActive ? "Aktif" : "Nonaktif",
	};
}
