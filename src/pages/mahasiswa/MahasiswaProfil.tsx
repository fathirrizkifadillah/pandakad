import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockUsers } from "../../mock/academicData";
import { studentApi } from "../../services/api/student";

export const MahasiswaProfil: React.FC = () => {
	const student = mockUsers.Mahasiswa;
	const [dashboardRes, setDashboardRes] = useState<any>(null);

	// Muat data profil dari backend API
	useEffect(() => {
		const loadProfile = async () => {
			try {
				const res = await studentApi.getStudentDashboard();
				if (res) {
					setDashboardRes(res);
				}
			} catch {
				// Gunakan data mock jika backend offline
			}
		};
		loadProfile();
	}, []);

	const currentStudent = dashboardRes?.student || student;
	const currentStats = dashboardRes?.stats;

	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			<div>
				<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
					Profil Mahasiswa
				</h2>
				<p className="text-xs text-slate-500 mt-1">
					Informasi data diri akademik, program studi, dan akun portal UNPANDA.
				</p>
			</div>

			<Card className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
				<div className="w-24 h-24 rounded-2xl bg-[#75834a]/15 text-[#566432] border-2 border-[#75834a]/30 flex items-center justify-center font-extrabold text-3xl shrink-0">
					{currentStudent.name.charAt(0)}
				</div>

				<div className="flex-1 text-center sm:text-left space-y-2">
					<div className="flex flex-col sm:flex-row sm:items-center gap-2">
						<h3 className="text-xl font-bold text-slate-900">
							{currentStudent.name}
						</h3>
						<Badge variant="success">Status: Aktif Kuliah</Badge>
					</div>
					<p className="text-sm text-slate-600">
						NIM:{" "}
						<span className="font-mono font-semibold">
							{currentStudent.nim || currentStudent.identifier}
						</span>{" "}
						• Program Studi:{" "}
						<span className="font-semibold">{currentStudent.prodi}</span>
					</p>
					<p className="text-xs text-slate-500">
						Dosen Pembimbing Akademik (DPA):{" "}
						<span className="font-semibold text-slate-800">
							{currentStudent.academicAdvisor || currentStudent.dpa}
						</span>
					</p>
				</div>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<h4 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
						Informasi Akademik
					</h4>
					<dl className="space-y-3 text-xs sm:text-sm">
						<div className="flex justify-between">
							<dt className="text-slate-500">Tahun Angkatan</dt>
							<dd className="font-semibold text-slate-900">
								{currentStudent.entryYear || 2022} /{" "}
								{(currentStudent.entryYear || 2022) + 1}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-slate-500">Semester Berjalan</dt>
							<dd className="font-semibold text-slate-900">
								Semester {currentStudent.currentSemester || 5} (Ganjil)
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-slate-500">IPK Kumulatif</dt>
							<dd className="font-bold text-[#75834a]">
								{currentStats?.gpa !== undefined
									? Number(currentStats.gpa).toFixed(2)
									: student.ipk}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-slate-500">Total SKS Diperoleh</dt>
							<dd className="font-semibold text-slate-900">
								{currentStats?.totalSksPassed ?? student.sksTotal} SKS
							</dd>
						</div>
					</dl>
				</Card>

				<Card>
					<h4 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
						Kontak & Keamanan
					</h4>
					<dl className="space-y-3 text-xs sm:text-sm">
						<div className="flex justify-between">
							<dt className="text-slate-500">Email Kampus</dt>
							<dd className="font-mono text-slate-800 text-xs">
								{currentStudent.email}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-slate-500">Nomor Telepon</dt>
							<dd className="text-slate-800">+62 812-3456-7890</dd>
						</div>
						<div className="flex justify-between items-center pt-2">
							<dt className="text-slate-500">Kata Sandi</dt>
							<dd>
								<Button
									size="sm"
									variant="outline"
									onClick={() => alert("Fitur ganti kata sandi siap!")}
								>
									Ubah Sandi
								</Button>
							</dd>
						</div>
					</dl>
				</Card>
			</div>
		</div>
	);
};
