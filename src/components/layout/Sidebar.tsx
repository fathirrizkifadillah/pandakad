import {
	Award,
	BookMarked,
	BookOpenCheck,
	Calendar,
	CalendarDays,
	CalendarRange,
	Database,
	FileBarChart,
	FileText,
	LayoutDashboard,
	LogOut,
	Settings,
	UserCheck,
	UserCircle,
	Users,
} from "lucide-react";
import type React from "react";
import type { Role } from "../../types";

interface SidebarProps {
	role: Role;
	currentPath: string;
	onNavigate: (path: string) => void;
	onLogout: () => void;
	isOpenMobile?: boolean;
	onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
	role,
	currentPath,
	onNavigate,
	onLogout,
	isOpenMobile = false,
	onCloseMobile,
}) => {
	const getNavItems = () => {
		switch (role) {
			case "Admin":
				return [
					{
						label: "Dashboard",
						path: "admin-dashboard",
						icon: LayoutDashboard,
					},
					{ label: "Manajemen user", path: "admin-users", icon: Users },
					{ label: "Data master", path: "admin-master", icon: Database },
					{ label: "Penjadwalan", path: "admin-jadwal", icon: CalendarDays },
					{
						label: "Periode akademik",
						path: "admin-periode",
						icon: CalendarRange,
					},
					{ label: "Laporan", path: "admin-laporan", icon: FileBarChart },
					{ label: "Pengaturan", path: "admin-pengaturan", icon: Settings },
				];
			case "Dosen":
				return [
					{
						label: "Dashboard",
						path: "dosen-dashboard",
						icon: LayoutDashboard,
					},
					{ label: "Kelas diampu", path: "dosen-kelas", icon: BookOpenCheck },
					{ label: "Jadwal mengajar", path: "dosen-jadwal", icon: Calendar },
					{ label: "Absensi", path: "dosen-absensi", icon: UserCheck },
					{ label: "Input nilai", path: "dosen-nilai", icon: Award },
					{ label: "Materi dan tugas", path: "dosen-materi", icon: FileText },
					{ label: "Profil", path: "dosen-profil", icon: UserCircle },
				];
			case "Mahasiswa":
				return [
					{ label: "Dashboard", path: "mhs-dashboard", icon: LayoutDashboard },
					{ label: "KRS", path: "mhs-krs", icon: BookMarked },
					{ label: "Jadwal kuliah", path: "mhs-jadwal", icon: Calendar },
					{ label: "Nilai", path: "mhs-nilai", icon: Award },
					{ label: "Presensi", path: "mhs-presensi", icon: UserCheck },
					{ label: "Profil", path: "mhs-profil", icon: UserCircle },
				];
		}
	};

	const navItems = getNavItems();

	const handleNavClick = (path: string) => {
		onNavigate(path);
		if (onCloseMobile) onCloseMobile();
	};

	return (
		<>
			{/* Mobile Backdrop */}
			{isOpenMobile && (
				<div
					className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
					onClick={onCloseMobile}
					aria-hidden="true"
				/>
			)}

			{/* Sidebar Container */}
			<aside
				className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#e2e8f0] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
					isOpenMobile ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Brand / Logo Header */}
				<div className="h-20 px-6 flex items-center gap-3 border-b border-[#f1f5f9]">
					<img
						src="/assets/logo_unpanda.png"
						alt="Logo UNPANDA"
						className="w-10 h-10 object-contain"
					/>
					<div>
						<span className="block font-bold text-base tracking-tight text-slate-900 leading-none">
							UNPANDA
						</span>
						<span className="text-[11px] font-semibold text-[#75834a] tracking-wider uppercase">
							Sistem Akademik
						</span>
					</div>
				</div>

				{/* Current Role Indicator Pill */}
				<div className="px-5 py-3 bg-[#f6f5ef]/80 border-b border-[#e2e8f0]/60 flex items-center justify-between">
					<span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
						Peran Aktif
					</span>
					<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#75834a]/15 text-[#566432]">
						{role}
					</span>
				</div>

				{/* Navigation Links */}
				<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentPath === item.path;
						return (
							<button
								key={item.path}
								type="button"
								onClick={() => handleNavClick(item.path)}
								className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 select-none ${
									isActive
										? "bg-[#75834a] text-white shadow-xs"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
								}`}
							>
								<Icon
									className={`w-4 h-4 shrink-0 ${
										isActive ? "text-white" : "text-slate-400"
									}`}
								/>
								<span className="truncate">{item.label}</span>
							</button>
						);
					})}
				</nav>

				{/* Logout Section */}
				<div className="p-3 border-t border-[#f1f5f9]">
					<button
						type="button"
						onClick={onLogout}
						className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
					>
						<LogOut className="w-4 h-4 shrink-0 text-rose-500" />
						<span>Keluar Sistem</span>
					</button>
				</div>
			</aside>
		</>
	);
};
