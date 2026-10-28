import { Download } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export const Laporan: React.FC = () => {
	const reports = [
		{
			title: "Laporan Rata-rata IPK Mahasiswa per Program Studi",
			category: "Prestasi Akademik",
			date: "Agustus 2026",
			format: "PDF / Excel",
			stat: "Rata-rata Kampus: 3.42",
		},
		{
			title: "Rekapitulasi Pengisian KRS Online Mahasiswa",
			category: "Operasional Perkuliahan",
			date: "Agustus 2026",
			format: "Excel (.xlsx)",
			stat: "98.2% Telah Mengisi",
		},
		{
			title: "Laporan Tingkat Kehadiran & Presensi Kuliah",
			category: "Monitoring Pembelajaran",
			date: "Semester Genap Lalu",
			format: "PDF (.pdf)",
			stat: "Rata-rata Presensi: 92.4%",
		},
		{
			title: "Daftar Calon Yudisium & Kelulusan Periode I",
			category: "Kelulusan",
			date: "Juli 2026",
			format: "PDF Resmi",
			stat: "184 Calon Wisudawan",
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
						Laporan & Ekspor Data Akademik
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Unduh laporan rekapitulasi nilai, statistik IPK, data kelulusan, dan
						audit kehadiran.
					</p>
				</div>

				<Button
					variant="primary"
					size="sm"
					onClick={() =>
						alert("Seluruh laporan akademik siap diunduh dalam arsip ZIP!")
					}
					leftIcon={<Download className="w-4 h-4" />}
				>
					Unduh Semua Laporan (ZIP)
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{reports.map((r) => (
					<Card
						key={r.title}
						className="hover:shadow-md transition-shadow flex flex-col justify-between"
					>
						<div>
							<div className="flex items-center justify-between mb-2">
								<Badge variant="olive">{r.category}</Badge>
								<span className="text-xs text-slate-400">{r.date}</span>
							</div>
							<h3 className="font-bold text-base text-slate-900 leading-snug">
								{r.title}
							</h3>
							<p className="text-xs font-semibold text-[#566432] mt-2">
								{r.stat}
							</p>
						</div>

						<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
							<span>Format: {r.format}</span>
							<Button
								size="sm"
								variant="outline"
								onClick={() => alert(`Mengunduh file: ${r.title}`)}
								leftIcon={<Download className="w-3.5 h-3.5" />}
							>
								Unduh
							</Button>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};
