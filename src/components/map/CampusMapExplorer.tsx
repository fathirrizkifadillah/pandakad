import {
	Building,
	Clock,
	RotateCcw,
	Search,
	X,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { CAMPUS_LANDMARKS, type CampusLandmark } from "../../data/campusData";

interface CampusMapExplorerProps {
	onClose?: () => void;
	isModal?: boolean;
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
	{ id: "semua", label: "Semua", icon: "🏛️" },
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
}) => {
	const [activeCategory, setActiveCategory] = useState<MapCategory>("semua");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLandmark, setSelectedLandmark] =
		useState<CampusLandmark | null>(CAMPUS_LANDMARKS[0]);
	const [zoomLevel, setZoomLevel] = useState(1);
	const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");

	// Filter landmarks based on category and search query
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

	const handleZoomIn = () =>
		setZoomLevel((prev) => Math.min(Number((prev + 0.2).toFixed(1)), 1.8));
	const handleZoomOut = () =>
		setZoomLevel((prev) => Math.max(Number((prev - 0.2).toFixed(1)), 0.8));
	const handleResetZoom = () => setZoomLevel(1);

	return (
		<div
			className={`relative w-full h-full flex flex-col bg-[#e7ebe0] text-slate-900 select-none overflow-hidden ${
				isModal ? "rounded-3xl shadow-2xl border border-slate-300" : ""
			}`}
		>
			{/* Top Bar Navigation */}
			<header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] px-4 sm:px-6 flex items-center justify-between gap-4 z-40">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-white border border-[#75834a]/30 p-1 flex items-center justify-center shadow-xs">
						<img
							src="/assets/logo_unpanda.png"
							alt="Logo UNPANDA"
							className="w-full h-full object-contain"
						/>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
								UNIVERSITAS PANDA RAYA
							</h1>
							<span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#75834a]/15 text-[#566432] text-[10px] font-extrabold">
								PETA KAMPUS INTERAKTIF
							</span>
						</div>
						<p className="text-[11px] text-slate-500 font-normal mt-0.5">
							Denah Isometrik Kawasan Akademik Hijau & Cerdas
						</p>
					</div>
				</div>

				{/* Search & Actions */}
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="relative hidden md:block w-64 lg:w-80">
						<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Cari gedung, lab, atau fasilitas..."
							className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-[#f6f5ef] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#75834a]/40 focus:border-[#75834a]"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					{onClose && (
						<button
							type="button"
							onClick={onClose}
							aria-label="Tutup peta kampus"
							className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95"
						>
							<X className="w-5 h-5" />
						</button>
					)}
				</div>
			</header>

			{/* Main Workspace Area (Sidebar + Map Canvas + Detail Drawer) */}
			<div className="flex-1 relative overflow-hidden flex">
				{/* Left Filter Sidebar */}
				<aside className="hidden lg:flex w-64 bg-white/95 backdrop-blur-md border-r border-[#e2e8f0] flex-col justify-between p-4 z-30 shrink-0">
					<div>
						<div className="mb-4">
							<h2 className="text-sm font-bold text-slate-900">
								Jelajahi Kampus
							</h2>
							<p className="text-[11px] text-slate-500 mt-0.5">
								Klik gedung untuk melihat rincian fasilitas
							</p>
						</div>

						{/* Category List */}
						<div className="space-y-1">
							{CATEGORIES.map((cat) => {
								const isActive = activeCategory === cat.id;
								return (
									<button
										key={cat.id}
										type="button"
										onClick={() => setActiveCategory(cat.id)}
										className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
											isActive
												? "bg-[#566432] text-white shadow-xs"
												: "text-slate-700 hover:bg-[#f6f5ef]"
										}`}
									>
										<span className="text-sm">{cat.icon}</span>
										<span>{cat.label}</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Panda Assistant Mini Card */}
					<div className="bg-[#f6f5ef] border border-[#d2ae54]/30 rounded-2xl p-3 flex items-center gap-3">
						<img
							src="/assets/mascot/panda-map.webp"
							alt="Panda Pemandu Kampus"
							className="w-12 h-12 object-contain shrink-0"
						/>
						<div>
							<span className="text-[11px] font-bold text-[#566432] block">
								Panda Pemandu
							</span>
							<p className="text-[10px] text-slate-600 leading-tight mt-0.5">
								Klik pin kuning di denah untuk informasi ruangan & lab!
							</p>
						</div>
					</div>
				</aside>

				{/* Map Interactive Canvas Container */}
				<main className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-900">
					{/* Scrollable / Scalable Container */}
					<div
						className="relative w-full h-full overflow-auto flex items-center justify-center p-4 transition-transform duration-300 ease-out"
						style={{
							cursor: zoomLevel > 1 ? "grab" : "default",
						}}
					>
						<div
							className="relative w-full max-w-[1280px] aspect-[1536/1024] shadow-2xl rounded-2xl overflow-hidden origin-center transition-transform duration-300"
							style={{
								transform: `scale(${zoomLevel})`,
							}}
						>
							{/* Isometric Base Map Image */}
							<img
								src="/assets/map/peta-unpanda.webp"
								alt="Peta Interaktif Kampus Universitas Panda Raya"
								className="w-full h-full object-cover select-none pointer-events-none"
							/>

							{/* Interactive Pins Overlay */}
							{filteredLandmarks.map((landmark) => {
								const isSelected = selectedLandmark?.id === landmark.id;
								return (
									<button
										key={landmark.id}
										type="button"
										onClick={() => setSelectedLandmark(landmark)}
										style={{
											left: `${landmark.coords.x}%`,
											top: `${landmark.coords.y}%`,
										}}
										className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none transition-transform duration-200 ${
											isSelected ? "scale-110 z-30" : "hover:scale-105"
										}`}
									>
										{/* Pin Marker with Pulsing Ring */}
										<div className="relative flex flex-col items-center">
											{/* Marker Badge with Name */}
											<div
												className={`px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap transition-all border ${
													isSelected
														? "bg-[#1e2412] text-[#d2ae54] border-[#d2ae54] ring-2 ring-[#d2ae54]/50 scale-105"
														: "bg-white/90 group-hover:bg-white text-slate-800 border-slate-300"
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

											{/* Indicator Dot */}
											<div className="relative mt-1 flex items-center justify-center">
												<span
													className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
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
					</div>

					{/* Map Control Floating Buttons (Zoom & 2D/3D toggle) */}
					<div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-2">
						{/* 2D / 3D Toggle */}
						<div className="bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-300 shadow-md flex items-center gap-1 text-xs font-bold text-slate-700">
							<button
								type="button"
								onClick={() => setViewMode("2D")}
								className={`px-2.5 py-1 rounded-lg transition-all ${
									viewMode === "2D"
										? "bg-[#566432] text-white"
										: "hover:bg-slate-100"
								}`}
							>
								2D
							</button>
							<button
								type="button"
								onClick={() => setViewMode("3D")}
								className={`px-2.5 py-1 rounded-lg transition-all ${
									viewMode === "3D"
										? "bg-[#566432] text-white"
										: "hover:bg-slate-100"
								}`}
							>
								3D
							</button>
						</div>

						{/* Zoom Buttons */}
						<div className="bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-300 shadow-md flex flex-col items-center gap-1 text-slate-700">
							<button
								type="button"
								onClick={handleZoomIn}
								aria-label="Perbesar peta"
								className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer active:scale-95"
							>
								<ZoomIn className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={handleResetZoom}
								aria-label="Kembalikan ukuran normal"
								className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer active:scale-95 text-[11px] font-bold"
							>
								<RotateCcw className="w-3.5 h-3.5" />
							</button>
							<button
								type="button"
								onClick={handleZoomOut}
								aria-label="Perkecil peta"
								className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer active:scale-95"
							>
								<ZoomOut className="w-4 h-4" />
							</button>
						</div>
					</div>

					{/* Bottom Carousel / Quick Landmark Strip */}
					<div className="absolute bottom-4 left-4 right-20 lg:left-6 lg:right-32 z-30 pointer-events-auto">
						<div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-300/80 shadow-lg flex items-center gap-2 overflow-x-auto">
							<span className="text-[10px] font-extrabold text-[#566432] uppercase px-2 shrink-0">
								Gedung:
							</span>
							<div className="flex items-center gap-2">
								{CAMPUS_LANDMARKS.slice(0, 6).map((item) => {
									const isSelected = selectedLandmark?.id === item.id;
									return (
										<button
											key={item.id}
											type="button"
											onClick={() => setSelectedLandmark(item)}
											className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
												isSelected
													? "bg-[#75834a] text-white border-[#75834a] shadow-xs"
													: "bg-[#f6f5ef] hover:bg-white text-slate-700 border-slate-200"
											}`}
										>
											<img
												src={item.image}
												alt={item.name}
												className="w-5 h-5 rounded-md object-cover"
											/>
											<span>{item.name}</span>
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</main>

				{/* Right Detail Drawer */}
				{selectedLandmark && (
					<aside className="w-80 sm:w-96 bg-white/98 backdrop-blur-lg border-l border-[#e2e8f0] flex flex-col justify-between shadow-xl z-40 overflow-y-auto">
						<div>
							{/* Building Real Photo */}
							<div className="relative h-48 w-full bg-slate-900 overflow-hidden">
								<img
									src={selectedLandmark.image}
									alt={selectedLandmark.name}
									className="w-full h-full object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
								<button
									type="button"
									onClick={() => setSelectedLandmark(null)}
									aria-label="Tutup detail gedung"
									className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
								>
									<X className="w-4 h-4" />
								</button>
								<div className="absolute bottom-3 left-4 right-4">
									<span className="px-2 py-0.5 rounded-md bg-[#d2ae54] text-[#1e2412] text-[10px] font-extrabold uppercase tracking-wider">
										{selectedLandmark.code}
									</span>
									<h2 className="text-white font-extrabold text-lg mt-1 tracking-tight leading-tight">
										{selectedLandmark.name}
									</h2>
									<p className="text-emerald-200/90 text-xs mt-0.5">
										{selectedLandmark.subtitle}
									</p>
								</div>
							</div>

							{/* Building Specs & Operational Info */}
							<div className="p-4 sm:p-5 space-y-4">
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
								onClick={() =>
									alert(
										`Navigasi ke ${selectedLandmark.name} telah diaktifkan di jadwal akademik!`,
									)
								}
								className="px-3.5 py-1.5 rounded-xl bg-[#566432] hover:bg-[#434e26] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
							>
								Jelajahi Ruangan →
							</button>
						</div>
					</aside>
				)}
			</div>
		</div>
	);
};
