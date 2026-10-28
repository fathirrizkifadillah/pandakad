import { Eye, EyeOff, Lock, LogIn, User as UserIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { PandaMascot } from "../components/ui/PandaMascot";
import type { Role } from "../types";

interface LoginPageProps {
	onLogin: (role: Role) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
	const [selectedRole, setSelectedRole] = useState<Role>("Mahasiswa");
	const [identifier, setIdentifier] = useState("22010189");
	const [password, setPassword] = useState("••••••••");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const roleConfigs: Record<
		Role,
		{ label: string; placeholder: string; defaultId: string; greeting: string }
	> = {
		Mahasiswa: {
			label: "NIM (Nomor Induk Mahasiswa)",
			placeholder: "Contoh: 22010189",
			defaultId: "22010189",
			greeting:
				"Halo mahasiswa kesayangan UNPANDA! Masuk dulu yuk buat cek jadwal, isi KRS, atau pantau IPK semester ini 🎓",
		},
		Dosen: {
			label: "NIDN / NIP Dosen",
			placeholder: "Contoh: 0412087501",
			defaultId: "0412087501",
			greeting:
				"Selamat datang Bapak/Ibu Dosen! Siap mengajar dan mencerdaskan calon penerus bangsa hari ini? 📚",
		},
		Admin: {
			label: "NIP / Akun Admin BAAK",
			placeholder: "Contoh: 198504152010011002",
			defaultId: "198504152010011002",
			greeting:
				"Halo Administrator BAAK! Pusat kendali data akademik UNPANDA siap dikelola dengan aman & tertib 🛡️",
		},
	};

	const handleRoleChange = (role: Role) => {
		setSelectedRole(role);
		setIdentifier(roleConfigs[role].defaultId);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
			onLogin(selectedRole);
		}, 400);
	};

	return (
		<div className="min-h-screen bg-[#f6f5ef] flex items-center justify-center p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-4xl bg-white rounded-2xl border border-[#e2e8f0] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
				{/* Left Branding Banner */}
				<div className="lg:col-span-5 bg-gradient-to-b from-[#75834a]/15 via-[#f6f5ef] to-amber-50/50 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#e2e8f0]">
					<div>
						<div className="flex items-center gap-3 mb-6">
							<img
								src="/assets/logo_unpanda.png"
								alt="Logo UNPANDA"
								className="w-12 h-12 object-contain"
							/>
							<div>
								<h1 className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">
									UNPANDA
								</h1>
								<p className="text-xs font-semibold text-[#75834a] uppercase tracking-wider mt-0.5">
									Sistem Akademik Terpadu
								</p>
							</div>
						</div>

						<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
							Portal Layanan Akademik Kampus Masa Depan
						</h2>
						<p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
							Akses cepat dan transparan untuk seluruh sivitas akademika
							Universitas Pandanaran.
						</p>
					</div>

					<div className="my-6">
						<PandaMascot message={roleConfigs[selectedRole].greeting} />
					</div>

					<div className="pt-4 border-t border-[#e2e8f0]/60 flex items-center justify-between text-[11px] text-slate-500">
						<span>Tahun Akademik 2026/2027</span>
						<span>Versi 2.0 (Modern UI)</span>
					</div>
				</div>

				{/* Right Login Form */}
				<div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
					<div className="mb-6">
						<span className="text-xs font-bold text-[#75834a] uppercase tracking-wider block mb-1">
							Selamat Datang
						</span>
						<h3 className="text-2xl font-bold text-slate-900 tracking-tight">
							Masuk ke Akun Anda
						</h3>
						<p className="text-xs text-slate-500 mt-1">
							Pilih peran Anda terlebih dahulu untuk memulai sesi akademik.
						</p>
					</div>

					{/* Role Tabs */}
					<div className="grid grid-cols-3 gap-2 p-1.5 bg-[#f6f5ef] rounded-xl border border-[#e2e8f0] mb-6">
						{(["Mahasiswa", "Dosen", "Admin"] as Role[]).map((role) => {
							const isSelected = selectedRole === role;
							return (
								<button
									key={role}
									type="button"
									onClick={() => handleRoleChange(role)}
									className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 select-none ${
										isSelected
											? "bg-[#75834a] text-white shadow-xs"
											: "text-slate-600 hover:text-slate-900 hover:bg-white/60"
									}`}
								>
									{role}
								</button>
							);
						})}
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="identifier"
								className="block text-xs font-semibold text-slate-700 mb-1.5"
							>
								{roleConfigs[selectedRole].label}
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
									<UserIcon className="w-4 h-4" />
								</div>
								<input
									id="identifier"
									type="text"
									required
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									placeholder={roleConfigs[selectedRole].placeholder}
									className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-2 focus:outline-[#75834a] transition-all"
								/>
							</div>
						</div>

						<div>
							<div className="flex items-center justify-between mb-1.5">
								<label
									htmlFor="password"
									className="block text-xs font-semibold text-slate-700"
								>
									Kata Sandi
								</label>
								<button
									type="button"
									onClick={() => {
										alert(
											"Silakan hubungi BAAK UNPANDA untuk reset kata sandi akun.",
										);
									}}
									className="text-xs text-[#75834a] hover:underline font-medium"
								>
									Lupa sandi?
								</button>
							</div>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
									<Lock className="w-4 h-4" />
								</div>
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-2 focus:outline-[#75834a] transition-all"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
									aria-label={
										showPassword
											? "Sembunyikan kata sandi"
											: "Tampilkan kata sandi"
									}
								>
									{showPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>

						<Button
							type="submit"
							variant="primary"
							size="lg"
							className="w-full mt-2"
							isLoading={isLoading}
							rightIcon={<LogIn className="w-4 h-4" />}
						>
							Masuk sebagai {selectedRole}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
};
