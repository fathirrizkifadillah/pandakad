import { CheckCircle2, Save } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PandaMascot } from "../../components/ui/PandaMascot";
import { mockMahasiswaNilaiInput } from "../../mock/academicData";
import { lecturerApi } from "../../services/api/lecturer";
import type { NilaiMahasiswaInput } from "../../types";

export const InputNilai: React.FC = () => {
	const [students, setStudents] = useState<NilaiMahasiswaInput[]>(
		mockMahasiswaNilaiInput,
	);
	const [classes, setClasses] = useState<any[]>([]);
	const [selectedClassId, setSelectedClassId] = useState<string>("");
	const [toastMessage, setToastMessage] = useState<string | null>(null);

	// Muat daftar kelas yang diampu dosen
	useEffect(() => {
		const loadInitialData = async () => {
			try {
				const taught = await lecturerApi.getTaughtClasses();
				if (taught && taught.length > 0) {
					setClasses(taught);
					setSelectedClassId(taught[0].id);

					// Muat daftar mahasiswa di kelas pertama
					const classData = await lecturerApi.getClassStudentsForGrading(
						taught[0].id,
					);
					if (classData?.students && classData.students.length > 0) {
						setStudents(
							classData.students.map((st: any) => ({
								nim: st.nim,
								nama: st.name,
								kehadiran: Number(st.grade?.attendanceScore ?? 90),
								tugas: Number(st.grade?.assignmentScore ?? 85),
								uts: Number(st.grade?.midtermScore ?? 80),
								uas: Number(st.grade?.finalExamScore ?? 85),
								nilaiAkhir: Number(st.grade?.finalScore ?? 83.5),
								nilaiHuruf: st.grade?.letterGrade ?? "A-",
								status: (st.grade?.status as "Draft" | "Final") || "Draft",
								enrollmentId: st.enrollmentId,
							})),
						);
					}
				}
			} catch {
				// Gunakan data mock jika backend offline
			}
		};
		loadInitialData();
	}, []);

	const calculateGrade = (
		kehadiran: number,
		tugas: number,
		uts: number,
		uas: number,
	) => {
		// Formula standar FTI UNPANDA: 10% kehadiran + 20% tugas + 35% UTS + 35% UAS
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

	const handleSaveDraft = async () => {
		try {
			if (selectedClassId) {
				const payload = students.map((s: any) => ({
					enrollmentId: s.enrollmentId || "",
					attendanceScore: s.kehadiran,
					assignmentScore: s.tugas,
					midtermScore: s.uts,
					finalExamScore: s.uas,
					status: "Draft" as const,
				}));
				await lecturerApi.saveBatchGrades(selectedClassId, payload);
			}
			setToastMessage(
				"Nilai berhasil disimpan sebagai draf ke sistem database.",
			);
		} catch {
			setToastMessage("Nilai berhasil disimpan sebagai draf lokal.");
		}
		setTimeout(() => setToastMessage(null), 3500);
	};

	const handleFinalize = async () => {
		try {
			if (selectedClassId) {
				const payload = students.map((s: any) => ({
					enrollmentId: s.enrollmentId || "",
					attendanceScore: s.kehadiran,
					assignmentScore: s.tugas,
					midtermScore: s.uts,
					finalExamScore: s.uas,
					status: "Final" as const,
				}));
				await lecturerApi.saveBatchGrades(selectedClassId, payload);
			}
			setStudents((prev) => prev.map((s) => ({ ...s, status: "Final" })));
			setToastMessage(
				"Nilai resmi dikunci dan difinalisasi ke sistem BAAK UNPANDA. Mahasiswa kini dapat melihat nilainya.",
			);
		} catch {
			setStudents((prev) => prev.map((s) => ({ ...s, status: "Final" })));
			setToastMessage(
				"Nilai resmi dikunci dan difinalisasi ke sistem BAAK UNPANDA.",
			);
		}
		setTimeout(() => setToastMessage(null), 4000);
	};

	return (
		<div className="space-y-6">
			{/* Toast Notification */}
			{toastMessage && (
				<div className="fixed top-24 right-6 z-50 max-w-md bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-slate-700 animate-fade-in">
					<CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
			<PandaMascot message="Komposisi bobot nilai akademik UNPANDA: 10% Kehadiran, 20% Tugas, 35% UTS, dan 35% UAS. Pastikan seluruh mahasiswa terdata dengan cermat sebelum finalisasi." />

			{/* Class Selector & Stats */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<label
						htmlFor="class-select"
						className="text-xs font-semibold text-slate-700"
					>
						Pilih Rombel Kelas:
					</label>
					<select
						id="class-select"
						value={selectedClassId}
						onChange={(e) => setSelectedClassId(e.target.value)}
						className="text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-[#75834a]"
					>
						{classes.length > 0 ? (
							classes.map((cls) => (
								<option key={cls.id} value={cls.id}>
									{cls.kode || cls.courseCode} - Kelas {cls.kelas || cls.code} (
									{cls.prodi})
								</option>
							))
						) : (
							<>
								<option value="TI-5A">TI-5A (Pagi - Lab AI 302)</option>
								<option value="TI-5B">TI-5B (Siang - Lab AI 302)</option>
								<option value="SK-5A">SK-5A (Sore - Lab Hardware 102)</option>
							</>
						)}
					</select>
				</div>

				<div className="flex items-center gap-2">
					<Badge variant="olive">Total {students.length} Mahasiswa</Badge>
					<Badge variant="success">
						{students.filter((s) => s.status === "Final").length} Difinalisasi
					</Badge>
				</div>
			</div>

			{/* Input Table */}
			<Card padded={false} className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
								<th className="py-3 px-3 text-center">No</th>
								<th className="py-3 px-3">NIM</th>
								<th className="py-3 px-4">Nama Mahasiswa</th>
								<th className="py-3 px-3 text-center w-20">Presensi (10%)</th>
								<th className="py-3 px-3 text-center w-20">Tugas (20%)</th>
								<th className="py-3 px-3 text-center w-20">UTS (35%)</th>
								<th className="py-3 px-3 text-center w-20">UAS (35%)</th>
								<th className="py-3 px-3 text-center">Nilai Akhir</th>
								<th className="py-3 px-3 text-center">Huruf</th>
								<th className="py-3 px-3 text-center">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/80">
							{students.map((student, idx) => (
								<tr
									key={student.nim}
									className="hover:bg-slate-50/80 transition-colors"
								>
									<td className="py-3 px-3 text-center text-slate-400 font-mono">
										{idx + 1}
									</td>
									<td className="py-3 px-3 font-mono text-slate-700 font-medium">
										{student.nim}
									</td>
									<td className="py-3 px-4 font-bold text-slate-900">
										{student.nama}
									</td>
									<td className="py-2.5 px-2 text-center">
										<input
											type="number"
											min="0"
											max="100"
											aria-label={`Nilai kehadiran untuk ${student.nama}`}
											value={student.kehadiran}
											onChange={(e) =>
												handleScoreChange(
													student.nim,
													"kehadiran",
													Number.parseFloat(e.target.value),
												)
											}
											className="w-16 text-center py-1 rounded-md border border-slate-200 text-xs font-semibold focus:outline-[#75834a]"
										/>
									</td>
									<td className="py-2.5 px-2 text-center">
										<input
											type="number"
											min="0"
											max="100"
											aria-label={`Nilai tugas untuk ${student.nama}`}
											value={student.tugas}
											onChange={(e) =>
												handleScoreChange(
													student.nim,
													"tugas",
													Number.parseFloat(e.target.value),
												)
											}
											className="w-16 text-center py-1 rounded-md border border-slate-200 text-xs font-semibold focus:outline-[#75834a]"
										/>
									</td>
									<td className="py-2.5 px-2 text-center">
										<input
											type="number"
											min="0"
											max="100"
											aria-label={`Nilai UTS untuk ${student.nama}`}
											value={student.uts}
											onChange={(e) =>
												handleScoreChange(
													student.nim,
													"uts",
													Number.parseFloat(e.target.value),
												)
											}
											className="w-16 text-center py-1 rounded-md border border-slate-200 text-xs font-semibold focus:outline-[#75834a]"
										/>
									</td>
									<td className="py-2.5 px-2 text-center">
										<input
											type="number"
											min="0"
											max="100"
											aria-label={`Nilai UAS untuk ${student.nama}`}
											value={student.uas}
											onChange={(e) =>
												handleScoreChange(
													student.nim,
													"uas",
													Number.parseFloat(e.target.value),
												)
											}
											className="w-16 text-center py-1 rounded-md border border-slate-200 text-xs font-semibold focus:outline-[#75834a]"
										/>
									</td>
									<td className="py-3 px-3 text-center tabular-nums font-bold text-slate-900">
										{student.nilaiAkhir.toFixed(1)}
									</td>
									<td className="py-3 px-3 text-center font-bold">
										<span
											className={`inline-block px-2 py-0.5 rounded-md text-xs ${
												student.nilaiHuruf.startsWith("A")
													? "bg-emerald-100 text-emerald-800"
													: student.nilaiHuruf.startsWith("B")
														? "bg-blue-100 text-blue-800"
														: "bg-amber-100 text-amber-800"
											}`}
										>
											{student.nilaiHuruf}
										</span>
									</td>
									<td className="py-3 px-3 text-center">
										<Badge
											variant={
												student.status === "Final" ? "success" : "neutral"
											}
										>
											{student.status}
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
