import { Clock, Download, MapPin, Users } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockKelasDosen } from "../../mock/academicData";
import { lecturerApi } from "../../services/api/lecturer.js";
import type { KelasDosenItem } from "../../types";

export const JadwalMengajar: React.FC = () => {
	const [schedules, setSchedules] = useState<KelasDosenItem[]>(mockKelasDosen);

	useEffect(() => {
		let isMounted = true;
		lecturerApi
			.getTaughtClasses()
			.then((classes) => {
				if (isMounted && classes && classes.length > 0) {
					setSchedules(classes);
				}
			})
			.catch(() => {
				// Keep fallback
			});

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Jadwal Mengajar Dosen
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Agenda pengajaran tatap muka dan laboratorium Semester Ganjil
						2026/2027.
					</p>
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						alert("Jadwal mengajar berhasil diunduh dalam format PDF!")
					}
					leftIcon={<Download className="w-4 h-4" />}
				>
					Unduh Jadwal PDF
				</Button>
			</div>

			<div className="space-y-4">
				{schedules.map((item) => (
					<Card key={item.id} className="hover:shadow-sm transition-shadow">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<Badge variant="olive">{item.kelas}</Badge>
									<span className="font-mono text-xs text-slate-500">
										{item.kode} • {item.sks} SKS
									</span>
									<span className="text-xs text-slate-500 font-medium">
										({item.prodi})
									</span>
								</div>
								<h3 className="font-bold text-lg text-slate-900">
									{item.matkul}
								</h3>
								<div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
									<span className="flex items-center gap-1 font-semibold text-[#566432]">
										<Clock className="w-3.5 h-3.5" /> {item.jadwal}
									</span>
									<span>•</span>
									<span className="flex items-center gap-1 text-slate-700">
										<MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
										{item.ruang}
									</span>
									<span>•</span>
									<span className="flex items-center gap-1 text-slate-700">
										<Users className="w-3.5 h-3.5 text-slate-400" />{" "}
										{item.jumlahMahasiswa} Peserta
									</span>
								</div>
							</div>

							<div className="flex items-center gap-2 shrink-0">
								<Button
									size="sm"
									variant="primary"
									onClick={() => alert(`Masuk ke kelas online ${item.kelas}`)}
								>
									Buka Ruang Kelas
								</Button>
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};
