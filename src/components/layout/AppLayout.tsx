import type React from "react";
import { useState } from "react";
import type { Role, User } from "../../types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppLayoutProps {
	user: User;
	title: string;
	currentPath: string;
	onNavigate: (path: string) => void;
	onLogout: () => void;
	onSwitchRole: (role: Role) => void;
	children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
	user,
	title,
	currentPath,
	onNavigate,
	onLogout,
	onSwitchRole,
	children,
}) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<div className="min-h-screen bg-[#f6f5ef] flex">
			{/* Sidebar Navigation */}
			<Sidebar
				role={user.role}
				currentPath={currentPath}
				onNavigate={onNavigate}
				onLogout={onLogout}
				isOpenMobile={isMobileMenuOpen}
				onCloseMobile={() => setIsMobileMenuOpen(false)}
			/>

			{/* Main Content Area */}
			<div className="flex-1 lg:pl-64 flex flex-col min-w-0">
				<Topbar
					user={user}
					title={title}
					onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
					onSwitchRole={onSwitchRole}
				/>

				<main
					id="main-content"
					className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
				>
					{children}
				</main>
			</div>
		</div>
	);
};
