import type React from "react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { PandaMascot } from "../../components/ui/PandaMascot";
import { mockPresensi } from "../../mock/academicData";

export const PresensiPage: React.FC = () => {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
					Rekapitulasi Presensi Kuliah
				</h2>
				<p className="text-xs text-slate-500 mt-1">
					Pantau kehadiran kuliah per mata kuliah. Syarat mengikuti Ujian Akhir
					Semester (UAS) adalah minimal 75% kehadiran.
				</p>
			</div>

			<PandaMascot message="Kehadiran kamu rata-rata di atas 90%, keren banget! Pertahankan terus biar ga kena cegat waktu ujian semester ya 🐼" />

			<Card padded={false} className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
								<th className="py-3 px-4">Mata Kuliah & Kode</th>
								<th className="py-3 px-3">Dosen Pengampu</th>
								<th className="py-3 px-3 text-center">Total Sesi</th>
								<th className="py-3 px-3 text-center">Hadir</th>
								<th className="py-3 px-3 text-center">Izin</th>
								<th className="py-3 px-3 text-center">Sakit</th>
								<th className="py-3 px-3 text-center">Alpa</th>
								<th className="py-3 px-4 text-center">Persentase</th>
								<th className="py-3 px-3 text-center">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/80">
							{mockPresensi.map((p) => {
								const isSafe = p.persentase >= 75;
								return (
									<tr
										key={p.id}
										className="hover:bg-slate-50/80 transition-colors"
									>
										<td className="py-3.5 px-4">
											<span className="font-bold text-slate-900 block">
												{p.matkul}
											</span>
											<span className="text-[11px] font-mono text-slate-500">
												{p.kode} • {p.sks} SKS
											</span>
										</td>
										<td className="py-3.5 px-3 text-slate-700">{p.dosen}</td>
										<td className="py-3.5 px-3 text-center font-medium">
											{p.totalPertemuan}
										</td>
										<td className="py-3.5 px-3 text-center font-bold text-emerald-700">
											{p.hadir}
										</td>
										<td className="py-3.5 px-3 text-center text-slate-600">
											{p.izin}
										</td>
										<td className="py-3.5 px-3 text-center text-slate-600">
											{p.sakit}
										</td>
										<td className="py-3.5 px-3 text-center text-rose-600 font-bold">
											{p.alpa}
										</td>
										<td className="py-3.5 px-4 text-center">
											<div className="flex items-center justify-center gap-2">
												<span className="font-bold tabular-nums text-slate-900">
													{p.persentase}%
												</span>
											</div>
										</td>
										<td className="py-3.5 px-3 text-center">
											<Badge variant={isSafe ? "success" : "danger"}>
												{isSafe ? "Memenuhi Syarat" : "Perhatian"}
											</Badge>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};
