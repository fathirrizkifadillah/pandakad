import { Save } from "lucide-react";
import type React from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export const Pengaturan: React.FC = () => {
	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			<div>
				<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
					Pengaturan Sistem & Profil Institusi
				</h2>
				<p className="text-xs text-slate-500 mt-1">
					Identitas kampus Universitas Pandanaran (UNPANDA), konfigurasi portal,
					dan keamanan.
				</p>
			</div>

			<Card>
				<div className="flex items-center gap-4 pb-6 border-b border-slate-100">
					<img
						src="/assets/logo_unpanda.png"
						alt="Logo UNPANDA"
						className="w-16 h-16 object-contain p-1 border border-slate-200 rounded-2xl bg-white shadow-xs"
					/>
					<div>
						<h3 className="font-extrabold text-lg text-slate-900">
							Universitas Pandanaran (UNPANDA)
						</h3>
						<p className="text-xs text-slate-500">
							Kode Perguruan Tinggi:{" "}
							<span className="font-mono font-semibold">061032</span> •
							Akreditasi BAN-PT: Baik Sekali
						</p>
						<button
							type="button"
							onClick={() => alert("Fitur unggah logo baru!")}
							className="text-xs text-[#75834a] font-semibold hover:underline mt-1 inline-block"
						>
							Ganti Logo Institusi
						</button>
					</div>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						alert("Pengaturan institusi berhasil disimpan! 🐼💾");
					}}
					className="mt-6 space-y-4 text-xs sm:text-sm"
				>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="univ-name"
								className="block text-xs font-semibold text-slate-700 mb-1"
							>
								Nama Resmi Perguruan Tinggi
							</label>
							<input
								id="univ-name"
								type="text"
								defaultValue="Universitas Pandanaran"
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-[#75834a]"
							/>
						</div>
						<div>
							<label
								htmlFor="univ-short"
								className="block text-xs font-semibold text-slate-700 mb-1"
							>
								Singkatan Kampus
							</label>
							<input
								id="univ-short"
								type="text"
								defaultValue="UNPANDA"
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-[#75834a]"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="univ-email"
								className="block text-xs font-semibold text-slate-700 mb-1"
							>
								Email Resmi Rektorat / BAAK
							</label>
							<input
								id="univ-email"
								type="email"
								defaultValue="baak@unpanda.ac.id"
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-[#75834a]"
							/>
						</div>
						<div>
							<label
								htmlFor="univ-phone"
								className="block text-xs font-semibold text-slate-700 mb-1"
							>
								Kontak Telepon / Call Center
							</label>
							<input
								id="univ-phone"
								type="text"
								defaultValue="(024) 844-5566"
								className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-[#75834a]"
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="univ-address"
							className="block text-xs font-semibold text-slate-700 mb-1"
						>
							Alamat Kampus Terpadu
						</label>
						<textarea
							id="univ-address"
							rows={2}
							defaultValue="Jl. Pandanaran No. 100, Kota Semarang, Jawa Tengah 50241"
							className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-[#75834a]"
						/>
					</div>

					<div className="pt-2 flex justify-end">
						<Button
							type="submit"
							variant="primary"
							leftIcon={<Save className="w-4 h-4" />}
						>
							Simpan Perubahan
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
};
