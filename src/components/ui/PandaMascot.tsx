import type React from "react";
import { useState } from "react";

export type PandaMood =
	| "idle"
	| "wave"
	| "happy"
	| "confused"
	| "oops"
	| "study"
	| "toga";

interface PandaMascotProps {
	message?: string;
	mood?: PandaMood;
	className?: string;
	compact?: boolean;
	showSpeechBubble?: boolean;
	interactive?: boolean;
}

const MOOD_ASSETS: Record<PandaMood, string> = {
	idle: "/assets/mascot/panda-idle.webp",
	wave: "/assets/mascot/panda-wave.webp",
	happy: "/assets/mascot/panda-happy.webp",
	confused: "/assets/mascot/panda-confused.webp",
	oops: "/assets/mascot/panda-oops.webp",
	study: "/assets/mascot/panda-study.webp",
	toga: "/assets/mascot/panda-toga.webp",
};

const MOOD_SOUNDS = [
	"Semangat belajar dan raih prestasi terbaik!",
	"UNPANDA - Kampus hijau, cerdas, dan berkelanjutan.",
	"Tetap jaga kesehatan dan fokus pada tujuan akademik.",
	"Raih prestasi terbaik bersama sivitas akademika UNPANDA.",
	"Jangan lupa istirahat yang cukup di sela perkuliahan.",
];

export const PandaMascot: React.FC<PandaMascotProps> = ({
	message = "Halo sivitas akademika Universitas Panda Raya! Semangat belajar ya, capai prestasimu bersama UNPANDA!",
	mood = "wave",
	className = "",
	compact = false,
	showSpeechBubble = true,
	interactive = true,
}) => {
	const [currentMood, setCurrentMood] = useState<PandaMood>(mood);
	const [clickCount, setClickCount] = useState(0);
	const [bubbleText, setBubbleText] = useState(message);
	const [isBouncing, setIsBouncing] = useState(false);

	const handleMascotClick = () => {
		if (!interactive) return;

		setIsBouncing(true);
		const moods: PandaMood[] = ["wave", "happy", "idle", "toga", "study"];
		const nextMood = moods[(clickCount + 1) % moods.length];
		const nextText = MOOD_SOUNDS[(clickCount + 1) % MOOD_SOUNDS.length];

		setCurrentMood(nextMood);
		setBubbleText(nextText);
		setClickCount((prev) => prev + 1);

		setTimeout(() => setIsBouncing(false), 500);
	};

	const assetSrc = MOOD_ASSETS[currentMood] || MOOD_ASSETS.idle;

	return (
		<div
			className={`relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-50/90 via-[#f6f5ef] to-[#75834a]/10 border border-[#d2ae54]/30 rounded-2xl p-3 sm:p-3.5 shadow-2xs ${className}`}
		>
			<button
				type="button"
				onClick={handleMascotClick}
				title="Klik Panda Assistant untuk menyapa!"
				aria-label="Panda Assistant Maskot Universitas Panda Raya"
				className={`relative shrink-0 cursor-pointer group bg-transparent border-0 p-0 text-left focus:outline-none transition-transform duration-200 active:scale-95 ${
					isBouncing ? "scale-110" : ""
				}`}
			>
				<div
					className={`rounded-2xl overflow-hidden border border-[#d2ae54]/40 bg-white/60 p-0.5 shadow-inner transition-transform group-hover:scale-105 ${
						compact ? "w-10 h-10" : "w-14 h-14 sm:w-16 sm:h-16"
					}`}
				>
					<img
						src={assetSrc}
						alt={`Panda Assistant (${currentMood})`}
						className="w-full h-full object-cover rounded-xl"
					/>
				</div>
				<span className="absolute -top-1 -right-1 flex h-3 w-3">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d2ae54] opacity-75" />
					<span className="relative inline-flex rounded-full h-3 w-3 bg-[#75834a]" />
				</span>
			</button>

			{showSpeechBubble && (
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-1.5 mb-0.5">
						<span className="text-[11px] font-bold text-[#566432] uppercase tracking-wider">
							Panda Assistant
						</span>
						<span className="text-[10px] text-slate-400 font-normal">
							· Teman Akademik UNPANDA
						</span>
					</div>
					<p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
						{bubbleText}
					</p>
				</div>
			)}
		</div>
	);
};
