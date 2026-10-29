import { Clock, Plus } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockJadwalMahasiswa } from "../../mock/academicData";
import { adminApi } from "../../services/api/admin.js";
import type { JadwalKuliahItem } from "../../types";

export const Penjadwalan: React.FC = () => {
	const [selectedDay, setSelectedDay] = useState("Semua");
	const [jadwalList, setJadwalList] =
		useState<JadwalKuliahItem[]>(mockJadwalMahasiswa);

	useEffect(() => {
		let isMounted = true;
		adminApi
			.getAllClasses()
			.then((items) => {
				if (isMounted && items && items.length > 0) {
					setJadwalList(items);
				}
			})
			.catch(() => {
				// Keep fallback
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const days = ["Semua", "Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
	const filtered =
		selectedDay === "Semua"
			? jadwalList
			: jadwalList.filter((j) => j.hari === selectedDay);

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Penjadwalan Perkuliahan Kampus
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Pengaturan alokasi waktu sesi, ruang kelas, dan bentrok pengajaran
						(Semester Ganjil 2026/2027).
					</p>
				</div>

				<Button
					variant="primary"
					size="sm"
					onClick={() => alert("Modal formulir tambah jadwal kelas baru siap!")}
					leftIcon={<Plus className="w-4 h-4" />}
				>
					Tambah Jadwal Kuliah
				</Button>
			</div>

			<Card padded={false} className="overflow-hidden">
				{/* Day Filter */}
				<div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
					{days.map((day) => (
						<button
							key={day}
							type="button"
							onClick={() => setSelectedDay(day)}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
								selectedDay === day
									? "bg-[#75834a] text-white shadow-2xs"
									: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
							}`}
						>
							{day}
						</button>
					))}
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
								<th className="py-3 px-4">Hari & Jam</th>
								<th className="py-3 px-4">Mata Kuliah</th>
								<th className="py-3 px-3">Kelas</th>
								<th className="py-3 px-3">Ruangan</th>
								<th className="py-3 px-3">Dosen Pengampu</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/80">
							{filtered.map((j) => (
								<tr
									key={j.id}
									className="hover:bg-slate-50/80 transition-colors"
								>
									<td className="py-3.5 px-4">
										<span className="font-bold text-slate-900 block">
											{j.hari}
										</span>
										<span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
											<Clock className="w-3 h-3 text-[#75834a]" />
											{j.jam}
										</span>
									</td>
									<td className="py-3.5 px-4 font-bold text-slate-900">
										{j.matkul}
										<span className="block text-[11px] font-mono font-normal text-slate-500">
											{j.kode} • {j.sks} SKS
										</span>
									</td>
									<td className="py-3.5 px-3">
										<Badge variant="olive">{j.kelas}</Badge>
									</td>
									<td className="py-3.5 px-3 font-semibold text-slate-800">
										{j.ruang}
									</td>
									<td className="py-3.5 px-3 text-slate-700">{j.dosen}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};
