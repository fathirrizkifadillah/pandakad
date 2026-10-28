import type React from "react";
import { useEffect, useState } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { mockUsers } from "./mock/academicData";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { DataMaster } from "./pages/admin/DataMaster";
import { Laporan } from "./pages/admin/Laporan";
import { ManajemenUser } from "./pages/admin/ManajemenUser";
import { Pengaturan } from "./pages/admin/Pengaturan";
import { Penjadwalan } from "./pages/admin/Penjadwalan";
import { PeriodeAkademik } from "./pages/admin/PeriodeAkademik";
import { AbsensiDosen } from "./pages/dosen/Absensi";
import { DosenDashboard } from "./pages/dosen/DosenDashboard";
import { DosenProfil } from "./pages/dosen/DosenProfil";
import { InputNilai } from "./pages/dosen/InputNilai";
import { JadwalMengajar } from "./pages/dosen/JadwalMengajar";
import { KelasDiampu } from "./pages/dosen/KelasDiampu";
import { MateriTugas } from "./pages/dosen/MateriTugas";
import { LoginPage } from "./pages/LoginPage";
import { JadwalKuliah } from "./pages/mahasiswa/JadwalKuliah";
import { KRSPage } from "./pages/mahasiswa/KRSPage";
import { MahasiswaDashboard } from "./pages/mahasiswa/MahasiswaDashboard";
import { MahasiswaProfil } from "./pages/mahasiswa/MahasiswaProfil";
import { NilaiPage } from "./pages/mahasiswa/NilaiPage";
import { PresensiPage } from "./pages/mahasiswa/PresensiPage";
import type { Role } from "./types";

// Map between 21 Figma screens and internal routes
const SCREEN_MAPPING: Record<
	number,
	{ path: string; role: Role; title: string }
> = {
	1: { path: "login", role: "Mahasiswa", title: "Masuk Sistem Akademik" },
	2: { path: "admin-dashboard", role: "Admin", title: "Dashboard Admin" },
	3: { path: "dosen-dashboard", role: "Dosen", title: "Dashboard Dosen" },
	4: { path: "mhs-dashboard", role: "Mahasiswa", title: "Dashboard Mahasiswa" },
	5: { path: "mhs-krs", role: "Mahasiswa", title: "KRS Mahasiswa" },
	6: { path: "dosen-nilai", role: "Dosen", title: "Input Nilai Dosen" },
	7: { path: "admin-users", role: "Admin", title: "Manajemen User" },
	8: { path: "admin-master", role: "Admin", title: "Data Master Akademik" },
	9: { path: "admin-jadwal", role: "Admin", title: "Penjadwalan Perkuliahan" },
	10: { path: "admin-periode", role: "Admin", title: "Periode Akademik" },
	11: { path: "admin-laporan", role: "Admin", title: "Laporan Akademik" },
	12: { path: "admin-pengaturan", role: "Admin", title: "Pengaturan Sistem" },
	13: { path: "dosen-kelas", role: "Dosen", title: "Kelas Diampu" },
	14: { path: "dosen-jadwal", role: "Dosen", title: "Jadwal Mengajar Dosen" },
	15: { path: "dosen-absensi", role: "Dosen", title: "Presensi Mahasiswa" },
	16: { path: "dosen-materi", role: "Dosen", title: "Materi dan Tugas" },
	17: { path: "dosen-profil", role: "Dosen", title: "Profil Dosen" },
	18: {
		path: "mhs-jadwal",
		role: "Mahasiswa",
		title: "Jadwal Kuliah Mingguan",
	},
	19: { path: "mhs-nilai", role: "Mahasiswa", title: "Hasil Studi & Nilai" },
	20: {
		path: "mhs-presensi",
		role: "Mahasiswa",
		title: "Rekapitulasi Presensi",
	},
	21: { path: "mhs-profil", role: "Mahasiswa", title: "Profil Mahasiswa" },
};

function getInitialState() {
	const params = new URLSearchParams(window.location.search);
	const screenNum = Number(params.get("screen"));
	if (screenNum && SCREEN_MAPPING[screenNum]) {
		return {
			screen: screenNum,
			path: SCREEN_MAPPING[screenNum].path,
			role: SCREEN_MAPPING[screenNum].role,
		};
	}
	// Default: Screen 1 (Login)
	return { screen: 1, path: "login", role: "Mahasiswa" as Role };
}

