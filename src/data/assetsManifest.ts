export interface AssetManifestItem {
	filename: string;
	sourceAsset: string;
	processingMethod: string;
	intendedUse: string;
	transparencyStatus: "Transparent RGBA" | "Opaque RGB";
	dimensions: string;
	fileSizeKB: number;
}

export const UNPANDA_ASSET_MANIFEST: AssetManifestItem[] = [
	// Clean Map Artwork
	{
		filename: "/assets/map/unpanda_campus_clean.webp",
		sourceAsset: "assets/animation/Peta Interaktif Kampus UNPANDA.png",
		processingMethod: "Clean AI isometric illustration crop, zero UI overlays",
		intendedUse: "Interactive campus map background canvas",
		transparencyStatus: "Opaque RGB",
		dimensions: "1376x768",
		fileSizeKB: 339,
	},
	// Buildings
	{
		filename: "/assets/buildings/rektorat.webp",
		sourceAsset: "assets/bangunan/Gedung Rektorat Universitas Panda Raya.png",
		processingMethod: "Lossy WebP compression (q=85), aspect ratio preserved",
		intendedUse: "Slideshow & Rektorat detail panel",
		transparencyStatus: "Opaque RGB",
		dimensions: "1672x941",
		fileSizeKB: 400,
	},
	{
		filename: "/assets/buildings/pustaka-panda.webp",
		sourceAsset: "assets/bangunan/Perpustakaan Pusat Pustaka Panda UNPANDA.png",
		processingMethod: "Lossy WebP compression (q=85), aspect ratio preserved",
		intendedUse: "Slideshow & Pustaka Panda detail panel",
		transparencyStatus: "Opaque RGB",
		dimensions: "1672x941",
		fileSizeKB: 428,
	},
	{
		filename: "/assets/buildings/teknologi.webp",
		sourceAsset:
			"assets/bangunan/Kampus Teknologi Futuristik Berkelanjutan.png",
		processingMethod: "Lossy WebP compression (q=85), aspect ratio preserved",
		intendedUse: "Slideshow & FTI detail panel",
		transparencyStatus: "Opaque RGB",
		dimensions: "1670x941",
		fileSizeKB: 467,
	},
	{
		filename: "/assets/buildings/panda-hub.webp",
		sourceAsset: "assets/bangunan/Panda Hub_ Pusat Mahasiswa Hijau.png",
		processingMethod: "Lossy WebP compression (q=85), aspect ratio preserved",
		intendedUse: "Slideshow & Student Center detail panel",
		transparencyStatus: "Opaque RGB",
		dimensions: "1671x941",
		fileSizeKB: 493,
	},
	{
		filename: "/assets/buildings/sport-center.webp",
		sourceAsset: "Isometric Campus Model",
		processingMethod: "High-resolution architectural crop & WebP export",
		intendedUse: "Sport Center & Track detail card",
		transparencyStatus: "Opaque RGB",
		dimensions: "358x200",
		fileSizeKB: 84,
	},
	{
		filename: "/assets/buildings/masjid-alpanda.webp",
		sourceAsset: "Isometric Campus Model",
		processingMethod: "High-resolution architectural crop & WebP export",
		intendedUse: "Masjid Al-Panda detail card",
		transparencyStatus: "Opaque RGB",
		dimensions: "248x192",
		fileSizeKB: 68,
	},
	{
		filename: "/assets/buildings/taman-danau.webp",
		sourceAsset: "Isometric Campus Model",
		processingMethod: "High-resolution architectural crop & WebP export",
		intendedUse: "Taman Konservasi & Danau detail card",
		transparencyStatus: "Opaque RGB",
		dimensions: "413x253",
		fileSizeKB: 92,
	},
	{
		filename: "/assets/buildings/gkt-kuliah.webp",
		sourceAsset: "Isometric Campus Model",
		processingMethod: "High-resolution architectural crop & WebP export",
		intendedUse: "Gedung Kuliah Terpadu detail card",
		transparencyStatus: "Opaque RGB",
		dimensions: "344x154",
		fileSizeKB: 76,
	},
	{
		filename: "/assets/buildings/riset-inovasi.webp",
		sourceAsset: "Isometric Campus Model",
		processingMethod: "High-resolution architectural crop & WebP export",
		intendedUse: "Pusat Riset dan Inovasi detail card",
		transparencyStatus: "Opaque RGB",
		dimensions: "275x154",
		fileSizeKB: 62,
	},
	// Mascot Poses
	{
		filename: "/assets/mascot/panda_mascot_clean_transparent.png",
		sourceAsset: "assets/maskot_unpanda.png",
		processingMethod:
			"Flood-fill checkerboard removal, boundary-preserving alpha channel",
		intendedUse: "Primary high-resolution transparent standalone mascot",
		transparencyStatus: "Transparent RGBA",
		dimensions: "1271x1238",
		fileSizeKB: 840,
	},
	{
		filename: "/assets/mascot/panda-idle.webp",
		sourceAsset:
			"assets/animation/Panduan Karakter Panda Assistant UNPANDA.png",
		processingMethod: "Precise bounding box crop & background keying",
		intendedUse: "Mascot Idle state",
		transparencyStatus: "Transparent RGBA",
		dimensions: "195x205",
		fileSizeKB: 14,
	},
	{
		filename: "/assets/mascot/panda-wave.webp",
		sourceAsset:
			"assets/animation/Panduan Karakter Panda Assistant UNPANDA.png",
		processingMethod: "Precise bounding box crop & background keying",
		intendedUse: "Mascot Greeting/Welcome state",
		transparencyStatus: "Transparent RGBA",
		dimensions: "200x205",
		fileSizeKB: 15,
	},
	{
		filename: "/assets/mascot/panda-happy.webp",
		sourceAsset:
			"assets/animation/Panduan Karakter Panda Assistant UNPANDA.png",
		processingMethod: "Precise bounding box crop & background keying",
		intendedUse: "Mascot Success/Joy state",
		transparencyStatus: "Transparent RGBA",
		dimensions: "205x205",
		fileSizeKB: 16,
	},
	{
		filename: "/assets/mascot/panda-confused.webp",
		sourceAsset:
			"assets/animation/Panduan Karakter Panda Assistant UNPANDA.png",
		processingMethod: "Precise bounding box crop & background keying",
		intendedUse: "Mascot Question/No results state",
		transparencyStatus: "Transparent RGBA",
		dimensions: "200x205",
		fileSizeKB: 14,
	},
	{
		filename: "/assets/mascot/panda-oops.webp",
		sourceAsset:
			"assets/animation/Panduan Karakter Panda Assistant UNPANDA.png",
		processingMethod: "Precise bounding box crop & background keying",
		intendedUse: "Mascot Error/Oops state",
		transparencyStatus: "Transparent RGBA",
		dimensions: "200x205",
		fileSizeKB: 14,
	},
	{
		filename: "/assets/mascot/panda-study.webp",
		sourceAsset:
			"assets/animation/Panduan Karakter Panda Assistant UNPANDA.png",
		processingMethod: "Crop & keying of laptop studying pose",
		intendedUse: "Panda Loading Screen & academic study helper",
		transparencyStatus: "Transparent RGBA",
		dimensions: "120x150",
		fileSizeKB: 8,
	},
	{
		filename: "/assets/mascot/panda-toga.webp",
		sourceAsset:
			"assets/animation/Panduan Karakter Panda Assistant UNPANDA.png",
		processingMethod: "Crop & keying of graduation toga pose",
		intendedUse: "Achievement celebration & graduation milestones",
		transparencyStatus: "Transparent RGBA",
		dimensions: "130x130",
		fileSizeKB: 9,
	},
];
