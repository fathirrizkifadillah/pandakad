# UNPANDA · Sistem Akademik (Portal Terpadu)

Implementasi frontend web nyata (**Opsi 2: Full React 19 + TypeScript + Tailwind CSS v4**) dari rancangan Figma Sistem Akademik Universitas Pandanaran (UNPANDA). Seluruh visual (warna, font Inter, radius, spasi, layout, ikon) mengikuti desain Figma 100% secara presisi tanpa ada penurunan kualitas (ultra-crisp di semua resolusi layar).

---

## 🚀 Menjalankan Proyek

Pastikan Node.js (v20+) sudah terpasang di komputer Anda:

```powershell
# 1. Pasang dependensi
npm install

# 2. Jalankan development server dengan auto-reload (HMR)
npm run dev
```

Buka peramban pada alamat lokal yang tertera (default: `http://localhost:3000`).

---

## 🛠️ Perintah Tersedia

- `npm run dev` — Menjalankan development server Vite dengan HMR cepat.
- `npm run build` — Melakukan type-check TypeScript dan build produksi ke folder `dist/`.
- `npm run preview` — Menjalankan preview lokal hasil build produksi `dist/`.
- `npm run lint` — Memeriksa standar kode dan aksesibilitas WAI-ARIA menggunakan Biome (0 error).
- `npm run format` — Memformat otomatis seluruh kode proyek sesuai standar Biome.

---

## 🧭 Navigasi & Alur 21 Layar

Aplikasi dilengkapi router internal tersinkronisasi riwayat peramban (_browser history & popstate_). Anda dapat membuka layar tertentu secara langsung menggunakan parameter `?screen=X` (1 s.d. 21):

| Screen | Nama Halaman           |   Peran   | Fitur Interaktif Utama                                                              |
| :----: | :--------------------- | :-------: | :---------------------------------------------------------------------------------- |
| **1**  | Masuk Sistem Akademik  |   Auth    | Pemilihan peran (Admin/Dosen/Mahasiswa), form login & maskot                        |
| **2**  | Dashboard Admin        |   Admin   | Ringkasan statistik, okupansi ruang, matkul aktif, aksi cepat                       |
| **3**  | Dashboard Dosen        |   Dosen   | Agenda mengajar hari ini, kelas binaan, status RPS                                  |
| **4**  | Dashboard Mahasiswa    | Mahasiswa | IPK kumulatif, total SKS, jadwal kuliah hari ini, pengumuman                        |
| **5**  | **KRS Mahasiswa**      | Mahasiswa | **Prioritas:** Tambah/hapus matkul interaktif, limit 24 SKS, ajukan ke DPA          |
| **6**  | **Input Nilai Dosen**  |   Dosen   | **Prioritas:** Input presensi/tugas/UTS/UAS, kalkulasi otomatis nilai akhir & huruf |
| **7**  | Manajemen User         |   Admin   | Pencarian & filter akun per role, tambah akun baru, hapus akun                      |
| **8**  | Data Master Akademik   |   Admin   | Tab Mata Kuliah, Program Studi, dan Ruang Kuliah                                    |
| **9**  | Penjadwalan Kuliah     |   Admin   | Matriks alokasi jadwal kuliah per hari, jam, kelas, dan ruang                       |
| **10** | Periode Akademik       |   Admin   | Kontrol buka/tutup masa pengisian KRS dan input nilai                               |
| **11** | Laporan Akademik       |   Admin   | Katalog unduh laporan IPK rata-rata, rekap KRS, dan kelulusan                       |
| **12** | Pengaturan Sistem      |   Admin   | Konfigurasi profil kampus UNPANDA, kontak rektorat, dan logo                        |
| **13** | Kelas Diampu           |   Dosen   | Kartu kelas, data rombel, akses cepat ke presensi & nilai                           |
| **14** | Jadwal Mengajar        |   Dosen   | Jadwal mengajar mingguan dosen per hari dan ruang                                   |
| **15** | Presensi Dosen         |   Dosen   | Pencatatan kehadiran mahasiswa per pertemuan 1–16 (Hadir/Izin/Sakit/Alpa)           |
| **16** | Materi & Tugas         |   Dosen   | Manajemen berkas RPS, slide presentasi, dan unduhan tugas                           |
| **17** | Profil Dosen           |   Dosen   | NIDN, jabatan fungsional Lektor Kepala, BKD, ubah sandi                             |
| **18** | Jadwal Kuliah Mingguan | Mahasiswa | Kalender jadwal kuliah hari Senin s.d. Jumat                                        |
| **19** | Nilai & KHS            | Mahasiswa | Kartu Hasil Studi per semester, transkrip kumulatif, predikat                       |
| **20** | Presensi Kuliah        | Mahasiswa | Rekapitulasi kehadiran per mata kuliah & batas ambang 75%                           |
| **21** | Profil Mahasiswa       | Mahasiswa | Data diri mahasiswa, NIM, Dosen Pembimbing Akademik (DPA)                           |

---

## 🐼 Maskot UNPANDA & Interaksi Ramah

- Website menyertakan maskot panda UNPANDA (`/assets/maskot_unpanda.png`) dengan pesan interaktif ramah dan sedikit jenaka di berbagai halaman penting.
- Maskot dapat diklik untuk memicu animasi lambaian tangan (_waving animation_).
- Seluruh istilah teknis kampus tetap dipertahankan secara akurat (_NIM, NIDN, SKS, IPK, KHS, DPA, RPS, BAAK, dsb._).

---

## 📂 Struktur Berkas

```text
pandakad/
├── src/
│   ├── components/
│   │   ├── layout/       # Sidebar, Topbar, AppLayout
│   │   └── ui/           # Button, Card, StatCard, Badge, PandaMascot
│   ├── mock/             # Lapisan data realistis Indonesia (academicData.ts)
│   ├── pages/
│   │   ├── admin/        # 6 Halaman modul Admin
│   │   ├── dosen/        # 6 Halaman modul Dosen (termasuk Input Nilai)
│   │   ├── mahasiswa/    # 6 Halaman modul Mahasiswa (termasuk KRS interaktif)
│   │   └── LoginPage.tsx # Halaman masuk & pemilihan role (Screen 1)
│   ├── types/            # Definisi TypeScript model data akademik
│   ├── App.tsx           # Router utama & state sinkronisasi URL (?screen=X)
│   ├── index.css         # Token Tailwind CSS v4 & tema UNPANDA
│   ├── main.tsx          # Entrypoint React 19
│   └── vite-env.d.ts     # Tipe lingkungan Vite
├── assets/               # Logo dan maskot resmi UNPANDA
├── biome.json            # Konfigurasi linter & code formatter Biome
├── package.json          # Dependensi & script perintah
├── tsconfig.json         # Konfigurasi TypeScript modern
└── vite.config.js        # Bundler Vite dengan React & Tailwind plugin
```
