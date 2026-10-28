import {
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
	const [isMapOpen, setIsMapOpen] = useState(false);

	const roleConfigs: Record<
		Role,
		{ label: string; placeholder: string; defaultId: string; greeting: string }
	> = {
		Mahasiswa: {
			label: "NIM (Nomor Induk Mahasiswa)",
			placeholder: "Contoh: 22010189",
			defaultId: "22010189",
			greeting:
				"Halo mahasiswa kebanggaan UNPANDA! Masuk dulu yuk buat cek jadwal, isi KRS, atau pantau IPK semester ini 🎓",
		},
		Dosen: {
			label: "NIDN / NIP Dosen",
			placeholder: "Contoh: 0412087501",
			defaultId: "0412087501",
			greeting:
				"Selamat datang Bapak/Ibu Dosen UNPANDA! Siap membimbing dan mencerdaskan calon pemimpin masa depan? 📚",
		},
		Admin: {
			label: "NIP / Akun Admin BAAK",
			placeholder: "Contoh: 198504152010011002",
			defaultId: "198504152010011002",
			greeting:
				"Halo Administrator BAAK! Pusat kendali data akademik Universitas Panda Raya siap dikelola 🛡️",
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
		}, 1200);
	};

	return (
		<main className="min-h-screen bg-[#f6f5ef] flex items-center justify-center p-2 sm:p-4 lg:p-6">
			{/* Academic Loading Screen */}
			{isLoading && (
				<PandaLoadingScreen
					message={`Memverifikasi kredensial ${selectedRole} UNPANDA...`}
				/>
			)}

			{/* Interactive Campus Map Modal */}
			<CampusMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

			{/* Dual-Panel Container: Left Slideshow + Right Login Card */}
			<div className="w-full max-w-6xl bg-white rounded-3xl border border-[#e2e8f0] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
				{/* Left Panel: Campus Building Slideshow */}
				<div className="lg:col-span-6 xl:col-span-7 h-80 sm:h-96 lg:h-auto border-b lg:border-b-0 lg:border-r border-[#e2e8f0]">
					<CampusSlideshow onExploreMap={() => setIsMapOpen(true)} />
				</div>

				{/* Right Panel: Academic Login Form */}
				<div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
					<div>
						{/* Mobile Brand Header */}
						<div className="flex items-center justify-between mb-6 lg:hidden">
							<div className="flex items-center gap-2.5">
								<img
									src="/assets/logo_unpanda.png"
									alt="Logo UNPANDA"
									className="w-9 h-9 object-contain"
								/>
								<div>
									<h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
										UNIVERSITAS PANDA RAYA
									</h1>
									<span className="text-[10px] text-[#75834a] font-bold">
										PORTAL AKADEMIK
									</span>
								</div>
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

						{/* Greeting & Subtitle */}
						<div className="mb-6">
							<span className="text-xs font-bold text-[#75834a] uppercase tracking-wider block mb-1">
								Sistem Informasi Akademik
							</span>
							<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Masuk ke Akun Anda
							</h2>
							<p className="text-xs text-slate-500 mt-1 leading-relaxed">
								Silakan pilih peran dan masukkan kredensial resmi Universitas
								Panda Raya.
							</p>
						</div>

						{/* Role Switcher Tabs */}
						<div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#f6f5ef] rounded-2xl border border-[#e2e8f0] mb-6">
							{(["Mahasiswa", "Dosen", "Admin"] as Role[]).map((role) => {
								const isSelected = selectedRole === role;
								return (
									<button
										key={role}
										type="button"
										onClick={() => handleRoleChange(role)}
										className={`py-2 px-2 text-xs font-bold rounded-xl transition-all duration-150 select-none cursor-pointer ${
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

						{/* Login Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label
									htmlFor="identifier"
									className="block text-xs font-bold text-slate-700 mb-1.5"
								>
									{roleConfigs[selectedRole].label}
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
										className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-[#f6f5ef]/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#75834a]/30 focus:border-[#75834a] focus:bg-white transition-all"
									/>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between mb-1.5">
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
									<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
										className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm bg-[#f6f5ef]/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#75834a]/30 focus:border-[#75834a] focus:bg-white transition-all font-mono"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										aria-label={
											showPassword
												? "Sembunyikan kata sandi"
												: "Tampilkan kata sandi"
										}
										className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
							</div>

							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									defaultChecked
									className="h-4 w-4 text-[#75834a] focus:ring-[#75834a] border-slate-300 rounded cursor-pointer"
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
								className="w-full py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-[0.99] transition-transform"
							>
								<LogIn className="w-4 h-4 mr-2" />
								Masuk ke Portal UNPANDA
							</Button>
						</form>
					</div>

					{/* Panda Mascot Greeting Card & Map Trigger */}
					<div className="mt-6 pt-5 border-t border-[#e2e8f0]/80 flex flex-col gap-3">
						<PandaMascot
							message={roleConfigs[selectedRole].greeting}
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
							className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-[#75834a]/10 via-amber-50 to-[#d2ae54]/15 border border-[#75834a]/20 hover:border-[#75834a]/40 text-xs text-slate-800 font-semibold transition-all cursor-pointer shadow-2xs group active:scale-[0.99]"
						>
							<div className="flex items-center gap-2">
								<span className="text-base group-hover:scale-110 transition-transform">
									🗺️
								</span>
								<div className="text-left">
									<span className="font-bold text-[#566432] block text-xs">
										Jelajahi Peta Kampus Interaktif
									</span>
									<span className="text-[10px] text-slate-500 font-normal">
										Lihat denah isometrik gedung, lab, dan fasilitas UNPANDA
									</span>
								</div>
							</div>
							<span className="text-[11px] font-bold text-[#75834a] bg-white px-2 py-1 rounded-lg border border-[#75834a]/20 shadow-2xs">
								Buka Peta →
							</span>
						</button>

						<div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
							<span>Tahun Akademik 2026/2027</span>
							<span>© UNPANDA Raya</span>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};
