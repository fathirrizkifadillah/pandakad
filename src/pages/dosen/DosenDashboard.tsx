import {
	ArrowRight,
	Award,
	BookOpenCheck,
	Calendar,
	MapPin,
	Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PandaMascot } from "../../components/ui/PandaMascot";
import { StatCard } from "../../components/ui/StatCard";
import { mockKelasDosen, mockUsers } from "../../mock/academicData";
import { lecturerApi } from "../../services/api/lecturer";

interface DosenDashboardProps {
	onNavigate: (path: string) => void;
}

export const DosenDashboard: React.FC<DosenDashboardProps> = ({
	onNavigate,
}) => {
	const lecturer = mockUsers.Dosen;
	const [dashboardData, setDashboardData] = useState<any>(null);

	// Muat data dashboard dosen riil dari API
	useEffect(() => {
		const loadLecturer = async () => {
			try {
				const res = await lecturerApi.getLecturerDashboard();
				if (res) setDashboardData(res);
			} catch {
				// Gunakan data mock jika backend offline
			}
		};
		loadLecturer();
	}, []);

	const currentLecturer = dashboardData?.lecturer || lecturer;
	const stats = dashboardData?.stats;
	const classesList =
		dashboardData?.classes?.length > 0
			? dashboardData.classes.map((cls: any) => ({
					id: cls.id,
					kelas: cls.code,
					kode: cls.courseCode,
					matkul: cls.courseName,
					prodi: currentLecturer.prodi || "S1 Teknik Informatika",
					sks: cls.sks,
					ruang: cls.schedules?.[0]?.room || "Lab AI 302",
					jumlahMahasiswa: cls.enrolledCount ?? 0,
				}))
			: mockKelasDosen;

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
						Selamat Bertugas, {currentLecturer.name}!
					</h2>
					<p className="text-xs sm:text-sm text-slate-600 mt-1">
						NIDN:{" "}
						<span className="font-mono font-semibold">
							{currentLecturer.nidn || currentLecturer.identifier}
						</span>{" "}
						• Homebase:{" "}
						<span className="font-semibold">{currentLecturer.prodi}</span>
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
					value={`${stats?.totalClasses ?? 3} Kelas`}
					subtext={`${classesList.length} Rombongan Belajar Aktif`}
					icon={<BookOpenCheck className="w-6 h-6" />}
					accentColor="olive"
				/>
				<StatCard
					label="Total Mahasiswa Binaan"
					value={`${stats?.totalStudents ?? 116} Orang`}
					subtext={`${stats?.pendingKrsApprovals ?? 0} Pengajuan KRS Menunggu`}
					icon={<Users className="w-6 h-6" />}
					accentColor="blue"
				/>
				<StatCard
					label="Jadwal Hari Ini"
					value={`${stats?.todaySessionCount ?? 1} Sesi`}
					subtext={
						dashboardData?.todaySchedule?.sessions?.[0]
							? `${dashboardData.todaySchedule.sessions[0].room} (${dashboardData.todaySchedule.sessions[0].startTime} WIB)`
							: "Lab AI 302 (08:00 WIB)"
					}
					icon={<Calendar className="w-6 h-6" />}
					accentColor="gold"
				/>
				<StatCard
					label="Kelengkapan RPS & Nilai"
					value={`${stats?.gradingCompleteness ?? 100}%`}
					subtext="Siap untuk evaluasi BAAK"
					icon={<Award className="w-6 h-6" />}
					accentColor="purple"
				/>
			</div>

			{/* Mascot Insight Message */}
			<PandaMascot
				message={`Bapak/Ibu ${currentLecturer.name}, portal terhubung prima ke database akademik UNPANDA. Terdapat ${stats?.totalClasses ?? 3} kelas perkuliahan aktif semester ini.`}
			/>

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
						className="text-xs font-semibold text-[#75834a] hover:underline cursor-pointer"
					>
						Kelola Semua Kelas →
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{classesList.map((kelas: any) => (
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
									<MapPin className="w-3.5 h-3.5" />
									<span>{kelas.ruang}</span>
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
