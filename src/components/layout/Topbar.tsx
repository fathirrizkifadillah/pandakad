import { Bell, Menu } from "lucide-react";
import type React from "react";
import type { Role, User } from "../../types";

interface TopbarProps {
	user: User;
	title: string;
	onOpenMobileMenu: () => void;
	onSwitchRole: (role: Role) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
	user,
	title,
	onOpenMobileMenu,
	onSwitchRole,
}) => {
	return (
		<header className="h-20 bg-white border-b border-[#e2e8f0] sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
			{/* Left: Mobile hamburger & Page Title */}
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onOpenMobileMenu}
					className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
					aria-label="Buka menu navigasi"
				>
					<Menu className="w-5 h-5" />
				</button>

				<div>
					<h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
						{title}
					</h1>
					<p className="text-xs text-slate-500 flex items-center gap-2">
						<span>UNPANDA</span>
						<span>•</span>
						<span className="text-[#75834a] font-medium">
							Semester Ganjil 2026/2027
						</span>
					</p>
				</div>
			</div>

			{/* Right: Quick Role Switcher + User Info */}
			<div className="flex items-center gap-3 sm:gap-4">
				{/* Quick Role Switcher for seamless demo testing */}
				<div className="hidden md:flex items-center bg-[#f6f5ef] p-1 rounded-lg border border-[#e2e8f0]">
					{(["Mahasiswa", "Dosen", "Admin"] as Role[]).map((r) => (
						<button
							key={r}
							type="button"
							onClick={() => onSwitchRole(r)}
							className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
								user.role === r
									? "bg-white text-[#566432] shadow-2xs"
									: "text-slate-500 hover:text-slate-800"
							}`}
						>
							{r}
						</button>
					))}
				</div>

				{/* Notification Bell */}
				<button
					type="button"
					className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
					aria-label="Pemberitahuan akademik"
					title="Ada 3 pengumuman baru"
				>
					<Bell className="w-5 h-5" />
					<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d2ae54]" />
				</button>

				{/* User Profile Pill */}
				<div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
					<div className="w-9 h-9 rounded-full bg-[#75834a]/15 text-[#566432] border border-[#75834a]/30 flex items-center justify-center font-bold text-sm">
						{user.name.charAt(0)}
					</div>
					<div className="hidden sm:block text-left">
						<span className="block text-xs font-bold text-slate-900 leading-tight">
							{user.name}
						</span>
						<span className="block text-[11px] text-slate-500">
							{user.identifier}
						</span>
					</div>
				</div>
			</div>
		</header>
	);
};
