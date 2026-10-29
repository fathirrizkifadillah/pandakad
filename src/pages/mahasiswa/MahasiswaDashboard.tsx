import {
	ArrowRight,
	Award,
	BookOpen,
	Calendar,
	CheckCircle2,
	Clock,
	GraduationCap,
	MapPin,
	Sparkles,
} from "lucide-react";
import type React from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PandaMascot } from "../../components/ui/PandaMascot";
import { StatCard } from "../../components/ui/StatCard";
import { mockJadwalMahasiswa, mockUsers } from "../../mock/academicData";

interface MahasiswaDashboardProps {
	onNavigate: (path: string) => void;
}

export const MahasiswaDashboard: React.FC<MahasiswaDashboardProps> = ({
	onNavigate,
}) => {
	const student = mockUsers.Mahasiswa;

	return (
		<div className="space-y-6">
			{/* Welcome Banner */}
			<div className="bg-gradient-to-r from-[#75834a]/15 via-white to-amber-50/40 p-6 rounded-2xl border border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs font-bold text-[#75834a] uppercase tracking-wider">
							Portal Mahasiswa UNPANDA
						</span>
						<Badge variant="olive">Semester 5 Aktif</Badge>
					</div>
					<h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
						Selamat Datang, {student.name}!
					</h2>
					<p className="text-xs sm:text-sm text-slate-600 mt-1">
						Program Studi:{" "}
						<span className="font-semibold">{student.prodi}</span> • NIM:{" "}
						<span className="font-mono font-medium">{student.identifier}</span>
					</p>
				</div>

				<div className="shrink-0">
					<Button
						variant="primary"
						onClick={() => onNavigate("mhs-krs")}
						rightIcon={<ArrowRight className="w-4 h-4" />}
					>
						Lanjutkan Pengisian KRS
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					label="Indeks Prestasi Kumulatif"
					value={student.ipk ?? 3.84}
					subtext="Target Kelulusan: Cumlaude"
					icon={<Award className="w-6 h-6" />}
					accentColor="olive"
					trend={{ text: "↑ Naik 0.04 dari semester lalu", isPositive: true }}
				/>
				<StatCard
					label="Total SKS Diperoleh"
					value={`${student.sksTotal ?? 84} SKS`}
					subtext="Dari total 144 SKS kelulusan"
					icon={<GraduationCap className="w-6 h-6" />}
					accentColor="gold"
					trend={{ text: "58.3% Menuju Sarjana", isPositive: true }}
				/>
				<StatCard
					label="SKS Semester Berjalan"
					value="15 SKS"
					subtext="5 Mata Kuliah Diambil"
					icon={<BookOpen className="w-6 h-6" />}
					accentColor="blue"
				/>
				<StatCard
					label="Tingkat Presensi"
					value="95.4%"
					subtext="Aman di atas batas 75%"
					icon={<CheckCircle2 className="w-6 h-6" />}
					accentColor="purple"
					trend={{ text: "Siap mengikuti UAS", isPositive: true }}
				/>
			</div>

			{/* Mascot Insight Message */}
			<PandaMascot
				message={`Indeks Prestasi Kumulatif kamu saat ini adalah ${student.ipk}. Pertahankan ritme belajar dan kedisiplinan akademik semester ini.`}
			/>

			{/* Content Grid: Jadwal Hari Ini & Timeline Pengumuman */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Jadwal Kuliah Hari Ini */}
				<div className="lg:col-span-7 space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
							<Calendar className="w-4 h-4 text-[#75834a]" />
							Jadwal Kuliah Hari Ini
						</h3>
						<button
							type="button"
							onClick={() => onNavigate("mhs-jadwal")}
							className="text-xs font-semibold text-[#75834a] hover:underline"
						>
							Lihat Seluruh Jadwal →
						</button>
					</div>

					<Card
						padded={false}
						className="divide-y divide-slate-100 overflow-hidden"
					>
						{mockJadwalMahasiswa.slice(0, 3).map((jdw, idx) => (
							<div
								key={jdw.id}
								className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors"
							>
								<div className="w-12 h-12 rounded-xl bg-[#75834a]/10 text-[#566432] flex flex-col items-center justify-center font-bold shrink-0">
									<span className="text-[10px] uppercase font-semibold text-slate-500">
										Sesi
									</span>
									<span className="text-base font-extrabold">{idx + 1}</span>
								</div>

								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="text-xs font-mono text-slate-500">
											{jdw.kode}
										</span>
										<Badge variant="olive">{jdw.sks} SKS</Badge>
									</div>
									<h4 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5 truncate">
										{jdw.matkul}
									</h4>
									<p className="text-xs text-slate-600 mt-1">
										Dosen: <span className="font-medium">{jdw.dosen}</span>
									</p>
									<div className="flex items-center justify-between mt-2 text-xs text-slate-500">
										<div className="flex items-center gap-2 text-xs">
											<span className="flex items-center gap-1 text-slate-700 font-medium">
												<Clock className="w-3.5 h-3.5 text-[#75834a]" />
												{jdw.jam}
											</span>
											<span>•</span>
											<span>Ruang: {jdw.ruang}</span>
										</div>
										<button
											type="button"
											onClick={() => onNavigate("campus-map")}
											className="text-[11px] font-semibold text-[#75834a] hover:text-[#566432] hover:underline flex items-center gap-1 cursor-pointer"
										>
											<MapPin className="w-3 h-3" />
											<span>Denah</span>
										</button>
									</div>
								</div>
							</div>
						))}
					</Card>
				</div>

				{/* Pengumuman & Agenda Akademik */}
				<div className="lg:col-span-5 space-y-4">
					<h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
						<Sparkles className="w-4 h-4 text-[#d2ae54]" />
						Pengumuman & Agenda Terkini
					</h3>

					<Card className="space-y-4">
						<div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
							<span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block mb-1">
								Penting · Batas Waktu KRS
							</span>
							<p className="text-xs text-amber-900 font-medium leading-relaxed">
								Pengisian dan revisi KRS online ditutup pada{" "}
								<span className="font-bold">
									30 Agustus 2026, pukul 23:59 WIB
								</span>
								. Jangan sampai terlambat mengajukan ke DPA!
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
							<span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
								Kuliah Perdana Semester Ganjil
							</span>
							<p className="text-xs text-slate-600 leading-relaxed">
								Perkuliahan semester ganjil dimulai serentak pada{" "}
								<span className="font-semibold text-slate-900">
									01 September 2026
								</span>
								. Pastikan ruangan dan jadwal kuliah telah diverifikasi.
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-[#75834a]/10 border border-[#75834a]/20">
							<span className="text-[11px] font-bold text-[#566432] uppercase tracking-wide block mb-1">
								Sosialisasi Beasiswa Prestasi
							</span>
							<p className="text-xs text-slate-700 leading-relaxed">
								Pendaftaran Beasiswa Unggulan Mahasiswa Berprestasi UNPANDA
								dibuka mulai pekan depan di Bagian Kemahasiswaan.
							</p>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};
