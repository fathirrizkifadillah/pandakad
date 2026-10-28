import {
	Building,
	Check,
	Clock,
	Layers,
	MapPin,
	RotateCcw,
	Search,
	X,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CAMPUS_LANDMARKS, type CampusLandmark } from "../../data/campusData";

interface CampusMapExplorerProps {
	onClose?: () => void;
	isModal?: boolean;
	standaloneHeader?: boolean;
	initialBuildingId?: string;
}

type MapCategory =
	| "semua"
	| "fakultas"
	| "akademik"
	| "umum"
	| "terbuka"
	| "olahraga-seni"
	| "ibadah";

const CATEGORIES: { id: MapCategory; label: string; icon: string }[] = [
	{ id: "semua", label: "Semua Gedung", icon: "🏛️" },
	{ id: "fakultas", label: "Fakultas", icon: "🎓" },
	{ id: "akademik", label: "Fasilitas Akademik", icon: "📖" },
	{ id: "umum", label: "Fasilitas Umum", icon: "👥" },
	{ id: "terbuka", label: "Ruang Terbuka", icon: "🌳" },
	{ id: "olahraga-seni", label: "Olahraga & Seni", icon: "⚽" },
	{ id: "ibadah", label: "Ibadah & Rohani", icon: "🕌" },
];

