import {
	Compass,
	Eye,
	EyeOff,
	Lock,
	LogIn,
	MapPin,
	User as UserIcon,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { CampusMapModal } from "../components/map/CampusMapModal";
import { Button } from "../components/ui/Button";
import { CampusSlideshow } from "../components/ui/CampusSlideshow";
import { PandaLoadingScreen } from "../components/ui/PandaLoadingScreen";
import { PandaMascot } from "../components/ui/PandaMascot";
import { authApi } from "../services/api/auth";
import type { Role, User } from "../types";

interface LoginPageProps {
	onLogin: (role: Role, user?: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
	const [selectedRole, setSelectedRole] = useState<Role>("Mahasiswa");
	const [identifier, setIdentifier] = useState("22010189");
	const [password, setPassword] = useState("••••••••");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isMapOpen, setIsMapOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const roleConfigs: Record<
		Role,
		{ label: string; placeholder: string; defaultId: string; greeting: string }
	> = {
		Mahasiswa: {
			label: "NIM (Nomor Induk Mahasiswa)",
			placeholder: "Contoh: 22010189",
			defaultId: "22010189",
			greeting:
				"Halo mahasiswa kebanggaan UNPANDA! Masuk untuk cek jadwal kuliah, isi KRS, atau pantau IPK semester ini.",
		},
		Dosen: {
			label: "NIDN / NIP Dosen",
			placeholder: "Contoh: 198503152010121002",
			defaultId: "198503152010121002",
			greeting:
				"Selamat datang Bapak/Ibu Dosen UNPANDA. Portal siap digunakan untuk mengelola perkuliahan dan penilaian akademik.",
		},
		Admin: {
			label: "NIP / Akun Admin BAAK",
			placeholder: "Contoh: ADM001",
			defaultId: "ADM001",
			greeting:
				"Selamat datang Administrator BAAK. Pusat kendali data akademik Universitas Panda Raya siap dikelola.",
		},
	};

	const handleRoleChange = (role: Role) => {
		setSelectedRole(role);
		setIdentifier(roleConfigs[role].defaultId);
		setErrorMessage(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage(null);

		try {
			const pass = password === "••••••••" ? "Panda2026!" : password;
			const user = await authApi.login(identifier, pass, selectedRole);
			setIsLoading(false);
			onLogin(selectedRole, user);
		} catch (err: any) {
			setIsLoading(false);
			if (err?.code === "NETWORK_DISCONNECTED") {
				console.warn("Backend offline, menggunakan mode fallback.");
				onLogin(selectedRole);
			} else {
				setErrorMessage(err?.message || "NIM/NIP atau kata sandi tidak valid.");
			}
		}
	};

	return (
		<main className="h-screen max-h-screen overflow-hidden bg-[#f6f5ef] flex items-center justify-center p-3 sm:p-4 lg:p-6 select-none">
			{/* Academic Loading Screen */}
			{isLoading && (
				<PandaLoadingScreen
					message={`Memverifikasi kredensial ${selectedRole} UNPANDA...`}
				/>
			)}

			{/* Interactive Campus Map Modal */}
			<CampusMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

			{/* Dual-Panel Container: Left Slideshow + Right Login Card (100% Fit, No Scroll) */}
			<div className="w-full max-w-6xl h-full max-h-[min(94vh,740px)] bg-white rounded-2xl sm:rounded-3xl border border-[#e2e8f0] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
				{/* Left Panel: Campus Building Slideshow */}
				<div className="lg:col-span-6 xl:col-span-7 h-72 sm:h-80 lg:h-full border-b lg:border-b-0 lg:border-r border-[#e2e8f0] overflow-hidden">
					<CampusSlideshow />
				</div>

				{/* Right Panel: Academic Login Form */}
				<div className="lg:col-span-6 xl:col-span-5 p-4 sm:p-6 lg:p-7 flex flex-col justify-between bg-white h-full overflow-y-auto lg:overflow-y-hidden">
					<div>
						{/* Mobile Brand Header */}
						<div className="flex items-center justify-between mb-3 lg:hidden">
							<div className="flex items-center gap-2">
								<img
									src="/assets/logo_unpanda_horizontal.png"
									alt="Universitas Panda Raya"
									className="h-6 w-auto object-contain"
								/>
							</div>
							<button
								type="button"
								onClick={() => setIsMapOpen(true)}
								className="text-xs text-[#75834a] font-semibold flex items-center gap-1 bg-[#75834a]/10 px-2.5 py-1 rounded-lg"
							>
								<MapPin className="w-3.5 h-3.5" />
								<span>Peta</span>
							</button>
						</div>

						{/* Desktop Brand Header: Horizontal Logo + Clean "PANDAKAD" */}
						<div className="mb-3.5">
							<img
								src="/assets/logo_unpanda_horizontal.png"
								alt="Universitas Panda Raya"
								className="h-7 sm:h-8 w-auto object-contain mb-2 hidden lg:block"
							/>
							<div className="flex items-center gap-2">
								<h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
									PANDAKAD
								</h2>
								<span className="w-2 h-2 rounded-full bg-[#75834a]" />
							</div>
							<p className="text-xs text-slate-500 mt-0.5 font-medium">
								Portal Layanan Akademik Terpadu
							</p>
						</div>

						{/* Role Switcher Tabs */}
						<div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f6f5ef] rounded-xl border border-[#e2e8f0] mb-3.5">
							{(["Mahasiswa", "Dosen", "Admin"] as Role[]).map((role) => {
								const isSelected = selectedRole === role;
								return (
									<button
										key={role}
										type="button"
										onClick={() => handleRoleChange(role)}
										className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all duration-150 select-none cursor-pointer ${
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

						{/* Error Alert */}
						{errorMessage && (
							<div className="p-2.5 mb-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
								<span className="font-bold">Gagal Masuk:</span> {errorMessage}
							</div>
						)}

						{/* Login Form */}
						<form onSubmit={handleSubmit} className="space-y-3">
							<div>
								<label
									htmlFor="identifier"
									className="block text-xs font-bold text-slate-700 mb-1"
								>
									{roleConfigs[selectedRole].label}
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
										<UserIcon className="w-4 h-4" />
									</div>
									<input
										id="identifier"
										name="identifier"
										type="text"
										autoComplete="username"
										required
										value={identifier}
										onChange={(e) => setIdentifier(e.target.value)}
										placeholder={roleConfigs[selectedRole].placeholder}
										className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-[#f6f5ef]/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#75834a]/30 focus:border-[#75834a] focus:bg-white transition-all"
									/>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between mb-1">
									<label
										htmlFor="password"
										className="block text-xs font-bold text-slate-700"
									>
										Kata Sandi
									</label>
									<button
										type="button"
										onClick={() => {
											alert(
												"Silakan hubungi BAAK Universitas Panda Raya di Helpdesk Lt. 1 Gedung Rektorat atau email baak@unpanda.ac.id",
											);
										}}
										className="text-[11px] font-semibold text-[#75834a] hover:underline cursor-pointer bg-transparent border-0 p-0"
									>
										Lupa sandi?
									</button>
								</div>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
										<Lock className="w-4 h-4" />
									</div>
									<input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										autoComplete="current-password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-[#f6f5ef]/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#75834a]/30 focus:border-[#75834a] focus:bg-white transition-all font-mono"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										aria-label={
											showPassword
												? "Sembunyikan kata sandi"
												: "Tampilkan kata sandi"
										}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
							</div>

							<div className="flex items-center pt-0.5">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									defaultChecked
									className="h-3.5 w-3.5 text-[#75834a] focus:ring-[#75834a] border-slate-300 rounded cursor-pointer"
								/>
								<label
									htmlFor="remember-me"
									className="ml-2 block text-xs text-slate-600 cursor-pointer"
								>
									Ingat sesi login saya di perangkat ini
								</label>
							</div>

							<Button
								type="submit"
								variant="primary"
								className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-[0.99] transition-transform"
							>
								<LogIn className="w-4 h-4 mr-2" />
								Masuk ke Portal UNPANDA
							</Button>
						</form>
					</div>

					{/* Panda Mascot Greeting Card & Map Trigger */}
					<div className="mt-3 pt-3 border-t border-[#e2e8f0]/80 flex flex-col gap-2.5">
						<PandaMascot
							message={roleConfigs[selectedRole].greeting}
							compact={true}
							mood={
								selectedRole === "Mahasiswa"
									? "happy"
									: selectedRole === "Dosen"
										? "study"
										: "wave"
							}
						/>

						{/* Interactive Map Quick Explorer Link */}
						<button
							type="button"
							onClick={() => setIsMapOpen(true)}
							className="w-full flex items-center justify-between p-2 rounded-xl bg-[#f6f5ef] hover:bg-[#eceae0] border border-[#e2e8f0] text-xs text-slate-800 font-semibold transition-all cursor-pointer shadow-2xs group active:scale-[0.99]"
						>
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 rounded-lg bg-white border border-[#e2e8f0] text-[#75834a] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
									<Compass className="w-3.5 h-3.5 text-[#75834a]" />
								</div>
								<div className="text-left">
									<span className="font-bold text-slate-800 block text-xs leading-tight">
										Jelajahi Peta Kampus Interaktif
									</span>
									<span className="text-[10px] text-slate-500 font-normal leading-tight">
										Denah aerial pulau danau, lab, dan fasilitas UNPANDA
									</span>
								</div>
							</div>
							<span className="text-[10px] font-bold text-[#75834a] bg-white px-2 py-0.5 rounded-md border border-[#e2e8f0] shadow-2xs">
								Buka Peta →
							</span>
						</button>

						<div className="flex items-center justify-between text-[10px] text-slate-400">
							<span>Tahun Akademik 2026/2027</span>
							<span>© UNPANDA Raya</span>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};
