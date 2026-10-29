import {
	ArrowRight,
	BookOpen,
	Database,
	GraduationCap,
	Plus,
	Users,
} from "lucide-react";
import type React from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PandaMascot } from "../../components/ui/PandaMascot";
import { StatCard } from "../../components/ui/StatCard";
import { mockPeriodeAkademik, mockUsers } from "../../mock/academicData";

interface AdminDashboardProps {
	onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
	onNavigate,
}) => {
	const admin = mockUsers.Admin;
	const activePeriod = mockPeriodeAkademik.find((p) => p.status === "Aktif");

	return (
		<div className="space-y-6">
			{/* Welcome Banner */}
			<div className="bg-gradient-to-r from-[#75834a]/15 via-white to-amber-50/40 p-6 rounded-2xl border border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs font-bold text-[#75834a] uppercase tracking-wider">
							Dashboard BAAK & Sistem Informasi
						</span>
						<Badge variant="olive">Administrator Utama</Badge>
					</div>
					<h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
						Selamat Bertugas, Pak {admin.name.split(" ")[1]}!
					</h2>
					<p className="text-xs sm:text-sm text-slate-600 mt-1">
						Periode Berjalan:{" "}
						<span className="font-bold text-[#566432]">
							Semester {activePeriod?.semester} {activePeriod?.tahun}
						</span>{" "}
						• Status:{" "}
						<span className="font-semibold text-emerald-700">
							KRS Online Aktif
						</span>
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<Button variant="outline" onClick={() => onNavigate("admin-laporan")}>
						Unduh Laporan
					</Button>
					<Button
						variant="primary"
						onClick={() => onNavigate("admin-jadwal")}
						leftIcon={<Plus className="w-4 h-4" />}
					>
						Tambah Jadwal
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					label="Total Mahasiswa Aktif"
					value="1,420"
					subtext="Reguler & Ekstensi"
					icon={<GraduationCap className="w-6 h-6" />}
					accentColor="olive"
					trend={{ text: "↑ 124 Mhs Baru Angkatan 2026", isPositive: true }}
				/>
				<StatCard
					label="Total Tenaga Pendidik"
					value="86 Dosen"
					subtext="Tetap & Luar Biasa"
					icon={<Users className="w-6 h-6" />}
					accentColor="gold"
				/>
				<StatCard
					label="Mata Kuliah Dibuka"
					value="148 Matkul"
					subtext="Di 6 Program Studi"
					icon={<BookOpen className="w-6 h-6" />}
					accentColor="blue"
				/>
				<StatCard
					label="Kapasitas Ruang Kuliah"
					value="32 Ruangan"
					subtext="Okupansi rata-rata 82%"
					icon={<Database className="w-6 h-6" />}
					accentColor="purple"
				/>
			</div>

			{/* Mascot System Alert */}
			<PandaMascot message="Semua server portal dan database UNPANDA beroperasi prima. Masa pengisian KRS tersisa 2 hari sebelum batas penutupan." />

			{/* Quick Action Modules */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Card className="hover:shadow-sm">
					<div className="flex items-center justify-between mb-3">
						<h4 className="font-bold text-base text-slate-900">
							Manajemen Pengguna
						</h4>
						<Badge variant="olive">1,506 Akun</Badge>
					</div>
					<p className="text-xs text-slate-600 leading-relaxed mb-4">
						Kelola akun login mahasiswa, dosen, dan staf BAAK. Tambah pengguna
						baru atau reset kata sandi.
					</p>
					<Button
						size="sm"
						variant="outline"
						className="w-full"
						onClick={() => onNavigate("admin-users")}
						rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
					>
						Buka Manajemen Akun
					</Button>
				</Card>

				<Card className="hover:shadow-sm">
					<div className="flex items-center justify-between mb-3">
						<h4 className="font-bold text-base text-slate-900">
							Master Data Akademik
						</h4>
						<Badge variant="gold">6 Program Studi</Badge>
					</div>
					<p className="text-xs text-slate-600 leading-relaxed mb-4">
						Konfigurasi kurikulum, mata kuliah prasyarat, pemetaan ruang kelas,
						dan laboratorium kampus.
					</p>
					<Button
						size="sm"
						variant="outline"
						className="w-full"
						onClick={() => onNavigate("admin-master")}
						rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
					>
						Kelola Data Master
					</Button>
				</Card>

				<Card className="hover:shadow-sm">
					<div className="flex items-center justify-between mb-3">
						<h4 className="font-bold text-base text-slate-900">
							Periode & Batas Waktu
						</h4>
						<Badge variant="success">Sedang Buka</Badge>
					</div>
					<p className="text-xs text-slate-600 leading-relaxed mb-4">
						Jadwalkan buka/tutup pengisian KRS online, masa revisi studi, dan
						rentang input nilai dosen.
					</p>
					<Button
						size="sm"
						variant="primary"
						className="w-full"
						onClick={() => onNavigate("admin-periode")}
						rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
					>
						Atur Periode Akademik
					</Button>
				</Card>
			</div>
		</div>
	);
};
