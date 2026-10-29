import type React from "react";
import { useEffect, useState } from "react";
import { ACADEMIC_FACTS } from "../../data/campusData";

interface PandaLoadingScreenProps {
	message?: string;
	onFinished?: () => void;
}

export const PandaLoadingScreen: React.FC<PandaLoadingScreenProps> = ({
	message = "Menyiapkan sesi akademik Anda...",
}) => {
	const [factIndex, setFactIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setFactIndex((prev) => (prev + 1) % ACADEMIC_FACTS.length);
		}, 2600);
		return () => clearInterval(interval);
	}, []);

	return (
		<div
			role="status"
			aria-live="polite"
			className="fixed inset-0 z-50 bg-[#1e2412]/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
		>
			<div className="bg-[#f6f5ef] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#d2ae54]/30 text-center flex flex-col items-center relative overflow-hidden">
				{/* Ambient Glow */}
				<div className="absolute -top-12 -right-12 w-36 h-36 bg-[#d2ae54]/20 rounded-full blur-2xl pointer-events-none" />
				<div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#75834a]/20 rounded-full blur-2xl pointer-events-none" />

				{/* Mascot studying animation */}
				<div className="relative mb-4">
					<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-100 to-emerald-50 border-2 border-[#75834a]/30 flex items-center justify-center p-2 shadow-inner animate-float">
						<img
							src="/assets/mascot/panda-study.webp"
							alt="Panda Assistant sedang memuat data"
							className="w-full h-full object-contain"
						/>
					</div>
					<span className="absolute bottom-0 right-1 flex h-4 w-4">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d2ae54] opacity-75" />
						<span className="relative inline-flex rounded-full h-4 w-4 bg-[#75834a]" />
					</span>
				</div>

				<h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
					{message}
				</h3>
				<p className="text-xs text-[#566432] font-semibold tracking-wide uppercase mb-5">
					Universitas Panda Raya
				</p>

				{/* Progress Indicator */}
				<div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-5">
					<div
						className="h-full bg-gradient-to-r from-[#75834a] via-[#d2ae54] to-[#75834a] animate-pulse rounded-full"
						style={{ width: "85%" }}
					/>
				</div>

				{/* Academic Tip Box */}
				<div className="bg-white/80 border border-[#e2e8f0] rounded-2xl p-3 w-full text-left transition-all duration-300">
					<div className="flex items-center gap-1.5 mb-1">
						<span className="text-[10px] font-extrabold text-[#75834a] uppercase tracking-wider">
							Catatan Akademik UNPANDA
						</span>
					</div>
					<p className="text-xs text-slate-600 leading-relaxed font-normal">
						{ACADEMIC_FACTS[factIndex]}
					</p>
				</div>
			</div>
		</div>
	);
};