export const CampusMapExplorer: React.FC<CampusMapExplorerProps> = ({
	onClose,
	isModal = false,
	standaloneHeader = false,
	initialBuildingId,
}) => {
	const [activeCategory, setActiveCategory] = useState<MapCategory>("semua");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLandmark, setSelectedLandmark] =
		useState<CampusLandmark | null>(() => {
			if (initialBuildingId) {
				return (
					CAMPUS_LANDMARKS.find((b) => b.id === initialBuildingId) ||
					CAMPUS_LANDMARKS[0]
				);
			}
			return CAMPUS_LANDMARKS[0];
		});

	// Mobile responsive detection
	const [isMobile, setIsMobile] = useState(() => {
		if (typeof window !== "undefined") {
			return window.innerWidth < 768;
		}
		return false;
	});

	// Zoom and Pan state
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);
	const [isDetailOpen, setIsDetailOpen] = useState(() => {
		if (typeof window !== "undefined") {
			return window.innerWidth >= 768;
		}
		return false;
	});
	const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
		if (typeof window !== "undefined") {
			return window.innerWidth >= 768;
		}
		return false;
	});
	const [copiedNotice, setCopiedNotice] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Mascot reaction state
	const [mascotMood, setMascotMood] = useState<
		"wave" | "happy" | "confused" | "idle"
	>("wave");
	const [mascotBubble, setMascotBubble] = useState(
		"Halo! Klik gedung di denah untuk info ruangan & lab!",
	);

	const containerRef = useRef<HTMLDivElement>(null);

	// Filter landmarks
	const filteredLandmarks = useMemo(() => {
		return CAMPUS_LANDMARKS.filter((landmark) => {
			const matchesCategory =
				activeCategory === "semua" || landmark.category === activeCategory;
			const matchesSearch =
				landmark.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				landmark.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
				landmark.facilities.some((f) =>
					f.toLowerCase().includes(searchQuery.toLowerCase()),
				);
			return matchesCategory && matchesSearch;
		});
	}, [activeCategory, searchQuery]);

	// React to search results with Panda assistant
	useEffect(() => {
		if (searchQuery.trim().length > 0 && filteredLandmarks.length === 0) {
			setMascotMood("confused");
			setMascotBubble(
				`Oops! Gedung "${searchQuery}" tidak ditemukan. Coba kata kunci lain yuk! 🎋`,
			);
		} else if (searchQuery.trim().length > 0) {
			setMascotMood("happy");
			setMascotBubble(
				`Ditemukan ${filteredLandmarks.length} lokasi sesuai pencarianmu! ✨`,
			);
		}
	}, [searchQuery, filteredLandmarks.length]);

	// Pan smoothly to a landmark
	const focusOnLandmark = useCallback(
		(landmark: CampusLandmark) => {
			setSelectedLandmark(landmark);
			setIsDetailOpen(true);
			setMascotMood("happy");
			setMascotBubble(
				`Kamu sedang melihat ${landmark.name} (${landmark.code})! 🏢✨`,
			);

			// Calculate center offset on the canvas (coords are in 0-100 percentage)
			// Normalized center is (50, 50)
			const offsetX = (50 - landmark.coords.x) * 8 * zoom;
			const offsetY = (50 - landmark.coords.y) * 5 * zoom;
			setPan({ x: offsetX, y: offsetY });
		},
		[zoom],
	);

	// Zoom Controls
	const handleZoomIn = () =>
		setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 2.4));
	const handleZoomOut = () =>
		setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.8));
	const handleResetView = () => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
	};

	// Mouse Drag to Pan
	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.button !== 0) return; // Only left click
		setIsDragging(true);
		setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
		setHasMovedDuringDrag(false);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;
		const newX = e.clientX - dragStart.x;
		const newY = e.clientY - dragStart.y;
		// Threshold to differentiate click from drag
		if (Math.abs(newX - pan.x) > 4 || Math.abs(newY - pan.y) > 4) {
			setHasMovedDuringDrag(true);
		}
		// Bound the pan
		const maxPanX = 600 * zoom;
		const maxPanY = 400 * zoom;
		setPan({
			x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
			y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
		});
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	// Touch Pan for Mobile
	const touchStartRef = useRef<{ x: number; y: number } | null>(null);
	const handleTouchStart = (e: React.TouchEvent) => {
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			touchStartRef.current = {
				x: touch.clientX - pan.x,
				y: touch.clientY - pan.y,
			};
		}
	};
	const handleTouchMove = (e: React.TouchEvent) => {
		if (!touchStartRef.current || e.touches.length !== 1) return;
		const touch = e.touches[0];
		setPan({
			x: touch.clientX - touchStartRef.current.x,
			y: touch.clientY - touchStartRef.current.y,
		});
	};
	const handleTouchEnd = () => {
		touchStartRef.current = null;
	};

	// Mascot asset based on mood
	const mascotImgSrc =
		mascotMood === "happy"
			? "/assets/mascot/panda-happy.webp"
			: mascotMood === "confused"
				? "/assets/mascot/panda-confused.webp"
				: "/assets/mascot/panda-wave.webp";

	return (
		<div
			className={`relative w-full h-full flex flex-col bg-[#e7ebe0] text-slate-900 select-none overflow-hidden ${
				isModal
					? "rounded-3xl shadow-2xl border border-slate-300"
					: "rounded-2xl border border-[#e2e8f0]"
			}`}
		>
			{/* Standalone Header (Shown only when in modal mode or explicitly asked) */}
			{standaloneHeader && (
				<header className="h-14 shrink-0 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] px-4 sm:px-6 flex items-center justify-between gap-4 z-40">
					<div className="flex items-center gap-3">
						<img
							src="/assets/logo_unpanda.png"
							alt="Logo UNPANDA"
							className="w-8 h-8 object-contain"
						/>
						<div>
							<h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none">
								UNIVERSITAS PANDA RAYA
							</h1>
							<span className="text-[10px] text-[#75834a] font-bold uppercase tracking-wider">
								Peta Kampus Interaktif · Kawasan Hijau Berkelanjutan
							</span>
						</div>
					</div>

					{onClose && (
						<button
							type="button"
							onClick={onClose}
							aria-label="Tutup peta kampus"
							className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</header>
			)}

			{/* Main Workspace */}
			<div className="flex-1 relative overflow-hidden flex">
				{/* Backdrop on mobile for sidebar */}
				{isMobile && isSidebarOpen && (
					<button
						type="button"
						aria-label="Tutup filter overlay"
						className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
						onClick={() => setIsSidebarOpen(false)}
					/>
				)}

				{/* Left Filter Sidebar */}
				<aside
					className={`transition-all duration-300 ease-in-out shrink-0 bg-white/95 backdrop-blur-md border-r border-[#e2e8f0] flex flex-col justify-between p-3.5 ${
						isMobile
							? `fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl ${
									isSidebarOpen
										? "translate-x-0"
										: "-translate-x-full pointer-events-none"
								}`
							: `z-30 ${
									isSidebarOpen
										? "w-60 lg:w-64 translate-x-0"
										: "-translate-x-full w-0 p-0 overflow-hidden border-none pointer-events-none"
								}`
					}`}
				>
					<div className="space-y-4">
						{/* Mobile Header with close button */}
						{isMobile && (
							<div className="flex items-center justify-between pb-2 border-b border-slate-100">
								<span className="text-xs font-bold text-slate-800">
									Filter & Pencarian Lokasi
								</span>
								<button
									type="button"
									onClick={() => setIsSidebarOpen(false)}
									aria-label="Tutup filter"
									className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						)}
						{/* Search Bar */}
						<div>
							<div className="flex items-center justify-between mb-1.5">
								<span className="text-xs font-bold text-slate-800 tracking-tight">
									Pencarian Lokasi
								</span>
								<span className="text-[10px] text-slate-400 font-mono">
									{filteredLandmarks.length} Gedung
								</span>
							</div>
							<div className="relative">
								<Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Cari gedung, lab, fasilitas..."
									className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-[#f6f5ef] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#75834a]/30 focus:border-[#75834a]"
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
									>
										<X className="w-3.5 h-3.5" />
									</button>
								)}
							</div>
						</div>

						{/* Category Pills */}
						<div>
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
								Kategori Gedung
							</span>
							<div className="space-y-1">
								{CATEGORIES.map((cat) => {
									const isActive = activeCategory === cat.id;
									return (
										<button
											key={cat.id}
											type="button"
											onClick={() => setActiveCategory(cat.id)}
											className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
												isActive
													? "bg-[#566432] text-white shadow-xs"
													: "text-slate-700 hover:bg-[#f6f5ef]"
											}`}
										>
											<div className="flex items-center gap-2">
												<span>{cat.icon}</span>
												<span>{cat.label}</span>
											</div>
											{isActive && (
												<span className="w-1.5 h-1.5 rounded-full bg-[#d2ae54]" />
											)}
										</button>
									);
								})}
							</div>
						</div>
					</div>

					{/* Panda Assistant Mini Card */}
					<div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-[#75834a]/10 border border-[#d2ae54]/30 flex items-start gap-2.5">
						<img
							src={mascotImgSrc}
							alt="Panda Assistant"
							className="w-10 h-10 object-contain shrink-0 rounded-xl"
						/>
						<div className="min-w-0">
							<span className="text-[11px] font-bold text-[#566432] block leading-tight">
								Panda Assistant
							</span>
							<p className="text-[10px] text-slate-600 leading-tight mt-0.5">
								{mascotBubble}
							</p>
						</div>
					</div>
				</aside>

				{/* Map Viewport Area */}
				<main
					ref={containerRef}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					className={`flex-1 relative overflow-hidden flex items-center justify-center bg-[#dce3d2] ${
						isDragging ? "cursor-grabbing" : "cursor-grab"
					}`}
				>
					{/* Sidebar Toggle Floating Button */}
					<button
						type="button"
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						aria-label={
							isSidebarOpen ? "Sembunyikan filter" : "Tampilkan filter"
						}
						className="absolute top-4 left-4 z-30 p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
					>
						<Layers className="w-4 h-4" />
					</button>

					{/* Clean Campus Map Canvas & Marker Synchronized Transform Layer */}
					<div
						className="relative origin-center transition-transform duration-75 ease-out select-none"
						style={{
							transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
							width: "1376px",
							height: "768px",
						}}
					>
						{/* Clean Isometric Campus Art (ZERO baked UI) */}
						<img
							src="/assets/map/unpanda_campus_clean.webp"
							alt="Denah Isometrik Kampus Bersih UNPANDA"
							draggable={false}
							className="w-full h-full object-cover select-none pointer-events-none rounded-3xl shadow-2xl border-4 border-white/60"
						/>

						{/* Building Markers Overlay */}
						{filteredLandmarks.map((landmark) => {
							const isSelected = selectedLandmark?.id === landmark.id;
							return (
								<button
									key={landmark.id}
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										if (!hasMovedDuringDrag) {
											focusOnLandmark(landmark);
										}
									}}
									style={{
										left: `${landmark.coords.x}%`,
										top: `${landmark.coords.y}%`,
									}}
									className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none transition-all duration-200 cursor-pointer ${
										isSelected ? "scale-110 z-30" : "hover:scale-105"
									}`}
								>
									<div className="relative flex flex-col items-center">
										{/* Landmark Name Badge */}
										<div
											className={`px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap transition-all border ${
												isSelected
													? "bg-[#1e2412] text-[#d2ae54] border-[#d2ae54] ring-2 ring-[#d2ae54]/60 scale-105"
													: "bg-white/95 group-hover:bg-white text-slate-800 border-slate-300 group-hover:border-[#75834a]"
											}`}
										>
											<span className="text-xs">
												{landmark.category === "fakultas"
													? "🎓"
													: landmark.category === "akademik"
														? "📖"
														: landmark.category === "olahraga-seni"
															? "⚽"
															: landmark.category === "ibadah"
																? "🕌"
																: "🏢"}
											</span>
											<span className="text-[11px] font-bold tracking-tight">
												{landmark.name}
											</span>
										</div>

										{/* Interactive Pulsing Pin Dot */}
										<div className="relative mt-1 flex items-center justify-center">
											<span
												className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-colors ${
													isSelected ? "bg-[#d2ae54]" : "bg-[#75834a]"
												}`}
											/>
											{isSelected && (
												<span className="absolute -inset-1.5 rounded-full border-2 border-[#d2ae54] animate-ping" />
											)}
										</div>
									</div>
								</button>
							);
						})}
					</div>

					{/* Zoom & Reset Floating Controls */}
					<div className="absolute top-4 right-4 z-30 flex flex-col items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-300 shadow-md text-slate-700">
						<button
							type="button"
							onClick={handleZoomIn}
							aria-label="Perbesar peta"
							className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer active:scale-95"
						>
							<ZoomIn className="w-4 h-4" />
						</button>
						<button
							type="button"
							onClick={handleResetView}
							aria-label="Reset tampilan normal"
							className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer active:scale-95 text-[11px] font-bold"
						>
							<RotateCcw className="w-3.5 h-3.5" />
						</button>
						<button
							type="button"
							onClick={handleZoomOut}
							aria-label="Perkecil peta"
							className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer active:scale-95"
						>
							<ZoomOut className="w-4 h-4" />
						</button>
					</div>

					{/* Bottom Carousel: Quick Landmark Thumbnails */}
					<div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
						<div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-300 shadow-lg flex items-center gap-2 overflow-x-auto pointer-events-auto">
							<span className="text-[10px] font-extrabold text-[#566432] uppercase px-2 shrink-0">
								Gedung:
							</span>
							<div className="flex items-center gap-2">
								{CAMPUS_LANDMARKS.map((item) => {
									const isSelected = selectedLandmark?.id === item.id;
									return (
										<button
											key={item.id}
											type="button"
											onClick={() => focusOnLandmark(item)}
											className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
												isSelected
													? "bg-[#75834a] text-white border-[#75834a] shadow-xs scale-102"
													: "bg-[#f6f5ef] hover:bg-white text-slate-700 border-slate-200"
											}`}
										>
											<img
												src={item.image}
												alt={item.name}
												className="w-6 h-6 rounded-lg object-cover"
											/>
											<span>{item.name}</span>
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</main>

				{/* Backdrop on mobile for detail drawer */}
				{isMobile && selectedLandmark && isDetailOpen && (
					<button
						type="button"
						aria-label="Tutup detail drawer overlay"
						className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
						onClick={() => setIsDetailOpen(false)}
					/>
				)}

				{/* Right Building Detail Drawer */}
				{selectedLandmark && isDetailOpen && (
					<aside
						className={`bg-white border-l border-[#e2e8f0] flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 ${
							isMobile
								? "fixed top-0 bottom-0 right-0 z-50 w-full max-w-[340px]"
								: "relative z-30 w-72 sm:w-80 lg:w-96 shrink-0"
						}`}
					>
						<div>
							{/* Building Real Architectural Thumbnail */}
							<div className="relative h-44 w-full bg-slate-900 overflow-hidden">
								<img
									src={selectedLandmark.image}
									alt={selectedLandmark.name}
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
								<button
									type="button"
									onClick={() => setIsDetailOpen(false)}
									aria-label="Tutup detail gedung"
									className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
								>
									<X className="w-4 h-4" />
								</button>
								<div className="absolute bottom-3 left-4 right-4">
									<span className="px-2 py-0.5 rounded-md bg-[#d2ae54] text-[#1e2412] text-[10px] font-extrabold uppercase tracking-wider">
										{selectedLandmark.code}
									</span>
									<h2 className="text-white font-extrabold text-base sm:text-lg mt-1 tracking-tight leading-tight">
										{selectedLandmark.name}
									</h2>
									<p className="text-emerald-200/90 text-xs mt-0.5">
										{selectedLandmark.subtitle}
									</p>
								</div>
							</div>

							{/* Specs and Description */}
							<div className="p-4 space-y-4">
								<div>
									<h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
										Tentang Gedung
									</h3>
									<p className="text-xs text-slate-600 leading-relaxed font-normal">
										{selectedLandmark.description}
									</p>
								</div>

								{/* Info Tags */}
								<div className="grid grid-cols-2 gap-2 text-xs">
									<div className="bg-[#f6f5ef] p-2.5 rounded-xl border border-slate-200">
										<span className="text-[10px] text-slate-400 block font-medium">
											Jam Operasional
										</span>
										<span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1 mt-0.5">
											<Clock className="w-3 h-3 text-[#75834a]" />
											{selectedLandmark.operationalHours}
										</span>
									</div>
									<div className="bg-[#f6f5ef] p-2.5 rounded-xl border border-slate-200">
										<span className="text-[10px] text-slate-400 block font-medium">
											Struktur Bangunan
										</span>
										<span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1 mt-0.5">
											<Building className="w-3 h-3 text-[#75834a]" />
											{selectedLandmark.floors}
										</span>
									</div>
								</div>

								{/* Facilities List */}
								<div>
									<h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
										Fasilitas Utama
									</h3>
									<div className="grid grid-cols-1 gap-1.5">
										{selectedLandmark.facilities.map((fac) => (
											<div
												key={fac}
												className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl"
											>
												<span className="w-1.5 h-1.5 rounded-full bg-[#75834a]" />
												<span>{fac}</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Bottom Action Footer */}
						<div className="p-4 border-t border-[#e2e8f0] bg-slate-50 flex items-center justify-between">
							<span className="text-[11px] text-slate-500">
								Kategori: <b>{selectedLandmark.categoryLabel}</b>
							</span>
							<button
								type="button"
								onClick={() => {
									setCopiedNotice(true);
									setTimeout(() => setCopiedNotice(false), 2000);
								}}
								className="px-3 py-1.5 rounded-xl bg-[#566432] hover:bg-[#434e26] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
							>
								{copiedNotice ? (
									<>
										<Check className="w-3.5 h-3.5 text-[#d2ae54]" />
										<span>Lokasi Tersimpan!</span>
									</>
								) : (
									<>
										<MapPin className="w-3.5 h-3.5" />
										<span>Arahkan ke Sini</span>
									</>
								)}
							</button>
						</div>
					</aside>
				)}
			</div>
		</div>
	);
};
