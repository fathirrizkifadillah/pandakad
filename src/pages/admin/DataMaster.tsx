import { BookOpen, Building2, Layers, Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockKatalogMatkul } from "../../mock/academicData";

export const DataMaster: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"matkul" | "prodi" | "ruang">(
		"matkul",
	);

	const prodiList = [
		{
			kode: "TI",
			nama: "S1 Teknik Informatika",
			jenjang: "S1",
			akreditasi: "Unggul",
			mhs: 640,
		},
		{
			kode: "SI",
			nama: "S1 Sistem Informasi",
			jenjang: "S1",
			akreditasi: "Baik Sekali",
			mhs: 380,
		},
		{
			kode: "TE",
			nama: "S1 Teknik Elektro",
			jenjang: "S1",
			akreditasi: "Baik Sekali",
			mhs: 190,
		},
		{
			kode: "MN",
			nama: "S1 Manajemen Bisnis Digital",
			jenjang: "S1",
			akreditasi: "Unggul",
			mhs: 210,
		},
	];

	const ruangList = [
		{
			kode: "LAB-AI",
			nama: "Lab Artificial Intelligence 302",
			kapasitas: 40,
			tipe: "Laboratorium Komputer",
		},
		{
			kode: "LAB-NET",
			nama: "Lab Jaringan Komputer 401",
			kapasitas: 40,
			tipe: "Laboratorium Hardware",
		},
		{
			kode: "G-A101",
			nama: "Ruang Teori Gedung A 101",
			kapasitas: 50,
			tipe: "Ruang Kuliah Teori",
		},
		{
			kode: "G-B204",
			nama: "Ruang Teori Gedung B 204",
			kapasitas: 60,
			tipe: "Ruang Kuliah Teori",
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Data Master Akademik
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Konfigurasi basis data program studi, kurikulum mata kuliah,
						fasilitas ruang, dan rombongan belajar.
					</p>
				</div>

				<Button
					variant="primary"
					size="sm"
					onClick={() => alert("Form modal tambah data master siap!")}
					leftIcon={<Plus className="w-4 h-4" />}
				>
					Tambah Data
				</Button>
			</div>

			{/* Tabs */}
			<div className="flex items-center gap-2 border-b border-slate-200">
				{[
					{ id: "matkul" as const, label: "Mata Kuliah", icon: BookOpen },
					{ id: "prodi" as const, label: "Program Studi", icon: Layers },
					{ id: "ruang" as const, label: "Ruang Kuliah", icon: Building2 },
				].map((t) => {
					const Icon = t.icon;
					const isActive = activeTab === t.id;
					return (
						<button
							key={t.id}
							type="button"
							onClick={() => setActiveTab(t.id)}
							className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
								isActive
									? "border-[#75834a] text-[#566432]"
									: "border-transparent text-slate-500 hover:text-slate-800"
							}`}
						>
							<Icon className="w-4 h-4" />
							{t.label}
						</button>
					);
				})}
			</div>

			{/* Mata Kuliah Tab */}
			{activeTab === "matkul" && (
				<Card padded={false} className="overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse text-xs sm:text-sm">
							<thead>
								<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
									<th className="py-3 px-4">Kode & Mata Kuliah</th>
									<th className="py-3 px-3">SKS</th>
									<th className="py-3 px-3">Semester</th>
									<th className="py-3 px-3">Dosen Koordinator</th>
									<th className="py-3 px-3">Kategori</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200/80">
								{mockKatalogMatkul.map((mk) => (
									<tr
										key={mk.id}
										className="hover:bg-slate-50/80 transition-colors"
									>
										<td className="py-3.5 px-4">
											<span className="font-bold text-slate-900 block">
												{mk.nama}
											</span>
											<span className="font-mono text-slate-500 text-[11px]">
												{mk.kode}
											</span>
										</td>
										<td className="py-3.5 px-3 font-semibold text-slate-800">
											{mk.sks} SKS
										</td>
										<td className="py-3.5 px-3 text-slate-600">
											Semester {mk.semester}
										</td>
										<td className="py-3.5 px-3 text-slate-700">{mk.dosen}</td>
										<td className="py-3.5 px-3">
											<Badge
												variant={mk.kategori === "Wajib" ? "olive" : "gold"}
											>
												{mk.kategori}
											</Badge>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			)}

			{/* Program Studi Tab */}
			{activeTab === "prodi" && (
				<Card padded={false} className="overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse text-xs sm:text-sm">
							<thead>
								<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
									<th className="py-3 px-4">Kode & Nama Program Studi</th>
									<th className="py-3 px-3">Jenjang</th>
									<th className="py-3 px-3">Akreditasi BAN-PT</th>
									<th className="py-3 px-3">Total Mahasiswa</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200/80">
								{prodiList.map((p) => (
									<tr
										key={p.kode}
										className="hover:bg-slate-50/80 transition-colors"
									>
										<td className="py-3.5 px-4 font-bold text-slate-900">
											{p.nama} ({p.kode})
										</td>
										<td className="py-3.5 px-3 font-semibold text-slate-700">
											{p.jenjang}
										</td>
										<td className="py-3.5 px-3">
											<Badge variant="success">{p.akreditasi}</Badge>
										</td>
										<td className="py-3.5 px-3 font-semibold text-[#75834a]">
											{p.mhs} Mahasiswa
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			)}

			{/* Ruangan Tab */}
			{activeTab === "ruang" && (
				<Card padded={false} className="overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse text-xs sm:text-sm">
							<thead>
								<tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
									<th className="py-3 px-4">Kode & Nama Ruangan</th>
									<th className="py-3 px-3">Tipe Ruang</th>
									<th className="py-3 px-3">Kapasitas</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200/80">
								{ruangList.map((r) => (
									<tr
										key={r.kode}
										className="hover:bg-slate-50/80 transition-colors"
									>
										<td className="py-3.5 px-4">
											<span className="font-bold text-slate-900 block">
												{r.nama}
											</span>
											<span className="font-mono text-slate-500 text-[11px]">
												{r.kode}
											</span>
										</td>
										<td className="py-3.5 px-3 text-slate-700">{r.tipe}</td>
										<td className="py-3.5 px-3 font-semibold text-slate-800">
											{r.kapasitas} Kursi
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Card>
			)}
		</div>
	);
};
