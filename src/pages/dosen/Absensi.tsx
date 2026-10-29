import { CheckCircle, Save } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockMahasiswaNilaiInput } from "../../mock/academicData";

export const AbsensiDosen: React.FC = () => {
	const [pertemuan, setPertemuan] = useState("5");
	const [attendance, setAttendance] = useState<
		Record<string, "Hadir" | "Izin" | "Sakit" | "Alpa">
	>(() => {
		const init: Record<string, "Hadir" | "Izin" | "Sakit" | "Alpa"> = {};
		for (const item of mockMahasiswaNilaiInput) {
			init[item.nim] = "Hadir";
		}
		return init;
	});
	const [toast, setToast] = useState<string | null>(null);

	const handleStatusChange = (
		nim: string,
		status: "Hadir" | "Izin" | "Sakit" | "Alpa",
	) => {
		setAttendance((prev) => ({ ...prev, [nim]: status }));
	};

	const handleSave = () => {
		setToast(
			`Presensi Pertemuan ${pertemuan} berhasil disimpan dan disinkronkan ke portal BAAK.`,
		);
		setTimeout(() => setToast(null), 3500);
	};

	const pertemuanOptions = Array.from({ length: 16 }, (_, i) => i + 1);

	return (
		<div className="space-y-6">
			{toast && (
				<div className="fixed top-24 right-6 z-50 max-w-md bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-slate-700 animate-fade-in">
					<CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
					<p className="flex-1 font-medium">{toast}</p>
				</div>
			)}

			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Pencatatan Presensi Mahasiswa
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Kelas: <span className="font-semibold text-slate-800">TI-5A</span> •
						Kecerdasan Buatan (IF3101)
					</p>
				</div>

				<Button
					variant="primary"
					size="sm"
					onClick={handleSave}
					leftIcon={<Save className="w-4 h-4" />}
				>
					Simpan Kehadiran
				</Button>
			</div>

			<Card padded={false} className="overflow-hidden">
				<div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<label
							htmlFor="pertemuan-select"
							className="text-xs font-semibold text-slate-700"
						>
							Pilih Pertemuan:
						</label>
						<select
							id="pertemuan-select"
							value={pertemuan}
							onChange={(e) => setPertemuan(e.target.value)}
							className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-[#75834a]"
						>
							{pertemuanOptions.map((num) => (
								<option key={`p_${num}`} value={String(num)}>
									Pertemuan {num} (Materi Sesi {num})
								</option>
							))}
						</select>
					</div>

					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => {
								const allHadir: Record<
									string,
									"Hadir" | "Izin" | "Sakit" | "Alpa"
								> = {};
								for (const item of mockMahasiswaNilaiInput) {
									allHadir[item.nim] = "Hadir";
								}
								setAttendance(allHadir);
							}}
						>
							Set Semua Hadir
						</Button>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
								<th className="py-3 px-4">NIM & Nama Mahasiswa</th>
								<th className="py-3 px-4 text-center">Status Kehadiran</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/80">
							{mockMahasiswaNilaiInput.map((mhs) => {
								const currentStatus = attendance[mhs.nim] ?? "Hadir";
								return (
									<tr
										key={mhs.nim}
										className="hover:bg-slate-50/80 transition-colors"
									>
										<td className="py-3 px-4">
											<span className="font-bold text-slate-900 block">
												{mhs.nama}
											</span>
											<span className="font-mono text-slate-500 text-[11px]">
												{mhs.nim}
											</span>
										</td>
										<td className="py-3 px-4">
											<div className="flex items-center justify-center gap-1.5">
												{(["Hadir", "Izin", "Sakit", "Alpa"] as const).map(
													(st) => (
														<button
															key={st}
															type="button"
															onClick={() => handleStatusChange(mhs.nim, st)}
															className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
																currentStatus === st
																	? st === "Hadir"
																		? "bg-emerald-600 text-white shadow-xs"
																		: st === "Izin"
																			? "bg-sky-600 text-white shadow-xs"
																			: st === "Sakit"
																				? "bg-amber-600 text-white shadow-xs"
																				: "bg-rose-600 text-white shadow-xs"
																	: "bg-slate-100 text-slate-600 hover:bg-slate-200"
															}`}
														>
															{st}
														</button>
													),
												)}
											</div>
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
