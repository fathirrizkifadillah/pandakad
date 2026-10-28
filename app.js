import screens from "./screens.json";

const image = document.querySelector("#screen-image");
const hotspots = document.querySelector("#hotspots");
const pageTitle = document.querySelector("#page-title");

let active = 0;
let selectedRole = "Mahasiswa";

// Cache preloaded images to ensure instant transitions
const preloadedImages = new Set();
function preloadImage(src) {
	if (!src || preloadedImages.has(src)) return;
	preloadedImages.add(src);
	const img = new Image();
	img.src = src;
}

function preloadAdjacentScreens(index) {
	const prev = (index + screens.length - 1) % screens.length;
	const next = (index + 1) % screens.length;
	if (screens[prev]) preloadImage(screens[prev].src);
	if (screens[next]) preloadImage(screens[next].src);
}

function getRequestedScreenIndex() {
	const requested =
		Number(new URLSearchParams(window.location.search).get("screen")) - 1;
	return Number.isInteger(requested) &&
		requested >= 0 &&
		requested < screens.length
		? requested
		: 0;
}

function goTo(index, { pushHistory = true } = {}) {
	active = Math.max(0, Math.min(screens.length - 1, index));
	const screen = screens[active];
	if (!screen) return;

	window.scrollTo(0, 0);
	image.src = screen.src;
	image.alt = `${screen.name} · tampilan portal akademik`;
	pageTitle.textContent = screen.name;
	document.title = `${screen.name} · UNPANDA`;

	buildHotspots(screen);

	const url = new URL(window.location.href);
	url.searchParams.set("screen", String(active + 1));

	if (pushHistory) {
		window.history.pushState({ screenIndex: active }, "", url);
	} else {
		window.history.replaceState({ screenIndex: active }, "", url);
	}

	preloadAdjacentScreens(active);
}

function addHotspot(
	screen,
	{ x, y, w, h, label, target, onClick, className = "" },
) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = `hotspot ${className}`.trim();
	button.setAttribute("aria-label", label);
	button.title = label;
	button.style.left = `${(x / screen.w) * 100}%`;
	button.style.top = `${(y / screen.h) * 100}%`;
	button.style.width = `${(w / screen.w) * 100}%`;
	button.style.height = `${(h / screen.h) * 100}%`;

	if (typeof target === "number" && screens[target]) {
		preloadImage(screens[target].src);
	}

	button.addEventListener("click", onClick || (() => goTo(target)));
	hotspots.append(button);
	return button;
}

