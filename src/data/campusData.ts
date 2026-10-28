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
	coords: { x: number; y: number }; // Percentage 0 - 100 on 1376x768 clean map
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
		coords: { x: 53.5, y: 38.5 },
		image: "/assets/buildings/rektorat.webp",
		subtitle: "Pusat Administrasi & Rektorat Eksekutif",
		description:
			"Rektorat UNPANDA merupakan pusat kendali institusi, manajemen birokrasi, dan senat akademik. Berada di titik pusat kampus dengan pelataran air mancur ikonik.",
		operationalHours: "Senin - Jumat, 08:00 - 16:30 WIB",
		floors: "4 Lantai + Graha Utama",
		facilities: [
			"Ruang Rektor & Para Wakil Rektor",
			"Layanan BAAK & BAUK Terpadu",
			"Ruang Sidang Senat Akademik",
			"Auditorium Graha Panda",
		],
		quickFeatures: ["Ruang Rektor", "Ruang Senat", "Layanan BAAK"],
	},
	{
		id: "panda-hub",
		name: "Panda Hub (Student Center)",
		code: "UNP-03",
		category: "umum",
		categoryLabel: "Fasilitas Umum",
		coords: { x: 15.5, y: 48.0 },
		image: "/assets/buildings/panda-hub.webp",
		subtitle: "Pusat Kolaborasi, BEM, UKM & Coworking",
		description:
			"Gedung melingkar bertenaga panel surya yang menjadi episentrum kreativitas mahasiswa, inkubasi startup kampus, dan food court ramah lingkungan.",
		operationalHours: "Buka Setiap Hari, 06:00 - 22:00 WIB",
		floors: "3 Lantai Melingkar",
		facilities: [
			"Sekretariat BEM & 30+ UKM Kampus",
			"Green Food Court & Cafe Literasi",
			"Coworking Space Gigabit Wi-Fi",
			"Amphitheater Mahasiswa",
		],
		quickFeatures: ["Kantin Sehat", "Coworking", "Ruang BEM"],
	},
	{
		id: "fti",
		name: "Fakultas Teknologi & Informatika (FTI)",
		code: "UNP-02",
		category: "fakultas",
		categoryLabel: "Fakultas",
		coords: { x: 30.0, y: 55.5 },
		image: "/assets/buildings/teknologi.webp",
		subtitle: "Fakultas Komputasi & Rekayasa Hijau",
		description:
			"Gedung kubik futuristik berkaca ganda dengan rooftop sky-garden. Menampung lab AI, robotika, rekayasa perangkat lunak, dan smart classroom.",
		operationalHours: "Senin - Sabtu, 07:00 - 21:00 WIB",
		floors: "5 Lantai + Rooftop Garden",
		facilities: [
			"High-Performance Computing AI Lab",
			"Robotics & Autonomous Systems Hub",
			"Cyber Security Operations Dojo",
			"Smart Multimedia Classrooms",
		],
		quickFeatures: ["Lab AI", "Studio IoT", "Smart Class"],
	},
	{
		id: "pustaka-panda",
		name: "Perpustakaan Pustaka Panda",
		code: "UNP-04",
		category: "akademik",
		categoryLabel: "Fasilitas Akademik",
		coords: { x: 43.0, y: 28.5 },
		image: "/assets/buildings/pustaka-panda.webp",
		subtitle: "Lumbung Riset Digital & Koleksi Naskah",
		description:
			"Perpustakaan pusat dengan sertifikasi green building. Menyediakan ratusan ribu e-book, repositori skripsi/jurnal, dan ruang hening baca mandiri.",
		operationalHours: "Senin - Sabtu, 07:30 - 20:30 WIB",
		floors: "3 Lantai + Skybridge",
		facilities: [
			"Repositori Ilmiah E-Library 24 Jam",
			"Silent Study Pods Ber-AC",
			"Ruang Diskusi Multimedia",
			"Koleksi Naskah Khusus & Arsip",
		],
		quickFeatures: ["E-Library", "Study Pods", "Arsip Riset"],
	},
	{
		id: "gkt",
		name: "Gedung Kuliah Terpadu (GKT)",
		code: "UNP-05",
		category: "akademik",
		categoryLabel: "Fasilitas Akademik",
		coords: { x: 61.0, y: 26.5 },
		image: "/assets/buildings/gkt-kuliah.webp",
		subtitle: "Kompleks Ruang Kuliah & Lab Komputasi",
		description:
			"Kompleks gedung bertingkat yang saling terhubung jembatan layang kaca, dirancang untuk efisiensi mobilitas antarkelas dan pertukaran disiplin ilmu.",
		operationalHours: "Senin - Jumat, 07:00 - 18:00 WIB",
		floors: "6 Lantai (Wing A, B, C)",
		facilities: [
			"60 Smart Classrooms Interaktif",
			"Laboratorium Komputasi Dasar",
			"Lounge Dosen & Ruang Asistensi",
			"Auditorium Kuliah Tamu",
		],
		quickFeatures: ["Ruang Kuliah", "Lab Komputer", "Lounge Dosen"],
	},
	{
		id: "riset",
		name: "Pusat Riset dan Inovasi",
		code: "UNP-08",
		category: "akademik",
		categoryLabel: "Fasilitas Akademik",
		coords: { x: 37.5, y: 39.0 },
		image: "/assets/buildings/riset-inovasi.webp",
		subtitle: "Laboratorium Sains Terapan & Hilirisasi",
		description:
			"Fasilitas penelitian multidisiplin untuk dosen dan peneliti mahasiswa, berfokus pada teknologi energi terbarukan, data science, dan bioteknologi hijau.",
		operationalHours: "Senin - Sabtu, 08:00 - 20:00 WIB",
		floors: "4 Lantai",
		facilities: [
			"Clean Room Nanoteknologi",
			"Inkubator Produk Hilirisasi",
			"Makerspace 3D Rapid Prototyping",
			"Pusat Paten & Hak Kekayaan Intelektual",
		],
		quickFeatures: ["Pusat Inovasi", "Clean Room", "Makerspace"],
	},
	{
		id: "sport-center",
		name: "Panda Sport Center & Stadium",
		code: "UNP-06",
		category: "olahraga-seni",
		categoryLabel: "Olahraga & Seni",
		coords: { x: 83.5, y: 35.0 },
		image: "/assets/buildings/sport-center.webp",
		subtitle: "Stadion Sepakbola & Gelanggang Atletik",
		description:
			"Kompleks olahraga terpadu berstandar internasional dengan lapangan sepakbola rumput alami, lintasan atletik sintetis, dan tribun penonton tertutup.",
		operationalHours: "Setiap Hari, 06:00 - 21:00 WIB",
		floors: "Stadion Utama & Indoor Hall",
		facilities: [
			"Lapangan Sepakbola Standar FIFA",
			"Lintasan Lari Sintetis 8 Jalur",
			"Gelanggang Bulutangkis & Basket Indoor",
			"Fitness Center & Sauna Pemulihan",
		],
		quickFeatures: ["Stadion", "Track Lari", "Gymnasium"],
	},
	{
		id: "masjid",
		name: "Masjid Kampus Al-Panda",
		code: "UNP-07",
		category: "ibadah",
		categoryLabel: "Ibadah & Rohani",
		coords: { x: 88.0, y: 52.5 },
		image: "/assets/buildings/masjid-alpanda.webp",
		subtitle: "Pusat Ibadah, Kajian & Kebajikan",
		description:
			"Masjid berarsitektur kubah hijau anggun di tepi danau kampus, dilengkapi kolam resapan sejuk dan sirkulasi udara alami yang menyejukkan hati.",
		operationalHours: "Buka 24 Jam untuk Civitas",
		floors: "2 Lantai Utama + Menara",
		facilities: [
			"Ruang Shalat Utama Kapasitas 2.500 Jamaah",
			"Perpustakaan Studi Islam",
			"Area Wudhu Ramah Lansia & Disabilitas",
			"Ruang Konseling & Bimbingan Rohani",
		],
		quickFeatures: ["Ruang Shalat", "Tepi Danau", "Kajian Ilmiah"],
	},
	{
		id: "taman",
		name: "Taman Konservasi & Danau UNPANDA",
		code: "UNP-09",
		category: "terbuka",
		categoryLabel: "Ruang Terbuka",
		coords: { x: 75.0, y: 72.0 },
		image: "/assets/buildings/taman-danau.webp",
		subtitle: "Danau Resapan & Zona Biodiversitas",
		description:
			"Kawasan danau alami dan taman konservasi flora seluas 6 hektar dengan jembatan kayu estetik, jalur jogging tepi air, dan gazebo diskusi terbuka.",
		operationalHours: "Buka Setiap Hari untuk Umum",
		floors: "Kawasan Alam Terbuka",
		facilities: [
			"Danau Alami & Penampung Air Hujan",
			"Jembatan Kayu Kanopi Estetik",
			"Gazebo Belajar Luar Ruang Wi-Fi",
			"Kebun Bibit Bambu & Tanaman Langka",
		],
		quickFeatures: ["Danau Alami", "Jembatan Kayu", "Jogging Track"],
	},
	{
		id: "gerbang",
		name: "Gerbang Utama & Boulevard Kampus",
		code: "UNP-10",
		category: "umum",
		categoryLabel: "Fasilitas Umum",
		coords: { x: 48.5, y: 83.0 },
		image: "/assets/buildings/gerbang-boulevard.webp",
		subtitle: "Pintu Masuk Utama & Halte Bus Listrik",
		description:
			"Pintu gerbang kehormatan Universitas Panda Raya dengan jalur hijau boulevard ganda, jalur sepeda mandiri, dan halte bus listrik kampus.",
		operationalHours: "Akses 24 Jam dengan Portal RFID",
		floors: "Boulevard Terpadu",
		facilities: [
			"Pos Keamanan & Satpam 24 Jam",
			"Halte Bus Listrik Kampus UNPANDA",
			"Jalur Khusus Sepeda & Pejalan Kaki",
			"Gerbang RFID Smart Access",
		],
		quickFeatures: ["Halte Bus", "Jalur Sepeda", "Pos Keamanan"],
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
