import { Plus, Send, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PandaMascot } from "../../components/ui/PandaMascot";
import {
	initialMahasiswaKRS,
	mockKatalogMatkul,
	mockUsers,
} from "../../mock/academicData";
import type { KRSItem, MataKuliah } from "../../types";

export const KRSPage: React.FC = () => {
	const [selectedKRS, setSelectedKRS] =
		useState<KRSItem[]>(initialMahasiswaKRS);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [toastMessage, setToastMessage] = useState<string | null>(null);

	const student = mockUsers.Mahasiswa;
	const maxSKS = 24;
	const totalSKS = selectedKRS.reduce((sum, item) => sum + item.sks, 0);

	const showToast = (msg: string) => {
		setToastMessage(msg);
		setTimeout(() => setToastMessage(null), 4000);
	};

	const handleAddCourse = (course: MataKuliah) => {
		if (selectedKRS.some((item) => item.id === course.id)) {
			showToast(`Matkul ${course.nama} sudah ada di KRS kamu!`);
			return;
		}
		if (totalSKS + course.sks > maxSKS) {
			showToast(
				`Waduh, jatah SKS kamu cuma ${maxSKS} SKS! Kurangi matkul lain dulu ya 🐼`,
			);
			return;
		}

		const newItem: KRSItem = {
			...course,
			status: "Draft",
			tanggalDipilih: "Hari ini",
		};
		setSelectedKRS([...selectedKRS, newItem]);
		showToast(
			`Asyik! Matkul "${course.nama}" (+${course.sks} SKS) berhasil ditambahkan!`,
		);
	};

	const handleRemoveCourse = (courseId: string) => {
		const course = selectedKRS.find((c) => c.id === courseId);
		setSelectedKRS(selectedKRS.filter((item) => item.id !== courseId));
		if (course) {
			showToast(`Matkul "${course.nama}" telah dihapus dari KRS.`);
		}
	};

	const handleSubmitKRS = () => {
		if (selectedKRS.length === 0) {
			alert("Pilih minimal 1 mata kuliah sebelum mengajukan KRS!");
			return;
		}
		setIsSubmitted(true);
		setSelectedKRS(
			selectedKRS.map((item) => ({ ...item, status: "Menunggu Persetujuan" })),
		);
		showToast(
			"KRS berhasil diajukan ke Dosen Pembimbing Akademik (DPA)! Tinggal tunggu konfirmasi ya 🚀",
		);
	};

	// Filter available courses from catalog that are not yet selected
	const availableCourses = mockKatalogMatkul.filter(
		(course) => !selectedKRS.some((item) => item.id === course.id),
	);

	return (
		<div className="space-y-6">
			{/* Toast Notification */}
			{toastMessage && (
				<div className="fixed top-24 right-6 z-50 max-w-md bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in border border-slate-700">
					<span className="text-base">🐼</span>
					<p className="flex-1 font-medium">{toastMessage}</p>
				</div>
			)}

			{/* Header Info Banner */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="md:col-span-2 bg-gradient-to-r from-[#75834a]/10 via-amber-50/50 to-white">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<div className="flex items-center gap-2">
								<span className="text-xs font-bold text-[#566432] uppercase tracking-wider">
									Kartu Rencana Studi (KRS)
								</span>
								<Badge variant={isSubmitted ? "warning" : "olive"}>
									{isSubmitted
										? "Menunggu Persetujuan DPA"
										: "Periode Pengisian Aktif"}
								</Badge>
							</div>
							<h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
								Semester Ganjil 2026/2027
							</h2>
							<p className="text-xs text-slate-600 mt-1">
								Dosen Pembimbing Akademik:{" "}
								<span className="font-semibold">{student.dpa}</span>
							</p>
						</div>

						<Button
							variant="primary"
							onClick={handleSubmitKRS}
							leftIcon={<Send className="w-4 h-4" />}
						>
							{isSubmitted ? "KRS Telah Diajukan" : "Ajukan KRS ke DPA"}
						</Button>
					</div>
				</Card>

				{/* SKS Summary Card */}
				<Card>
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-slate-500 uppercase">
							Beban Kredit SKS
						</span>
						<span className="text-xs font-bold text-[#75834a]">
							Maksimal {maxSKS} SKS
						</span>
					</div>
					<div className="flex items-baseline gap-2">
						<span className="text-3xl font-extrabold text-slate-900 tabular-nums">
							{totalSKS}
						</span>
						<span className="text-sm font-medium text-slate-500">
							/ {maxSKS} SKS Terambil
						</span>
					</div>
					{/* Progress bar */}
					<div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
						<div
							className={`h-full transition-all duration-300 rounded-full ${
								totalSKS >= maxSKS ? "bg-amber-500" : "bg-[#75834a]"
							}`}
							style={{ width: `${Math.min(100, (totalSKS / maxSKS) * 100)}%` }}
						/>
					</div>
					<p className="text-[11px] text-slate-500 mt-2">
						{maxSKS - totalSKS > 0
							? `Masih tersisa jatah ${maxSKS - totalSKS} SKS lagi untuk semester ini.`
							: "Kapasitas maksimal SKS sudah terpenuhi penuh."}
					</p>
				</Card>
			</div>

			{/* Mascot note */}
			<PandaMascot
				message={`Kamu sudah memilih ${selectedKRS.length} mata kuliah (${totalSKS} SKS). Pastikan jadwal tidak bentrok dan konsultasikan dengan ${student.dpa} ya! 🐼`}
			/>

			{/* Selected Courses Table */}
			<Card padded={false} className="overflow-hidden">
				<div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
					<div>
						<h3 className="font-bold text-base text-slate-900">
							Mata Kuliah yang Dipilih ({selectedKRS.length})
						</h3>
						<p className="text-xs text-slate-500">
							Daftar mata kuliah yang masuk dalam rencana studi semester ini.
						</p>
					</div>
					<Badge variant="olive">{totalSKS} SKS Terpilih</Badge>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
								<th className="py-3 px-4">Kode & Mata Kuliah</th>
								<th className="py-3 px-3">SKS</th>
								<th className="py-3 px-3">Dosen Pengampu</th>
								<th className="py-3 px-3">Jadwal & Ruang</th>
								<th className="py-3 px-3">Status</th>
								<th className="py-3 px-4 text-center">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/80">
							{selectedKRS.length === 0 ? (
								<tr>
									<td colSpan={6} className="py-8 text-center text-slate-500">
										Belum ada mata kuliah yang dipilih. Tambahkan dari katalog
										di bawah.
									</td>
								</tr>
							) : (
								selectedKRS.map((mk) => (
									<tr
										key={mk.id}
										className="hover:bg-slate-50/80 transition-colors"
									>
										<td className="py-3.5 px-4">
											<span className="font-bold text-slate-900 block">
												{mk.nama}
											</span>
											<span className="text-[11px] font-mono text-slate-500">
												{mk.kode} • Semester {mk.semester} ({mk.kategori})
											</span>
										</td>
										<td className="py-3.5 px-3 font-semibold text-slate-800">
											{mk.sks} SKS
										</td>
										<td className="py-3.5 px-3 text-slate-700">{mk.dosen}</td>
										<td className="py-3.5 px-3">
											<div className="text-slate-800 font-medium">
												{mk.hari}, {mk.jam}
											</div>
											<div className="text-[11px] text-slate-500">
												{mk.ruang}
											</div>
										</td>
										<td className="py-3.5 px-3">
											<Badge
												variant={
													mk.status === "Disetujui"
														? "success"
														: mk.status === "Menunggu Persetujuan"
															? "warning"
															: "neutral"
												}
											>
												{mk.status}
											</Badge>
										</td>
										<td className="py-3.5 px-4 text-center">
											<button
												type="button"
												onClick={() => handleRemoveCourse(mk.id)}
												className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
												title="Hapus mata kuliah ini dari KRS"
												aria-label={`Hapus ${mk.nama}`}
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Card>

			{/* Available Courses in Catalog */}
			<Card padded={false} className="overflow-hidden">
				<div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
					<h3 className="font-bold text-base text-slate-900">
						Katalog Mata Kuliah Tersedia ({availableCourses.length})
					</h3>
					<p className="text-xs text-slate-500">
						Mata kuliah yang dapat kamu ambil untuk semester ini jika kuota
						masih tersedia.
					</p>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-xs sm:text-sm">
						<thead>
							<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
								<th className="py-3 px-4">Kode & Mata Kuliah</th>
								<th className="py-3 px-3">SKS</th>
								<th className="py-3 px-3">Dosen</th>
								<th className="py-3 px-3">Jadwal</th>
								<th className="py-3 px-3">Kuota</th>
								<th className="py-3 px-4 text-center">Pilih</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/80">
							{availableCourses.length === 0 ? (
								<tr>
									<td colSpan={6} className="py-8 text-center text-slate-500">
										Semua mata kuliah yang tersedia sudah kamu masukkan ke dalam
										KRS!
									</td>
								</tr>
							) : (
								availableCourses.map((mk) => (
									<tr
										key={mk.id}
										className="hover:bg-slate-50/80 transition-colors"
									>
										<td className="py-3.5 px-4">
											<span className="font-bold text-slate-900 block">
												{mk.nama}
											</span>
											<span className="text-[11px] font-mono text-slate-500">
												{mk.kode} • {mk.kategori}
											</span>
										</td>
										<td className="py-3.5 px-3 font-semibold text-slate-800">
											{mk.sks} SKS
										</td>
										<td className="py-3.5 px-3 text-slate-700">{mk.dosen}</td>
										<td className="py-3.5 px-3 text-slate-700">
											{mk.hari}, {mk.jam} ({mk.ruang})
										</td>
										<td className="py-3.5 px-3">
											<span className="text-slate-800 font-medium">
												{mk.terisi} / {mk.kuota}
											</span>
										</td>
										<td className="py-3.5 px-4 text-center">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleAddCourse(mk)}
												leftIcon={<Plus className="w-3.5 h-3.5" />}
												disabled={totalSKS + mk.sks > maxSKS}
											>
												Ambil
											</Button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};
