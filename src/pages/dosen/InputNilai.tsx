import { CheckCircle2, Save } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PandaMascot } from "../../components/ui/PandaMascot";
import { mockMahasiswaNilaiInput } from "../../mock/academicData";
import type { NilaiMahasiswaInput } from "../../types";

export const InputNilai: React.FC = () => {
	const [students, setStudents] = useState<NilaiMahasiswaInput[]>(
		mockMahasiswaNilaiInput,
	);
	const [selectedClass, setSelectedClass] = useState("TI-5A");
	const [toastMessage, setToastMessage] = useState<string | null>(null);

	const calculateGrade = (
		kehadiran: number,
		tugas: number,
		uts: number,
		uas: number,
	) => {
		// Formula standard: 10% kehadiran + 20% tugas + 35% UTS + 35% UAS
		const finalScore = Number(
			(kehadiran * 0.1 + tugas * 0.2 + uts * 0.35 + uas * 0.35).toFixed(1),
		);
		let letter = "E";
		if (finalScore >= 85) letter = "A";
		else if (finalScore >= 80) letter = "A-";
		else if (finalScore >= 75) letter = "B+";
		else if (finalScore >= 70) letter = "B";
		else if (finalScore >= 65) letter = "B-";
		else if (finalScore >= 60) letter = "C+";
		else if (finalScore >= 55) letter = "C";
		else if (finalScore >= 40) letter = "D";

		return { finalScore, letter };
	};

	const handleScoreChange = (
		nim: string,
		field: "kehadiran" | "tugas" | "uts" | "uas",
		value: number,
	) => {
		const clampedValue = Math.max(
			0,
			Math.min(100, Number.isNaN(value) ? 0 : value),
		);
		setStudents((prev) =>
			prev.map((s) => {
				if (s.nim === nim) {
					const updated = { ...s, [field]: clampedValue };
					const { finalScore, letter } = calculateGrade(
						updated.kehadiran,
						updated.tugas,
						updated.uts,
						updated.uas,
					);
					return {
						...updated,
						nilaiAkhir: finalScore,
						nilaiHuruf: letter,
						status: "Draft",
					};
				}
				return s;
			}),
		);
	};

	const handleSaveDraft = () => {
		setToastMessage("Nilai berhasil disimpan sebagai Draft lokal! 💾");
		setTimeout(() => setToastMessage(null), 3500);
	};

	const handleFinalize = () => {
		setStudents((prev) => prev.map((s) => ({ ...s, status: "Final" })));
		setToastMessage(
			"Nilai resmi dikunci & difinalisasi ke sistem BAAK UNPANDA! Mahasiswa kini dapat melihat nilainya 🎉",
		);
		setTimeout(() => setToastMessage(null), 4000);
	};

	return (
		<div className="space-y-6">
			{/* Toast Notification */}
			{toastMessage && (
				<div className="fixed top-24 right-6 z-50 max-w-md bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-slate-700 animate-fade-in">
					<span className="text-base">🐼</span>
					<p className="flex-1 font-medium">{toastMessage}</p>
				</div>
			)}

			{/* Header Info */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Input Nilai Mahasiswa
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Mata Kuliah:{" "}
						<span className="font-semibold text-slate-800">
							Kecerdasan Buatan & Machine Learning (IF3101)
						</span>{" "}
						• Semester Ganjil 2026/2027
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleSaveDraft}
						leftIcon={<Save className="w-4 h-4" />}
					>
						Simpan Draft
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={handleFinalize}
						leftIcon={<CheckCircle2 className="w-4 h-4" />}
					>
						Finalisasi Nilai
					</Button>
				</div>
			</div>

			{/* Mascot note */}
			<PandaMascot message="Formula kalkulasi otomatis: 10% Presensi + 20% Tugas + 35% UTS + 35% UAS. Silakan edit angka di kolom input, nilai akhir & huruf langsung terhitung seketika 🐼📊" />

			{/* Class filter and summary */}
			<Card padded={false} className="overflow-hidden">
				<div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<label
							htmlFor="filter-kelas"
							className="text-xs font-semibold text-slate-700"
						>
							Pilih Kelas:
						</label>
						<select
							id="filter-kelas"
							value={selectedClass}
							onChange={(e) => setSelectedClass(e.target.value)}
							className="text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-[#75834a]"
						>
							<option value="TI-5A">TI-5A (Pagi - 36 Mahasiswa)</option>
							<option value="TI-5B">TI-5B (Siang - 38 Mahasiswa)</option>
						</select>
					</div>

					<div className="flex items-center gap-4 text-xs text-slate-600">
						<span>
							Total Input:{" "}
							<strong className="text-slate-900">
								{students.length} Mahasiswa
							</strong>
						</span>
						<span>•</span>
						<span>
							Rata-rata Kelas:{" "}
							<strong className="text-[#75834a]">
								{(
									students.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) /
									students.length
								).toFixed(1)}
							</strong>
						</span>
					</div>
				</div>

				{/* Input Grades Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
								<th className="py-3 px-4">NIM & Nama Mahasiswa</th>
								<th className="py-3 px-3 text-center">Presensi (10%)</th>
								<th className="py-3 px-3 text-center">Tugas (20%)</th>
								<th className="py-3 px-3 text-center">UTS (35%)</th>
								<th className="py-3 px-3 text-center">UAS (35%)</th>
								<th className="py-3 px-3 text-center">Nilai Akhir</th>
								<th className="py-3 px-3 text-center">Huruf</th>
								<th className="py-3 px-4 text-center">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/80">
							{students.map((mhs) => (
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

									{/* Kehadiran */}
									<td className="py-2.5 px-2 text-center">
										<input
											type="number"
											min={0}
											max={100}
											value={mhs.kehadiran}
											onChange={(e) =>
												handleScoreChange(
													mhs.nim,
													"kehadiran",
													Number(e.target.value),
												)
											}
											className="w-16 text-center py-1.5 px-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-[#75834a] bg-white tabular-nums"
										/>
									</td>

									{/* Tugas */}
									<td className="py-2.5 px-2 text-center">
										<input
											type="number"
											min={0}
											max={100}
											value={mhs.tugas}
											onChange={(e) =>
												handleScoreChange(
													mhs.nim,
													"tugas",
													Number(e.target.value),
												)
											}
											className="w-16 text-center py-1.5 px-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-[#75834a] bg-white tabular-nums"
										/>
									</td>

									{/* UTS */}
									<td className="py-2.5 px-2 text-center">
										<input
											type="number"
											min={0}
											max={100}
											value={mhs.uts}
											onChange={(e) =>
												handleScoreChange(
													mhs.nim,
													"uts",
													Number(e.target.value),
												)
											}
											className="w-16 text-center py-1.5 px-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-[#75834a] bg-white tabular-nums"
										/>
									</td>

									{/* UAS */}
									<td className="py-2.5 px-2 text-center">
										<input
											type="number"
											min={0}
											max={100}
											value={mhs.uas}
											onChange={(e) =>
												handleScoreChange(
													mhs.nim,
													"uas",
													Number(e.target.value),
												)
											}
											className="w-16 text-center py-1.5 px-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-[#75834a] bg-white tabular-nums"
										/>
									</td>

									{/* Nilai Akhir (Calculated) */}
									<td className="py-3 px-3 text-center font-bold text-slate-900 tabular-nums">
										{mhs.nilaiAkhir}
									</td>

									{/* Nilai Huruf */}
									<td className="py-3 px-3 text-center font-bold">
										<span
											className={`inline-block px-2 py-0.5 rounded-md text-xs ${
												mhs.nilaiHuruf.startsWith("A")
													? "bg-emerald-100 text-emerald-800"
													: mhs.nilaiHuruf.startsWith("B")
														? "bg-sky-100 text-sky-800"
														: "bg-amber-100 text-amber-800"
											}`}
										>
											{mhs.nilaiHuruf}
										</span>
									</td>

									{/* Status */}
									<td className="py-3 px-4 text-center">
										<Badge
											variant={mhs.status === "Final" ? "success" : "warning"}
										>
											{mhs.status}
										</Badge>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};
