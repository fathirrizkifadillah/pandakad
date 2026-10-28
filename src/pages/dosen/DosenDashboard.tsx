import {
	ArrowRight,
	Award,
	BookOpenCheck,
	Calendar,
	Users,
} from "lucide-react";
import type React from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PandaMascot } from "../../components/ui/PandaMascot";
import { StatCard } from "../../components/ui/StatCard";
import { mockKelasDosen, mockUsers } from "../../mock/academicData";

interface DosenDashboardProps {
	onNavigate: (path: string) => void;
}

export const DosenDashboard: React.FC<DosenDashboardProps> = ({
	onNavigate,
}) => {
	const lecturer = mockUsers.Dosen;

	return (
		<div className="space-y-6">
			{/* Header Banner */}
			<div className="bg-gradient-to-r from-[#75834a]/15 via-white to-amber-50/40 p-6 rounded-2xl border border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs font-bold text-[#75834a] uppercase tracking-wider">
							Portal Dosen UNPANDA
						</span>
						<Badge variant="olive">Dosen Tetap</Badge>
					</div>
					<h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
						Selamat Bertugas, {lecturer.name}!
					</h2>
					<p className="text-xs sm:text-sm text-slate-600 mt-1">
						NIDN:{" "}
						<span className="font-mono font-semibold">
							{lecturer.identifier}
						</span>{" "}
						• Homebase: <span className="font-semibold">{lecturer.prodi}</span>
					</p>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					<Button
						variant="primary"
						onClick={() => onNavigate("dosen-nilai")}
						rightIcon={<ArrowRight className="w-4 h-4" />}
					>
						Input Nilai Mahasiswa
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					label="Kelas yang Diampu"
					value="3 Kelas"
					subtext="2 Mata Kuliah Aktif"
					icon={<BookOpenCheck className="w-6 h-6" />}
					accentColor="olive"
				/>
				<StatCard
					label="Total Mahasiswa Binaan"
					value="116 Orang"
					subtext="Dari 3 rombongan belajar"
					icon={<Users className="w-6 h-6" />}
					accentColor="blue"
				/>
				<StatCard
					label="Jadwal Hari Ini"
					value="1 Sesi"
					subtext="Lab AI 302 (08:00 WIB)"
					icon={<Calendar className="w-6 h-6" />}
					accentColor="gold"
				/>
				<StatCard
					label="Kelengkapan RPS & Nilai"
					value="100%"
					subtext="Siap untuk evaluasi BAAK"
					icon={<Award className="w-6 h-6" />}
					accentColor="purple"
				/>
			</div>

			{/* Mascot Insight Message */}
			<PandaMascot message="Bapak/Ibu Dosen hebat! Hari ini ada 1 sesi kuliah 'Kecerdasan Buatan' di Lab AI. Jangan lupa absensi mahasiswa diinput sebelum jam 17:00 ya 🐼☕" />

			{/* Quick Access to Classes */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
						<BookOpenCheck className="w-4 h-4 text-[#75834a]" />
						Daftar Kelas Semester Ini
					</h3>
					<button
						type="button"
						onClick={() => onNavigate("dosen-kelas")}
						className="text-xs font-semibold text-[#75834a] hover:underline"
					>
						Kelola Semua Kelas →
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{mockKelasDosen.map((kelas) => (
						<Card key={kelas.id} className="hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-2">
								<Badge variant="olive">{kelas.kelas}</Badge>
								<span className="text-xs font-mono text-slate-500">
									{kelas.kode}
								</span>
							</div>
							<h4 className="font-bold text-base text-slate-900 leading-snug">
								{kelas.matkul}
							</h4>
							<p className="text-xs text-slate-500 mt-1">{kelas.prodi}</p>
							<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
								<span>{kelas.jumlahMahasiswa} Mahasiswa</span>
								<button
									type="button"
									onClick={() => onNavigate("campus-map")}
									className="font-medium text-[#75834a] hover:underline flex items-center gap-1 cursor-pointer"
								>
									<span>📍 {kelas.ruang}</span>
								</button>
							</div>
							<div className="mt-3 flex items-center gap-2">
								<Button
									size="sm"
									variant="outline"
									className="w-full text-xs"
									onClick={() => onNavigate("dosen-absensi")}
								>
									Absensi
								</Button>
								<Button
									size="sm"
									variant="primary"
									className="w-full text-xs"
									onClick={() => onNavigate("dosen-nilai")}
								>
									Nilai
								</Button>
							</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
};
