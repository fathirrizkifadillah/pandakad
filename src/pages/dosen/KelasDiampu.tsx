import { Award, Clock, MapPin, UserCheck, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockKelasDosen } from "../../mock/academicData";
import { lecturerApi } from "../../services/api/lecturer";
import type { KelasDosenItem } from "../../types";

interface KelasDiampuProps {
	onNavigate: (path: string) => void;
}

export const KelasDiampu: React.FC<KelasDiampuProps> = ({ onNavigate }) => {
	const [taughtClasses, setTaughtClasses] =
		useState<KelasDosenItem[]>(mockKelasDosen);

	// Muat daftar kelas riil dosen dari backend API
	useEffect(() => {
		const loadClasses = async () => {
			try {
				const res = await lecturerApi.getTaughtClasses();
				if (res && res.length > 0) {
					setTaughtClasses(res);
				}
			} catch {
				// Gunakan data mock jika backend offline
			}
		};
		loadClasses();
	}, []);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
					Kelas yang Diampu
				</h2>
				<p className="text-xs text-slate-500 mt-1">
					Daftar rombongan belajar dan mata kuliah yang Anda bimbing pada
					Semester Ganjil 2026/2027.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{taughtClasses.map((item) => (
					<Card
						key={item.id}
						className="flex flex-col justify-between hover:shadow-md transition-shadow"
					>
						<div>
							<div className="flex items-center justify-between mb-2">
								<Badge variant="olive">{item.kelas}</Badge>
								<span className="font-mono text-xs text-slate-500">
									{item.kode} • {item.sks} SKS
								</span>
							</div>
							<h3 className="font-bold text-lg text-slate-900 leading-snug">
								{item.matkul}
							</h3>
							<p className="text-xs text-slate-500 mt-1">{item.prodi}</p>

							<dl className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
								<div className="flex items-center justify-between">
									<span className="flex items-center gap-1.5 text-slate-500">
										<Clock className="w-3.5 h-3.5" /> Jadwal
									</span>
									<span className="font-semibold text-slate-800">
										{item.jadwal}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="flex items-center gap-1.5 text-slate-500">
										<MapPin className="w-3.5 h-3.5" /> Ruangan
									</span>
									<span className="font-semibold text-slate-800">
										{item.ruang}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="flex items-center gap-1.5 text-slate-500">
										<Users className="w-3.5 h-3.5" /> Peserta
									</span>
									<span className="font-semibold text-slate-800">
										{item.jumlahMahasiswa} Mahasiswa
									</span>
								</div>
							</dl>
						</div>

						<div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={() => onNavigate("dosen-absensi")}
								leftIcon={<UserCheck className="w-3.5 h-3.5" />}
							>
								Presensi
							</Button>
							<Button
								size="sm"
								variant="primary"
								onClick={() => onNavigate("dosen-nilai")}
								leftIcon={<Award className="w-3.5 h-3.5" />}
							>
								Input Nilai
							</Button>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};
