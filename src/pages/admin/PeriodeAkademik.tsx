import { CalendarRange, CheckCircle, Lock, Plus, Unlock } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockPeriodeAkademik } from "../../mock/academicData";
import { adminApi } from "../../services/api/admin.js";
import type { PeriodeAkademik as PeriodeType } from "../../types";

export const PeriodeAkademik: React.FC = () => {
	const [periodes, setPeriodes] = useState<PeriodeType[]>(mockPeriodeAkademik);
	const [toast, setToast] = useState<string | null>(null);

	const loadTerms = useCallback(() => {
		adminApi
			.getAcademicTerms()
			.then((terms) => {
				if (terms && terms.length > 0) {
					setPeriodes(terms);
				}
			})
			.catch(() => {
				// Keep fallback
			});
	}, []);

	useEffect(() => {
		loadTerms();
	}, [loadTerms]);

	const toggleStatus = async (id: string) => {
		const target = periodes.find((p) => p.id === id);
		if (!target) return;

		const nextStatus = target.status === "Aktif" ? "Ditutup" : "Aktif";

		try {
			if (nextStatus === "Aktif") {
				await adminApi.activateTerm(id);
				loadTerms();
			} else {
				setPeriodes((prev) =>
					prev.map((p) => (p.id === id ? { ...p, status: "Ditutup" } : p)),
				);
			}
			setToast(
				`Status periode ${target.semester} ${target.tahun} diubah menjadi "${nextStatus}".`,
			);
		} catch {
			setPeriodes((prev) =>
				prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
			);
			setToast(
				`Status periode ${target.semester} ${target.tahun} diubah secara lokal.`,
			);
		} finally {
			setTimeout(() => setToast(null), 3500);
		}
	};

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
						Periode & Kalender Akademik
					</h2>
					<p className="text-xs text-slate-500 mt-1">
						Buka atau tutup periode pengisian KRS online, masa perkuliahan
						aktif, dan batas input nilai dosen.
					</p>
				</div>

				<Button
					variant="primary"
					size="sm"
					onClick={() => alert("Form pembukaan semester baru siap!")}
					leftIcon={<Plus className="w-4 h-4" />}
				>
					Buka Periode Baru
				</Button>
			</div>

			<div className="space-y-4">
				{periodes.map((p) => (
					<Card key={p.id} className="hover:shadow-sm transition-shadow">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
							<div className="flex items-center gap-3">
								<div className="p-3 rounded-xl bg-[#75834a]/10 text-[#566432]">
									<CalendarRange className="w-6 h-6" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h3 className="font-bold text-lg text-slate-900">
											Semester {p.semester} {p.tahun}
										</h3>
										<Badge
											variant={p.status === "Aktif" ? "success" : "neutral"}
										>
											{p.status}
										</Badge>
									</div>
									<p className="text-xs text-slate-500">
										Tahun Ajaran Resmi UNPANDA
									</p>
								</div>
							</div>

							<Button
								variant={p.status === "Aktif" ? "outline" : "primary"}
								size="sm"
								onClick={() => toggleStatus(p.id)}
								leftIcon={
									p.status === "Aktif" ? (
										<Lock className="w-3.5 h-3.5" />
									) : (
										<Unlock className="w-3.5 h-3.5" />
									)
								}
							>
								{p.status === "Aktif"
									? "Kunci & Tutup Periode"
									: "Aktifkan Periode"}
							</Button>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
							<div className="p-3 bg-slate-50 rounded-lg">
								<span className="text-slate-500 font-medium block mb-1">
									Masa Pengisian KRS
								</span>
								<span className="font-semibold text-slate-800">
									{p.krsMulai} - {p.krsSelesai}
								</span>
							</div>
							<div className="p-3 bg-slate-50 rounded-lg">
								<span className="text-slate-500 font-medium block mb-1">
									Masa Perkuliahan
								</span>
								<span className="font-semibold text-slate-800">
									{p.kuliahMulai} - {p.kuliahSelesai}
								</span>
							</div>
							<div className="p-3 bg-slate-50 rounded-lg">
								<span className="text-slate-500 font-medium block mb-1">
									Masa Input Nilai Dosen
								</span>
								<span className="font-semibold text-slate-800">
									{p.nilaiMulai} - {p.nilaiSelesai}
								</span>
							</div>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};
