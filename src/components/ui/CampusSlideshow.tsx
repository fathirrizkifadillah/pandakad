import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { CAMPUS_SLIDES } from "../../data/campusData";
import { AmbientCanvas } from "./AmbientCanvas";

interface CampusSlideshowProps {
	className?: string;
}

export const CampusSlideshow: React.FC<CampusSlideshowProps> = ({
	className = "",
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const handleNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % CAMPUS_SLIDES.length);
	}, []);

	// Auto-advancing slideshow timer (5.5s) without user manual play/pause interruption
	useEffect(() => {
		const timer = setInterval(() => {
			if (!document.hidden) {
				handleNext();
			}
		}, 5500);

		return () => clearInterval(timer);
	}, [handleNext]);

	const currentSlide = CAMPUS_SLIDES[currentIndex];

	return (
		<section
			aria-roledescription="carousel"
			aria-label="Slideshow Gedung Kampus Universitas Panda Raya"
			className={`relative w-full h-full min-h-[460px] lg:min-h-full overflow-hidden bg-[#182012] flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none ${className}`}
		>
			{/* Slide Background Images with Smooth Crossfade */}
			{CAMPUS_SLIDES.map((slide, idx) => {
				const isActive = idx === currentIndex;
				return (
					<div
						key={slide.id}
						aria-hidden={!isActive}
						className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
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
			<div className="absolute inset-0 z-20 bg-gradient-to-t from-[#13190d]/90 via-[#2a3517]/65 to-[#1e2712]/60 pointer-events-none" />

			{/* Interactive Ambient Canvas Animation (Responds smoothly to cursor) */}
			<AmbientCanvas />

			{/* Top Branding Section: Clean "Sistem Akademik Unpanda" */}
			<div className="relative z-30 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-11 h-11 rounded-2xl bg-white/95 p-1.5 shadow-md flex items-center justify-center border border-white/20">
						<img
							src="/assets/logo_unpanda.png"
							alt="Logo Universitas Panda Raya"
							className="w-full h-full object-contain"
						/>
					</div>
					<div>
						<h1 className="text-white font-extrabold text-base sm:text-lg tracking-tight block leading-tight drop-shadow-xs">
							Sistem Akademik Unpanda
						</h1>
						<span className="text-emerald-200/80 text-[11px] font-medium tracking-wide block">
							Universitas Panda Raya
						</span>
					</div>
				</div>
			</div>

			{/* Center Area: Intentionally Open for Architecture & Ambient Animation (No Text Clutter) */}
			<div className="relative z-30 my-auto py-12" aria-hidden="true" />

			{/* Bottom Caption & Subtle Progress Dots */}
			<div className="relative z-30 pt-4 border-t border-white/15 flex items-end justify-between gap-4">
				<div className="min-w-0" aria-live="polite">
					<div className="flex items-center gap-2 mb-1">
						<span className="px-2 py-0.5 rounded-md bg-[#d2ae54] text-[#1e2412] text-[10px] font-extrabold tracking-wider">
							{currentSlide.code}
						</span>
						<span className="text-emerald-200/90 text-xs font-medium">
							{currentSlide.category}
						</span>
					</div>
					<h2 className="text-white font-bold text-sm sm:text-base tracking-tight truncate drop-shadow-xs">
						{currentSlide.title}
					</h2>
				</div>

				{/* Subtle Minimalist Indicator Dots */}
				<div className="flex items-center gap-1.5 shrink-0">
					{CAMPUS_SLIDES.map((slide, idx) => {
						const isActive = idx === currentIndex;
						return (
							<button
								key={slide.id}
								type="button"
								onClick={() => setCurrentIndex(idx)}
								aria-label={`Slide ${idx + 1}: ${slide.title}`}
								className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
									isActive
										? "w-6 bg-[#d2ae54]"
										: "w-1.5 bg-white/35 hover:bg-white/60"
								}`}
							/>
						);
					})}
				</div>
			</div>
		</section>
	);
};