export const App: React.FC = () => {
	const [currentPath, setCurrentPath] = useState<string>(
		() => getInitialState().path,
	);
	const [currentRole, setCurrentRole] = useState<Role>(
		() => getInitialState().role,
	);

	// Sync with browser history and URL search params
	const navigateTo = (path: string, newRole?: Role) => {
		const role = newRole ?? currentRole;
		setCurrentPath(path);
		if (newRole) setCurrentRole(newRole);

		const entry = Object.entries(SCREEN_MAPPING).find(
			([_, val]) => val.path === path,
		);
		const screenNumber = entry ? Number(entry[0]) : 1;

		const url = new URL(window.location.href);
		url.searchParams.set("screen", String(screenNumber));
		window.history.pushState({ path, role }, "", url);
	};

	useEffect(() => {
		const handlePopState = (event: PopStateEvent) => {
			const state = event.state;
			if (state?.path) {
				setCurrentPath(state.path);
				if (state.role) setCurrentRole(state.role);
			} else {
				const reset = getInitialState();
				setCurrentPath(reset.path);
				setCurrentRole(reset.role);
			}
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);

	// Update document title dynamically
	const currentScreenEntry = Object.values(SCREEN_MAPPING).find(
		(val) => val.path === currentPath,
	);
	const pageTitle = currentScreenEntry?.title || "Sistem Akademik UNPANDA";

	useEffect(() => {
		document.title = `${pageTitle} · UNPANDA`;
	}, [pageTitle]);

	// Handle Login Action
	const handleLogin = (role: Role) => {
		if (role === "Admin") navigateTo("admin-dashboard", "Admin");
		else if (role === "Dosen") navigateTo("dosen-dashboard", "Dosen");
		else navigateTo("mhs-dashboard", "Mahasiswa");
	};

	// Handle Logout Action
	const handleLogout = () => {
		navigateTo("login", "Mahasiswa");
	};

	// Switch Role from Topbar
	const handleSwitchRole = (newRole: Role) => {
		if (newRole === "Admin") navigateTo("admin-dashboard", "Admin");
		else if (newRole === "Dosen") navigateTo("dosen-dashboard", "Dosen");
		else navigateTo("mhs-dashboard", "Mahasiswa");
	};

	// Render Login page if on login path
	if (currentPath === "login") {
		return <LoginPage onLogin={handleLogin} />;
	}

	// Active User object
	const activeUser = mockUsers[currentRole];

	// Render page inside AppLayout
	const renderContent = () => {
		switch (currentPath) {
			// Admin Routes
			case "admin-dashboard":
				return <AdminDashboard onNavigate={navigateTo} />;
			case "admin-users":
				return <ManajemenUser />;
			case "admin-master":
				return <DataMaster />;
			case "admin-jadwal":
				return <Penjadwalan />;
			case "admin-periode":
				return <PeriodeAkademik />;
			case "admin-laporan":
				return <Laporan />;
			case "admin-pengaturan":
				return <Pengaturan />;

			// Dosen Routes
			case "dosen-dashboard":
				return <DosenDashboard onNavigate={navigateTo} />;
			case "dosen-kelas":
				return <KelasDiampu onNavigate={navigateTo} />;
			case "dosen-jadwal":
				return <JadwalMengajar />;
			case "dosen-absensi":
				return <AbsensiDosen />;
			case "dosen-nilai":
				return <InputNilai />;
			case "dosen-materi":
				return <MateriTugas />;
			case "dosen-profil":
				return <DosenProfil />;

			// Mahasiswa Routes
			case "mhs-dashboard":
				return <MahasiswaDashboard onNavigate={navigateTo} />;
			case "mhs-krs":
				return <KRSPage />;
			case "mhs-jadwal":
				return <JadwalKuliah />;
			case "mhs-nilai":
				return <NilaiPage />;
			case "mhs-presensi":
				return <PresensiPage />;
			case "mhs-profil":
				return <MahasiswaProfil />;

			default:
				return <MahasiswaDashboard onNavigate={navigateTo} />;
		}
	};

	return (
		<AppLayout
			user={activeUser}
			title={pageTitle}
			currentPath={currentPath}
			onNavigate={navigateTo}
			onLogout={handleLogout}
			onSwitchRole={handleSwitchRole}
		>
			{renderContent()}
		</AppLayout>
	);
};

export default App;
