import type React from "react";
import { useEffect } from "react";
import { CampusMapExplorer } from "./CampusMapExplorer";

interface CampusMapModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CampusMapModal: React.FC<CampusMapModalProps> = ({
	isOpen,
	onClose,
}) => {
	// Close on Escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "auto";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Modal Peta Interaktif Kampus UNPANDA"
			className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6 transition-all duration-300"
		>
			<div className="w-full h-full max-w-7xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
				<CampusMapExplorer
					onClose={onClose}
					isModal={true}
					standaloneHeader={true}
				/>
			</div>
		</div>
	);
};
