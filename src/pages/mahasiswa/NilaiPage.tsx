import { Download } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockNilaiSemester, mockUsers } from "../../mock/academicData";
import { studentApi } from "../../services/api/student";
import type { NilaiSemesterItem } from "../../types";

export const NilaiPage: React.FC = () => {
	const [selectedSemester, setSelectedSemester] = useState("4");
	const [activeTab, setActiveTab] = useState<"khs" | "transkrip">("khs");
	const [khsData, setKhsData] = useState<{
		grades: NilaiSemesterItem[];
		ips: number;
		maxSksNextTerm: number;
	}>({
		grades: mockNilaiSemester,
		ips: 3.85,
		maxSksNextTerm: 24,
	});
	const [transcriptData, setTranscriptData] = useState<{
		grades: NilaiSemesterItem[];
		ipk: number;
		totalSksPassed: number;
	}>({
		grades: mockNilaiSemester,
		ipk: 3.84,
		totalSksPassed: 84,
	});

	const student = mockUsers.Mahasiswa;

	// Muat data KHS dan Transkrip dari API backend
	useEffect(() => {
		const loadGrades = async () => {
			try {
				const [khs, trans] = await Promise.all([
					studentApi.getMyKhs(),
					studentApi.getMyTranscript(),
				]);
				if (khs && khs.grades.length > 0) {
					setKhsData(khs);
				}
				if (trans && trans.grades.length > 0) {
					setTranscriptData(trans);
				}
			} catch {
				// Gunakan data mock jika backend offline
			}
		};
		loadGrades();
	}, []);

	const currentGrades =
		activeTab === "khs" ? khsData.grades : transcriptData.grades;

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Hasil Studi & Transkrip Akademik
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Rekapitulasi nilai mata kuliah, Kartu Hasil Studi (KHS), dan
						Transkrip Kumulatif.
					</p>
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						alert("Kartu Hasil Studi (KHS) berhasil diunduh dalam format PDF!")
					}
					leftIcon={<Download className="w-4 h-4" />}
				>
					Cetak KHS
				</Button>
			</div>

			{/* Overview Metric Banner */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Card className="bg-gradient-to-br from-[#75834a]/10 to-transparent">
					<span className="text-xs font-semibold text-slate-500 uppercase">
						IP Semester (KHS Smt 4)
					</span>
					<div className="mt-1 flex items-baseline gap-2">
						<span className="text-3xl font-extrabold text-slate-900 tabular-nums">
							{khsData.ips.toFixed(2)}
						</span>
						<span className="text-xs text-emerald-600 font-semibold">
							Sangat Memuaskan
						</span>
					</div>
					<p className="text-[11px] text-slate-500 mt-1">
						Batas SKS semester depan: {khsData.maxSksNextTerm} SKS
					</p>
				</Card>

				<Card className="bg-gradient-to-br from-[#d2ae54]/15 to-transparent">
					<span className="text-xs font-semibold text-slate-500 uppercase">
						IPK (Indeks Prestasi Kumulatif)
					</span>
					<div className="mt-1 flex items-baseline gap-2">
						<span className="text-3xl font-extrabold text-[#967727] tabular-nums">
							{transcriptData.ipk.toFixed(2)}
						</span>
						<span className="text-xs text-[#967727] font-semibold">
							Predikat: Cumlaude
						</span>
					</div>
					<p className="text-[11px] text-slate-500 mt-1">
						Kalkulasi {transcriptData.totalSksPassed} SKS kumulatif
					</p>
				</Card>

				<Card>
					<span className="text-xs font-semibold text-slate-500 uppercase">
						SKS Selesai / Wajib
					</span>
					<div className="mt-1 flex items-baseline gap-2">
						<span className="text-3xl font-extrabold text-slate-900 tabular-nums">
							{transcriptData.totalSksPassed}
						</span>
						<span className="text-xs text-slate-500">/ 144 SKS</span>
					</div>
					<p className="text-[11px] text-slate-500 mt-1">
						Sisa {Math.max(0, 144 - transcriptData.totalSksPassed)} SKS (± 3
						semester lagi)
					</p>
				</Card>
			</div>

			{/* Tabs: KHS vs Transkrip */}
			<div className="flex items-center gap-2 border-b border-slate-200">
				<button
					type="button"
					onClick={() => setActiveTab("khs")}
					className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
						activeTab === "khs"
							? "border-[#75834a] text-[#566432]"
							: "border-transparent text-slate-500 hover:text-slate-800"
					}`}
				>
					Kartu Hasil Studi (KHS)
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("transkrip")}
					className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
						activeTab === "transkrip"
							? "border-[#75834a] text-[#566432]"
							: "border-transparent text-slate-500 hover:text-slate-800"
					}`}
				>
					Transkrip Kumulatif
				</button>
			</div>

			{/* Semester Picker for KHS */}
			{activeTab === "khs" && (
				<div className="flex items-center gap-3">
					<label
						htmlFor="semester-select"
						className="text-xs font-semibold text-slate-700"
					>
						Pilih Semester:
					</label>
					<select
						id="semester-select"
						value={selectedSemester}
						onChange={(e) => setSelectedSemester(e.target.value)}
						className="text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-[#75834a]"
					>
						<option value="4">Semester 4 (Genap 2025/2026)</option>
						<option value="3">Semester 3 (Ganjil 2025/2026)</option>
						<option value="2">Semester 2 (Genap 2024/2025)</option>
						<option value="1">Semester 1 (Ganjil 2024/2025)</option>
					</select>
				</div>
			)}

			{/* Grades Table */}
			<Card padded={false} className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
								<th className="py-3 px-3 text-center">No</th>
								<th className="py-3 px-3">Kode</th>
								<th className="py-3 px-4">Mata Kuliah</th>
								<th className="py-3 px-3 text-center">SKS</th>
								<th className="py-3 px-3 text-center">Tugas</th>
								<th className="py-3 px-3 text-center">UTS</th>
								<th className="py-3 px-3 text-center">UAS</th>
								<th className="py-3 px-3 text-center">Nilai Akhir</th>
								<th className="py-3 px-3 text-center">Huruf</th>
								<th className="py-3 px-3 text-center">Bobot</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/80">
							{currentGrades.map((item) => (
								<tr
									key={item.kode}
									className="hover:bg-slate-50/80 transition-colors"
								>
									<td className="py-3 px-3 text-center text-slate-400 font-mono">
										{item.no}
									</td>
									<td className="py-3 px-3 font-mono text-slate-600">
										{item.kode}
									</td>
									<td className="py-3 px-4 font-bold text-slate-900">
										{item.matkul}
									</td>
									<td className="py-3 px-3 text-center font-semibold text-slate-800">
										{item.sks}
									</td>
									<td className="py-3 px-3 text-center tabular-nums text-slate-700">
										{item.nilaiTugas}
									</td>
									<td className="py-3 px-3 text-center tabular-nums text-slate-700">
										{item.nilaiUTS}
									</td>
									<td className="py-3 px-3 text-center tabular-nums text-slate-700">
										{item.nilaiUAS}
									</td>
									<td className="py-3 px-3 text-center tabular-nums font-bold text-slate-900">
										{item.nilaiAkhir}
									</td>
									<td className="py-3 px-3 text-center font-bold">
										<span
											className={`inline-block px-2 py-0.5 rounded-md text-xs ${
												item.nilaiHuruf.startsWith("A")
													? "bg-emerald-100 text-emerald-800"
													: "bg-amber-100 text-amber-800"
											}`}
										>
											{item.nilaiHuruf}
										</span>
									</td>
									<td className="py-3 px-3 text-center tabular-nums font-semibold text-slate-800">
										{item.bobot.toFixed(1)}
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
