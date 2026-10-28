import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { CAMPUS_SLIDES } from "../../data/campusData";

interface CampusSlideshowProps {
	className?: string;
	onExploreMap?: () => void;
}

export const CampusSlideshow: React.FC<CampusSlideshowProps> = ({
	className = "",
	onExploreMap,
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	const handleNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % CAMPUS_SLIDES.length);
	}, []);

	const handlePrev = useCallback(() => {
		setCurrentIndex(
			(prev) => (prev - 1 + CAMPUS_SLIDES.length) % CAMPUS_SLIDES.length,
		);
	}, []);

	// Auto-play timer (6s) that pauses on hover or user toggle
	useEffect(() => {
		if (isPaused) return;

		const timer = setInterval(() => {
			handleNext();
		}, 6000);

		// Pause on tab visibility change
		const handleVisibilityChange = () => {
			if (document.hidden) {
				setIsPaused(true);
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			clearInterval(timer);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [isPaused, handleNext]);

	const currentSlide = CAMPUS_SLIDES[currentIndex];

	return (
		<section
			aria-roledescription="carousel"
			aria-label="Slideshow Gedung Kampus Universitas Panda Raya"
			className={`relative w-full h-full min-h-[460px] lg:min-h-full overflow-hidden bg-[#182012] flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none ${className}`}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
		>
			{/* Slide Background Images (Crossfade Stack) */}
			{CAMPUS_SLIDES.map((slide, idx) => {
				const isActive = idx === currentIndex;
				return (
					<div
						key={slide.id}
						aria-hidden={!isActive}
						className={`absolute inset-0 transition-opacity duration-700 ease-out ${
							isActive
								? "opacity-100 z-10"
								: "opacity-0 z-0 pointer-events-none"
						}`}
					>
						<img
							src={slide.image}
							alt={slide.title}
							fetchPriority={idx === 0 ? "high" : "low"}
							loading={idx === 0 ? "eager" : "lazy"}
							className="w-full h-full object-cover object-center animate-kenburns transform-gpu"
						/>
					</div>
				);
			})}

			{/* Brand Olive/Dark Forest Tint Overlay */}
			<div className="absolute inset-0 z-20 bg-gradient-to-t from-[#13190d] via-[#2a3517]/75 to-[#3b4722]/65 pointer-events-none" />

			{/* Top Branding Section */}
			<div className="relative z-30 flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 rounded-2xl bg-white/95 p-1.5 shadow-lg flex items-center justify-center border border-white/20">
						<img
							src="/assets/logo_unpanda.png"
							alt="Logo Universitas Panda Raya"
							className="w-full h-full object-contain"
						/>
					</div>
					<div>
						<span className="text-white font-extrabold text-lg sm:text-xl tracking-tight block leading-tight drop-shadow-xs">
							UNIVERSITAS PANDA RAYA
						</span>
						<span className="text-emerald-200/90 text-[11px] font-semibold uppercase tracking-wider block mt-0.5">
							UNPANDA · Eco & Smart Campus
						</span>
					</div>
				</div>

				{/* Map Quick Shortcut Button */}
				{onExploreMap && (
					<button
						type="button"
						onClick={onExploreMap}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-medium backdrop-blur-md border border-white/25 transition-all cursor-pointer shadow-xs"
					>
						<span>🗺️</span>
						<span className="hidden sm:inline">Peta Interaktif</span>
					</button>
				)}
			</div>

			{/* Center Visual / Subtle Mascot Hint */}
			<div className="relative z-30 my-auto py-6 max-w-md">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d2ae54]/25 border border-[#d2ae54]/40 text-[#fbf5e6] text-xs font-semibold backdrop-blur-sm mb-3">
					<span className="text-sm">🎋</span>
					<span>Pilihan Masa Depan Generasi Cerdas</span>
				</div>
				<h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
					Kawasan Pendidikan Hijau Berkelanjutan
				</h2>
				<p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-sm">
					Menghadirkan lingkungan riset, teknologi terpadu, dan fasilitas ramah
					lingkungan untuk mencetak lulusan berdaya saing global.
				</p>
			</div>

			{/* Bottom Caption & Controls */}
			<div className="relative z-30 pt-4 border-t border-white/20 flex flex-col gap-3">
				<div className="flex items-end justify-between gap-4">
					<div className="flex-1 min-w-0" aria-live="polite">
						<div className="flex items-center gap-2 mb-1">
							<span className="px-2 py-0.5 rounded-md bg-[#d2ae54] text-[#1e2412] text-[10px] font-extrabold tracking-wider">
								{currentSlide.code}
							</span>
							<span className="text-emerald-200 text-xs font-medium truncate">
								{currentSlide.category}
							</span>
						</div>
						<h3 className="text-white font-bold text-base sm:text-lg tracking-tight truncate drop-shadow-xs">
							{currentSlide.title}
						</h3>
						<p className="text-emerald-100/80 text-xs line-clamp-2 mt-0.5 leading-relaxed font-normal">
							{currentSlide.description}
						</p>
					</div>

					{/* Navigation Arrows & Pause Button */}
					<div className="flex items-center gap-1.5 shrink-0">
						<button
							type="button"
							onClick={handlePrev}
							aria-label="Foto gedung sebelumnya"
							className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<button
							type="button"
							onClick={() => setIsPaused(!isPaused)}
							aria-label={
								isPaused
									? "Lanjutkan slideshow gedung"
									: "Jeda slideshow gedung"
							}
							className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer"
						>
							{isPaused ? (
								<Play className="w-3.5 h-3.5" />
							) : (
								<Pause className="w-3.5 h-3.5" />
							)}
						</button>
						<button
							type="button"
							onClick={handleNext}
							aria-label="Foto gedung berikutnya"
							className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Dot Progress Indicator */}
				<div className="flex items-center justify-between pt-1">
					<div className="flex items-center gap-1.5">
						{CAMPUS_SLIDES.map((slide, idx) => {
							const isActive = idx === currentIndex;
							return (
								<button
									key={slide.id}
									type="button"
									onClick={() => setCurrentIndex(idx)}
									aria-label={`Lihat slide ${idx + 1}: ${slide.title}`}
									className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
										isActive
											? "w-7 bg-[#d2ae54]"
											: "w-2 bg-white/30 hover:bg-white/60"
									}`}
								/>
							);
						})}
					</div>

					<span className="text-[11px] text-emerald-200/80 font-mono">
						0{currentIndex + 1} / 0{CAMPUS_SLIDES.length}
					</span>
				</div>
			</div>
		</section>
	);
};
