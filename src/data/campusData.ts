export interface BuildingSlide {
	id: string;
	title: string;
	code: string;
	category: string;
	subtitle: string;
	description: string;
	image: string;
}

export interface CampusLandmark {
	id: string;
	name: string;
	code: string;
	category:
		| "fakultas"
		| "akademik"
		| "umum"
		| "terbuka"
		| "olahraga-seni"
		| "ibadah";
	categoryLabel: string;
	coords: { x: number; y: number }; // Percentage 0 - 100
	image: string;
	subtitle: string;
	description: string;
	operationalHours: string;
	floors: string;
	facilities: string[];
	quickFeatures: string[];
}

export const CAMPUS_SLIDES: BuildingSlide[] = [
	{
		id: "rektorat",
		title: "Gedung Rektorat UNPANDA",
		code: "UNP-01",
		category: "Pusat Administrasi & Manajemen",
		subtitle: "Pusat Administrasi dan Manajemen Universitas",
		description:
			"Rektorat UNPANDA merupakan pusat administrasi, manajemen birokrasi, dan pengambilan keputusan strategis universitas yang berwawasan lingkungan.",
		image: "/assets/buildings/rektorat.webp",
	},
	{
		id: "kampus-hijau",
		title: "Kampus Hijau UNPANDA",
		code: "UNP-CAMPUS",
		category: "Eco-Campus Berkelanjutan",
		subtitle: "Lansekap Kampus Masa Depan di Waktu Keemasan",
		description:
			"Kawasan kampus asri dengan 65% area hijau terbuka, terintegrasi dengan danau resapan, taman konservasi flora, dan sistem energi tenaga surya.",
		image: "/assets/buildings/kampus-hijau.webp",
	},
	{
		id: "teknologi",
		title: "Fakultas Teknologi & Sains Masa Depan",
		code: "UNP-02",
		category: "Fakultas Teknologi dan Informatika",
		subtitle: "Pusat Riset Kecerdasan Buatan & Rekayasa Hijau",
		description:
			"Pusat laboratorium mutakhir untuk pengembangan Artificial Intelligence, Data Science, Cyber Security, serta Teknologi Berkelanjutan.",
		image: "/assets/buildings/teknologi.webp",
	},
	{
		id: "panda-hub",
		title: "Panda Hub (Student Center)",
		code: "UNP-03",
		category: "Pusat Kegiatan Mahasiswa",
		subtitle: "Ekosistem Kreativitas, Co-Working & Komunitas Hijau",
		description:
			"Ruang komunal modern bagi organisasi kemahasiswaan, inkubator startup, cafe literasi, dan ruang kreasi mandiri civitas akademika.",
		image: "/assets/buildings/panda-hub.webp",
	},
	{
		id: "pustaka-panda",
		title: "Perpustakaan Pusat Pustaka Panda",
		code: "UNP-04",
		category: "Pusat Riset & Literasi",
		subtitle: "Lumbung Pengetahuan Digital & Koleksi Naskah",
		description:
			"Menyediakan lebih dari 150.000 judul referensi ilmiah digital, silent study pods, rooftop garden membaca, dan ruang arsip sejarah institusi.",
		image: "/assets/buildings/pustaka-panda.webp",
	},
];

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
	{
		id: "rektorat",
		name: "Rektorat UNPANDA",
		code: "UNP-01",
		category: "umum",
		categoryLabel: "Fasilitas Umum",
		coords: { x: 51.4, y: 35.2 },
		image: "/assets/buildings/rektorat.webp",
		subtitle: "Pusat Administrasi dan Manajemen Universitas",
		description:
			"Rektorat UNPANDA merupakan pusat administrasi, manajemen, dan pengambilan keputusan strategis universitas. Dilengkapi dengan air mancur ikonik dan auditorium utama.",
		operationalHours: "Senin - Jumat, 08:00 - 16:30 WIB",
		floors: "4 Lantai",
		facilities: [
			"Ruang Rektor & WR",
			"Ruang Senat Akademik",
			"Layanan BAAK & BAUK",
			"Auditorium Graha Panda",
		],
		quickFeatures: ["Ruang Rektor", "Ruang Senat", "Ruang Administrasi"],
	},
	{
		id: "pustaka-panda",
		name: "Pustaka Panda (Perpustakaan Pusat)",
		code: "UNP-04",
		category: "akademik",
		categoryLabel: "Fasilitas Akademik",
		coords: { x: 64.8, y: 24.4 },
		image: "/assets/buildings/pustaka-panda.webp",
		subtitle: "Pusat Riset, Literasi Digital & Bank Naskah",
		description:
			"Gedung perpustakaan ramah lingkungan dengan ventilasi alami cerdas, ratusan ribu e-journal internasional, dan silent study room berpemandangan danau.",
		operationalHours: "Senin - Sabtu, 07:30 - 20:00 WIB",
		floors: "3 Lantai + Rooftop",
		facilities: [
			"Koleksi Digital E-Library",
			"Ruang Skripsi & Tesis",
			"Discussion Pods",
			"Rooftop Garden Reading",
		],
		quickFeatures: ["E-Library", "Study Pods", "Arsip Riset"],
	},
	{
		id: "fti",
		name: "Fakultas Teknologi dan Informatika (FTI)",
		code: "UNP-02",
		category: "fakultas",
		categoryLabel: "Fakultas",
		coords: { x: 30.6, y: 33.2 },
		image: "/assets/buildings/teknologi.webp",
		subtitle: "Inkubator Sains Komputer & Rekayasa Hijau",
		description:
			"Fakultas unggulan yang menaungi Teknik Informatika, Sistem Informasi, dan Rekayasa Kecerdasan Buatan dengan fasilitas High Performance Computing.",
		operationalHours: "Senin - Sabtu, 07:00 - 21:00 WIB",
		floors: "5 Lantai",
		facilities: [
			"AI & Robotics Lab",
			"Software Engineering Hub",
			"Cybersecurity Dojo",
			"Ruang Seminar Smart Class",
		],
		quickFeatures: ["Lab AI", "Studio IoT", "Smart Class"],
	},
	{
		id: "panda-hub",
		name: "Panda Hub (Student Center)",
		code: "UNP-03",
		category: "umum",
		categoryLabel: "Fasilitas Umum",
		coords: { x: 48.5, y: 22.5 },
		image: "/assets/buildings/panda-hub.webp",
		subtitle: "Pusat Kolaborasi, BEM & Inkubasi Mahasiswa",
		description:
			"Gedung melingkar ikonik ramah energi surya yang menjadi jantung aktivitas kemahasiswaan, bazar kampus, dan ruang santai interdisipliner.",
		operationalHours: "Buka Setiap Hari, 06:00 - 22:00 WIB",
		floors: "3 Lantai",
		facilities: [
			"Sekretariat BEM & UKM",
			"Food Court Kantin Sehat",
			"Co-Working Arena",
			"Mini Amphitheater",
		],
		quickFeatures: ["Kantin Sehat", "Co-Working", "Ruang UKM"],
	},
	{
		id: "gkt",
		name: "Gedung Kuliah Terpadu (GKT)",
		code: "UNP-05",
		category: "akademik",
		categoryLabel: "Fasilitas Akademik",
		coords: { x: 67.7, y: 37.1 },
		image: "/assets/buildings/kampus-hijau.webp",
		subtitle: "Ruang Perkuliahan Modern & Laboratorium Dasar",
		description:
			"Gedung kelas terpadu berkapasitas 3.500 mahasiswa dilengkapi papan interaktif digital, pencahayaan alami ramah mata, dan lift hemat energi.",
		operationalHours: "Senin - Jumat, 07:00 - 18:00 WIB",
		floors: "6 Lantai",
		facilities: [
			"50 Smart Classroom",
			"Lab Komputasi Dasar",
			"Auditorium Kuliah Umum",
			"Lounge Dosen Pengajar",
		],
		quickFeatures: ["Ruang Kuliah", "Lab Dasar", "Lounge Dosen"],
	},
	{
		id: "sport-center",
		name: "Panda Sport Center",
		code: "UNP-06",
		category: "olahraga-seni",
		categoryLabel: "Olahraga & Seni",
		coords: { x: 29.3, y: 53.2 },
		image: "/assets/buildings/panda-hub.webp",
		subtitle: "Gelanggang Olahraga & Kebugaran Mahasiswa",
		description:
			"Fasilitas atletik standar internasional mencakup lapangan sepakbola rumput alami, lintasan lari sintetis, lapangan bulu tangkis indoor, dan fitness center.",
		operationalHours: "Setiap Hari, 06:00 - 21:00 WIB",
		floors: "Indoor Gymnasium & Outdoor Track",
		facilities: [
			"Lapangan Sepakbola",
			"Running Track Sintetis",
			"Gelanggang Indoor",
			"Fitness & Wellness Gym",
		],
		quickFeatures: ["Stadion", "Track Lari", "Gymnasium"],
	},
	{
		id: "masjid",
		name: "Masjid Kampus Al-Panda",
		code: "UNP-07",
		category: "ibadah",
		categoryLabel: "Ibadah & Rohani",
		coords: { x: 54.0, y: 56.2 },
		image: "/assets/buildings/rektorat.webp",
		subtitle: "Pusat Pembinaan Karakter & Ibadah Civitas",
		description:
			"Masjid dengan kubah hijau khas UNPANDA yang sejuk, dikelilingi kolam resapan air wudhu daur ulang, menampung hingga 2.000 jamaah.",
		operationalHours: "Buka 24 Jam untuk Civitas",
		floors: "2 Lantai",
		facilities: [
			"Ruang Shalat Utama",
			"Perpustakaan Islam",
			"Ruang Konseling Rohani",
			"Taman Wudhu Sejuk",
		],
		quickFeatures: ["Ruang Shalat", "Kajian Ilmiah", "Air Wudhu Bersih"],
	},
	{
		id: "riset",
		name: "Pusat Riset dan Inovasi",
		code: "UNP-08",
		category: "akademik",
		categoryLabel: "Fasilitas Akademik",
		coords: { x: 69.0, y: 57.6 },
		image: "/assets/buildings/teknologi.webp",
		subtitle: "Laboratorium Sains Terapan & Hilirisasi Produk",
		description:
			"Pusat kolaborasi riset dosen dan mahasiswa dengan industri mitra dalam bidang energi terbarukan, bioteknologi, dan kecerdasan artifisial.",
		operationalHours: "Senin - Sabtu, 08:00 - 20:00 WIB",
		floors: "4 Lantai",
		facilities: [
			"Clean Room Lab",
			"Paten & HKI Helpdesk",
			"Inkubator Bisnis Hilirisasi",
			"Makerspace 3D Printing",
		],
		quickFeatures: ["Pusat Inovasi", "Lab Riset", "Makerspace"],
	},
	{
		id: "taman",
		name: "Area Hijau Taman Panda & Danau",
		code: "UNP-09",
		category: "terbuka",
		categoryLabel: "Ruang Terbuka",
		coords: { x: 85.9, y: 60.5 },
		image: "/assets/buildings/kampus-hijau.webp",
		subtitle: "Kawasan Konservasi & Relaksasi Kampus",
		description:
			"Kawasan ruang terbuka hijau seluas 8 hektar yang menjadi paru-paru kampus, dilengkapi jembatan kayu estetik, gazebo diskusi terbuka, dan habitat burung lokal.",
		operationalHours: "Buka Setiap Hari untuk Umum",
		floors: "Kawasan Terbuka",
		facilities: [
			"Gazebo Belajar Luar Ruang",
			"Jogging Track Danau",
			"Kebun Tanaman Obat Kampus",
			"Spot Foto Sunrise",
		],
		quickFeatures: ["Danau UNPANDA", "Gazebo Luar Ruang", "Jogging Track"],
	},
	{
		id: "asrama",
		name: "Asrama Mahasiswa Panda Residence",
		code: "UNP-10",
		category: "umum",
		categoryLabel: "Fasilitas Umum",
		coords: { x: 27.3, y: 20.0 },
		image: "/assets/buildings/panda-hub.webp",
		subtitle: "Hunian Nyaman Mahasiswa Baru & Penerima Beasiswa",
		description:
			"Hunian modern terjangkau dengan koneksi Wi-Fi gigabit 24 jam, sistem kartu akses pintar, dapur bersama, dan ruang belajar komunal di setiap lantai.",
		operationalHours: "Akses 24 Jam (Khusus Penghuni Terdaftar)",
		floors: "5 Lantai (Gedung Putra & Putri)",
		facilities: [
			"Kamar AC & Kamar Mandi Dalam",
			"Study Lounge 24 Jam",
			"Laundry Koin Hijau",
			"Minimarket Kampus",
		],
		quickFeatures: ["Kamar Modern", "Wi-Fi Cepat", "Security 24 Jam"],
	},
];

export const ACADEMIC_FACTS = [
	"UNPANDA menduduki peringkat Top 5 Kampus Hijau Berkelanjutan di Indonesia! 🌿",
	"Seluruh gedung UNPANDA menggunakan sistem pencahayaan alami hemat energi 💡",
	"KRS Online UNPANDA terintegrasi otomatis dengan transkrip nilai dan sistem MBKM 🎓",
	"Perpustakaan Pustaka Panda memiliki akses ke jutaan jurnal internasional gratis untuk mahasiswa 📚",
	"Panda Hub buka hingga pukul 22:00 WIB untuk ruang diskusi kelompok dan inkubasi startup 🚀",
	"Tahukah kamu? Maskot Panda UNPANDA memakai caping tradisional sebagai simbol kearifan lokal & kerja keras! 🎋",
];
