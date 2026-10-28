export type Role = "Admin" | "Dosen" | "Mahasiswa";

export interface User {
	id: string;
	name: string;
	role: Role;
	identifier: string; // NIM for Mahasiswa, NIDN for Dosen, NIP for Admin
	email: string;
	avatar?: string;
	prodi?: string;
	semester?: number;
	ipk?: number;
	sksTotal?: number;
	dpa?: string;
}

export interface MataKuliah {
	id: string;
	kode: string;
	nama: string;
	sks: number;
	semester: number;
	dosen: string;
	ruang: string;
	hari: string;
	jam: string;
	kuota: number;
	terisi: number;
	prasyarat?: string;
	kategori: "Wajib" | "Pilihan";
}

export interface KRSItem extends MataKuliah {
	status: "Disetujui" | "Menunggu Persetujuan" | "Draft";
	tanggalDipilih?: string;
}

export interface JadwalKuliahItem {
	id: string;
	kode: string;
	matkul: string;
	sks: number;
	dosen: string;
	ruang: string;
	hari: string;
	jam: string;
	kelas: string;
}

export interface NilaiSemesterItem {
	no: number;
	kode: string;
	matkul: string;
	sks: number;
	nilaiTugas: number;
	nilaiUTS: number;
	nilaiUAS: number;
	nilaiAkhir: number;
	nilaiHuruf: "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D" | "E";
	bobot: number;
}

export interface PresensiItem {
	id: string;
	kode: string;
	matkul: string;
	dosen: string;
	sks: number;
	totalPertemuan: number;
	hadir: number;
	izin: number;
	sakit: number;
	alpa: number;
	persentase: number;
}

export interface KelasDosenItem {
	id: string;
	kode: string;
	matkul: string;
	kelas: string;
	prodi: string;
	sks: number;
	ruang: string;
	jadwal: string;
	jumlahMahasiswa: number;
}

export interface NilaiMahasiswaInput {
	nim: string;
	nama: string;
	kehadiran: number;
	tugas: number;
	uts: number;
	uas: number;
	nilaiAkhir: number;
	nilaiHuruf: string;
	status: "Draft" | "Final";
}

export interface UserManagementItem {
	id: string;
	name: string;
	role: Role;
	identifier: string;
	email: string;
	prodi: string;
	status: "Aktif" | "Nonaktif";
}

export interface PeriodeAkademik {
	id: string;
	semester: string;
	tahun: string;
	status: "Aktif" | "Ditutup" | "Mendatang";
	krsMulai: string;
	krsSelesai: string;
	kuliahMulai: string;
	kuliahSelesai: string;
	nilaiMulai: string;
	nilaiSelesai: string;
}
