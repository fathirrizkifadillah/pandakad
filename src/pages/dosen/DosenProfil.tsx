import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockUsers } from "../../mock/academicData";
import { authApi } from "../../services/api/auth.js";
import { lecturerApi } from "../../services/api/lecturer.js";

export const DosenProfil: React.FC = () => {
	const defaultLecturer = mockUsers.Dosen;
	const [lecturer, setLecturer] = useState({
		name: defaultLecturer.name,
		identifier: defaultLecturer.identifier,
		email: defaultLecturer.email,
		prodi: defaultLecturer.prodi,
		title: "Lektor Kepala",
		totalSks: 12,
		adviseesCount: 24,
	});

	useEffect(() => {
		let isMounted = true;
		Promise.all([authApi.getMe(), lecturerApi.getLecturerDashboard()])
			.then(([meRes, dashRes]) => {
				if (!isMounted) return;
				const user = meRes?.user;
				const lecturerProfile = user?.lecturerProfile;
				const stats = dashRes?.stats;

				setLecturer((prev) => ({
					...prev,
					name: user?.name || prev.name,
					identifier: lecturerProfile?.nidn || prev.identifier,
					email: user?.email || prev.email,
					prodi:
						lecturerProfile?.studyProgram?.name ||
						dashRes?.lecturer?.prodiName ||
						prev.prodi,
					title: lecturerProfile?.title || prev.title,
					totalSks: stats?.totalSks ?? prev.totalSks,
					adviseesCount:
						dashRes?.advisees?.length ??
						stats?.pendingKrsCount ??
						prev.adviseesCount,
				}));
			})
			.catch(() => {
				// Keep fallback
			});

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			<div>
				<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
					Profil Tenaga Pendidik / Dosen
				</h2>
				<p className="text-xs text-slate-500 mt-1">
					Biodata akademik, Nomor Induk Dosen Nasional (NIDN), dan status
					fungsional.
				</p>
			</div>

			<Card className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
				<div className="w-24 h-24 rounded-2xl bg-[#75834a]/15 text-[#566432] border-2 border-[#75834a]/30 flex items-center justify-center font-extrabold text-3xl shrink-0">
					{lecturer.name.charAt(4) || "D"}
				</div>

				<div className="flex-1 text-center sm:text-left space-y-2">
					<div className="flex flex-col sm:flex-row sm:items-center gap-2">
						<h3 className="text-xl font-bold text-slate-900">
							{lecturer.name}
						</h3>
						<Badge variant="success">Status: Dosen Tetap Aktif</Badge>
					</div>
					<p className="text-sm text-slate-600">
						NIDN:{" "}
						<span className="font-mono font-semibold">
							{lecturer.identifier}
						</span>{" "}
						• Jabatan Fungsional:{" "}
						<span className="font-semibold">{lecturer.title}</span>
					</p>
					<p className="text-xs text-slate-500">
						Homebase Prodi:{" "}
						<span className="font-semibold text-slate-800">
							{lecturer.prodi}
						</span>
					</p>
				</div>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<h4 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
						Data Kepegawaian & Akademik
					</h4>
					<dl className="space-y-3 text-xs sm:text-sm">
						<div className="flex justify-between">
							<dt className="text-slate-500">Pendidikan Terakhir</dt>
							<dd className="font-semibold text-slate-900">
								S3 Ilmu Komputer (Dr.)
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-slate-500">Bidang Keahlian</dt>
							<dd className="font-semibold text-slate-900">
								Artificial Intelligence & Data Mining
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-slate-500">Beban Mengajar (BKD)</dt>
							<dd className="font-bold text-[#75834a]">
								{lecturer.totalSks} SKS (Memenuhi Syarat)
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-slate-500">Mahasiswa Bimbingan Akademik</dt>
							<dd className="font-semibold text-slate-900">
								{lecturer.adviseesCount} Mahasiswa
							</dd>
						</div>
					</dl>
				</Card>

				<Card>
					<h4 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
						Akun & Akses Sistem
					</h4>
					<dl className="space-y-3 text-xs sm:text-sm">
						<div className="flex justify-between">
							<dt className="text-slate-500">Email Institusi</dt>
							<dd className="font-mono text-slate-800 text-xs">
								{lecturer.email}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-slate-500">No. WhatsApp</dt>
							<dd className="text-slate-800">+62 811-9876-5432</dd>
						</div>
						<div className="flex justify-between items-center pt-2">
							<dt className="text-slate-500">Keamanan Akun</dt>
							<dd>
								<Button
									size="sm"
									variant="outline"
									onClick={() => alert("Fitur ganti kata sandi siap!")}
								>
									Ubah Kata Sandi
								</Button>
							</dd>
						</div>
					</dl>
				</Card>
			</div>
		</div>
	);
};
