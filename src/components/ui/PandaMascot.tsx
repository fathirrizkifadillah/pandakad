import type React from "react";
import { useState } from "react";

interface PandaMascotProps {
	message?: string;
	mood?: "happy" | "waving" | "thinking" | "proud";
	className?: string;
	compact?: boolean;
}

export const PandaMascot: React.FC<PandaMascotProps> = ({
	message = "Halo mahasiswa & dosen UNPANDA! Semangat belajar ya, jangan lupa jaga kesehatan!",
	className = "",
	compact = false,
}) => {
	const [isWaving, setIsWaving] = useState(false);

	return (
		<div
			className={`relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-50/80 to-[#75834a]/10 border border-[#d2ae54]/30 rounded-2xl p-3.5 shadow-2xs ${className}`}
		>
			<button
				type="button"
				className="relative shrink-0 cursor-pointer group bg-transparent border-0 p-0 text-left focus:outline-none"
				onClick={() => setIsWaving(true)}
				onAnimationEnd={() => setIsWaving(false)}
				title="Klik si Panda UNPANDA!"
				aria-label="Animasi lambaian maskot panda UNPANDA"
			>
				<img
					src="/assets/maskot_unpanda.png"
					alt="Maskot Panda UNPANDA"
					className={`object-contain transition-transform duration-200 group-hover:scale-105 ${
						compact ? "w-10 h-10" : "w-14 h-14 sm:w-16 sm:h-16"
					} ${isWaving ? "animate-bounce" : ""}`}
				/>
				<span className="absolute -top-1 -right-1 flex h-3 w-3">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d2ae54] opacity-75" />
					<span className="relative inline-flex rounded-full h-3 w-3 bg-[#75834a]" />
				</span>
			</button>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-1.5 mb-0.5">
					<span className="text-xs font-bold text-[#566432] uppercase tracking-wider">
						Panda Kampus
					</span>
					<span className="text-[10px] text-slate-400 font-normal">
						· Sahabat Belajarmu
					</span>
				</div>
				<p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
					{message}
				</p>
			</div>
		</div>
	);
};