function buildHotspots(screen) {
	// Always clear previous hotspots to prevent duplication when toggling options
	hotspots.replaceChildren();

	if (active === 0) {
		const roles = [
			{ name: "Admin", x: 752, target: 1 },
			{ name: "Dosen", x: 942, target: 2 },
			{ name: "Mahasiswa", x: 1131, target: 3 },
		];

		for (const role of roles) {
			addHotspot(screen, {
				x: role.x,
				y: 322,
				w: 181,
				h: 80,
				label: `Masuk sebagai ${role.name}`,
				className: `role-choice${selectedRole === role.name ? " selected" : ""}`,
				onClick: () => {
					selectedRole = role.name;
					buildHotspots(screen);
				},
			});
		}

		addHotspot(screen, {
			x: 752,
			y: 661,
			w: 560,
			h: 49,
			label: `Masuk ke sistem sebagai ${selectedRole}`,
			onClick: () => {
				const found = roles.find((role) => role.name === selectedRole);
				goTo(found ? found.target : 3);
			},
		});
		return;
	}

	const screenName = screen.name;
	const isAdmin = active === 1 || screenName.startsWith("Admin");
	const isLecturer =
		active === 2 || screenName.startsWith("Dosen") || active === 5;
	const isStudent =
		active === 3 || active === 4 || screenName.startsWith("Mahasiswa");

	if (isAdmin) {
		const links = [
			["Dashboard", 1],
			["Manajemen user", 6],
			["Data master", 7],
			["Penjadwalan", 8],
			["Periode akademik", 9],
			["Laporan", 10],
			["Pengaturan", 11],
		];
		links.forEach(([label, target], i) => {
			addHotspot(screen, {
				x: 16,
				y: 210 + i * 52,
				w: 208,
				h: 43,
				label: `Buka ${label}`,
				target,
			});
		});
	} else if (isLecturer) {
		const links = [
			["Dashboard", 2],
			["Kelas diampu", 12],
			["Jadwal mengajar", 13],
			["Absensi", 14],
			["Input nilai", 5],
			["Materi dan tugas", 15],
			["Profil", 16],
		];
		links.forEach(([label, target], i) => {
			addHotspot(screen, {
				x: 16,
				y: 210 + i * 52,
				w: 208,
				h: 43,
				label: `Buka ${label}`,
				target,
			});
		});
	} else if (isStudent) {
		const links = [
			["Dashboard", 3],
			["KRS", 4],
			["Jadwal kuliah", 17],
			["Nilai", 18],
			["Presensi", 19],
			["Profil", 20],
		];
		links.forEach(([label, target], i) => {
			addHotspot(screen, {
				x: 16,
				y: 210 + i * 52,
				w: 208,
				h: 43,
				label: `Buka ${label}`,
				target,
			});
		});
	}

	const logoutY = isStudent ? 708 : 748;
	addHotspot(screen, {
		x: 16,
		y: logoutY,
		w: 208,
		h: 46,
		label: "Keluar dan kembali ke halaman masuk",
		target: 0,
	});

	if (active === 1) {
		addHotspot(screen, {
			x: 1250,
			y: 170,
			w: 160,
			h: 50,
			label: "Tambah jadwal",
			target: 8,
		});
		addHotspot(screen, {
			x: 1070,
			y: 170,
			w: 175,
			h: 50,
			label: "Unduh laporan",
			target: 10,
		});
		addHotspot(screen, {
			x: 1072,
			y: 625,
			w: 312,
			h: 50,
			label: "Kelola periode akademik",
			target: 9,
		});
	} else if (active === 2) {
		addHotspot(screen, {
			x: 1048,
			y: 170,
			w: 200,
			h: 50,
			label: "Lihat jadwal mengajar",
			target: 13,
		});
		addHotspot(screen, {
			x: 930,
			y: 410,
			w: 110,
			h: 50,
			label: "Lihat semua kelas",
			target: 12,
		});
		addHotspot(screen, {
			x: 870,
			y: 995,
			w: 165,
			h: 48,
			label: "Input nilai mahasiswa",
			target: 5,
		});
	} else if (active === 3) {
		addHotspot(screen, {
			x: 1230,
			y: 170,
			w: 180,
			h: 50,
			label: "Buat rencana studi",
			target: 4,
		});
		addHotspot(screen, {
			x: 1160,
			y: 260,
			w: 230,
			h: 65,
			label: "Lanjutkan pengisian KRS",
			target: 4,
		});
		addHotspot(screen, {
			x: 900,
			y: 550,
			w: 160,
			h: 42,
			label: "Jadwal kuliah lengkap",
			target: 17,
		});
	} else if (active === 4) {
		addHotspot(screen, {
			x: 1150,
			y: 250,
			w: 220,
			h: 60,
			label: "Ajukan rencana studi",
			target: 4,
		});
	}
}

// Browser navigation (Back / Forward)
window.addEventListener("popstate", (event) => {
	const targetIndex =
		event.state && typeof event.state.screenIndex === "number"
			? event.state.screenIndex
			: getRequestedScreenIndex();
	goTo(targetIndex, { pushHistory: false });
});

// Keyboard navigation & Dev helper
window.addEventListener("keydown", (event) => {
	// Toggle visual hotspot boundaries with 'H' (for testing and debugging)
	if (event.key === "h" || event.key === "H") {
		const isEditing = ["INPUT", "TEXTAREA"].includes(
			document.activeElement?.tagName,
		);
		if (!isEditing && !event.ctrlKey && !event.metaKey && !event.altKey) {
			document.body.classList.toggle("show-hotspots");
		}
	}

	// Quick slide navigation
	if (event.altKey && event.key === "ArrowRight") {
		event.preventDefault();
		goTo((active + 1) % screens.length);
	}
	if (event.altKey && event.key === "ArrowLeft") {
		event.preventDefault();
		goTo((active + screens.length - 1) % screens.length);
	}
});

// Initialize on page load
const initialScreen = getRequestedScreenIndex();
goTo(initialScreen, { pushHistory: false });
