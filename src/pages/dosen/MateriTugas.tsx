import { Download, FileText, Trash2, Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export const MateriTugas: React.FC = () => {
	const [items, setItems] = useState([
		{
			id: "mat_01",
			title: "RPS (Rencana Pembelajaran Semester) AI & Machine Learning",
			type: "RPS",
			date: "10 Agustus 2026",
			size: "1.2 MB",
			downloads: 42,
		},
		{
			id: "mat_02",
			title: "Slide Pertemuan 1 - Konsep Dasar Heuristic & Search Algorithm",
			type: "Materi",
			date: "02 September 2026",
			size: "4.8 MB",
			downloads: 38,
		},
		{
			id: "mat_03",
			title: "Tugas 1 - Implementasi Algoritma A* Search dengan Python",
			type: "Tugas",
			date: "09 September 2026",
			size: "720 KB",
			downloads: 36,
		},
	]);

	const handleUpload = () => {
		const title = prompt("Masukkan judul materi atau tugas baru:");
		if (!title) return;
		setItems([
			...items,
			{
				id: `mat_${Date.now()}`,
				title,
				type: "Materi",
				date: "Hari ini",
				size: "2.5 MB",
				downloads: 0,
			},
		]);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Materi Kuliah & Tugas Mahasiswa
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Unggah modul ajar, slide presentasi, RPS, dan lembar tugas
						praktikum.
					</p>
				</div>

				<Button
					variant="primary"
					size="sm"
					onClick={handleUpload}
					leftIcon={<Upload className="w-4 h-4" />}
				>
					Unggah Materi Baru
				</Button>
			</div>

			<div className="space-y-3">
				{items.map((item) => (
					<Card key={item.id} className="hover:shadow-sm transition-shadow">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div className="flex items-start gap-3">
								<div className="p-2.5 rounded-xl bg-[#75834a]/10 text-[#566432] shrink-0 mt-0.5">
									<FileText className="w-5 h-5" />
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<Badge
											variant={item.type === "Tugas" ? "warning" : "olive"}
										>
											{item.type}
										</Badge>
										<span className="text-xs text-slate-400">
											• Diunggah {item.date}
										</span>
										<span className="text-xs text-slate-400">
											• {item.size}
										</span>
									</div>
									<h4 className="font-bold text-base text-slate-900">
										{item.title}
									</h4>
									<p className="text-xs text-slate-500 mt-0.5">
										{item.downloads} mahasiswa telah mengunduh berkas ini.
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 self-end sm:self-center">
								<Button
									size="sm"
									variant="outline"
									onClick={() => alert(`Mengunduh berkas: ${item.title}`)}
									leftIcon={<Download className="w-3.5 h-3.5" />}
								>
									Unduh
								</Button>
								<button
									type="button"
									onClick={() =>
										setItems(items.filter((i) => i.id !== item.id))
									}
									className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
									title="Hapus berkas"
									aria-label="Hapus materi"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};
