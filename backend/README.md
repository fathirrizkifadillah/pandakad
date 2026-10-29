# PANDAKAD Backend REST API 🐼

Backend REST API untuk Sistem Informasi Akademik **Universitas Panda Raya (UNPANDA)** - Fakultas Teknologi dan Informatika (FTI). Dibangun dengan arsitektur **Modular Monolith** berstandar industri menggunakan Node.js, TypeScript, Express, PostgreSQL, dan Prisma ORM.

---

## 🛠️ Tech Stack & Teknologi

* **Runtime & Bahasa**: Node.js (v20+ LTS) + TypeScript (v5.7) dijalankan dengan `tsx` & `tsc`.
* **Web Framework**: Express.js (v4.21).
* **Database & ORM**: PostgreSQL 17 + Prisma ORM (v6.19).
* **Validasi Skema**: Zod (v3.24) untuk validasi request payload, query params, dan variabel environment.
* **Autentikasi & Keamanan**:
  * Hashing kata sandi: **Argon2id** (`argon2`).
  * Sesi database via **Signed HttpOnly Cookies** (`cookie-parser`).
  * Security headers: **Helmet** (v8) + Content Security Policy (CSP).
  * Rate Limiting: **express-rate-limit** (perlindungan brute-force login & DoS).
  * CORS whitelist guard.
  * Mitigasi **CSV Formula Injection** pada ekspor laporan.
* **Logging & Tracing**: Pino + Pino-HTTP dengan pelacakan `X-Request-Id`.
* **Testing**: Vitest (v3) + Supertest (v7) dengan database pengujian terisolasi (`akademik_test`).
* **Linter & Formatter**: Biome (v2.6).
* **Dokumentasi API**: OpenAPI 3.1.0 + Swagger UI interaktif terintegrasi pada `/docs`.

---

## 📋 Prasyarat Sistem

1. **Node.js**: Versi `>= 20.0.0` (LTS direkomendasikan).
2. **PostgreSQL**: PostgreSQL 17 berjalan lokal pada `127.0.0.1:5432`.

---

## 🚀 Panduan Instalasi & Pengaturan Awal

### 1. Masuk ke Direktori Backend & Install Dependensi
```bash
cd backend
npm install
```

### 2. Konfigurasi Environment (`.env`)
Salin file konfigurasi contoh atau buat `.env` di folder `backend/`:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://unpanda_app:unpanda_secure_pass_2026@127.0.0.1:5432/akademik_dev?schema=public"
SESSION_SECRET="unpanda_super_secret_session_key_min_32_chars_2026_secure"
CORS_ORIGIN="http://localhost:3000"
LOG_LEVEL="info"
```

### 3. Setup Database PostgreSQL Lokal
Aplikasi menggunakan user khusus `unpanda_app` dengan dua database terpisah (`akademik_dev` dan `akademik_test`).

**Cara Cepat (Windows PowerShell):**
Jalankan skrip pembantu yang telah disediakan:
```powershell
npm run db:setup
```
*Skrip ini akan otomatis membuat user PostgreSQL, hak akses, dan database dev/test.*

### 4. Menjalankan Migrasi & Seeding Data Realistis
Jalankan migrasi skema database Prisma:
```bash
npm run prisma:migrate
```

Lalu seed database dengan data 35 akun kampus realistis UNPANDA:
```bash
npm run prisma:seed
```

---

## 💻 Menjalankan Server & Perintah Kerja

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan development server dengan auto-reload (`tsx watch`) pada `http://localhost:5000` |
| `npm run build` | Kompilasi TypeScript ke direktori `dist/` |
| `npm start` | Menjalankan compiled server produksi dari `dist/server.js` |
| `npm test` | Menjalankan seluruh test suite otomatis menggunakan **Vitest** (98+ tes) |
| `npm run lint` | Memeriksa kepatuhan kode dan linting menggunakan **Biome** |
| `npm run format` | Melakukan auto-formatting kode sesuai standar Biome |
| `npm run prisma:studio` | Membuka antarmuka grafis Web GUI database Prisma Studio pada browser |

---

## 📖 Dokumentasi API Interaktif (OpenAPI 3.1 & Swagger UI)

Setelah server berjalan (`npm run dev`), buka URL berikut di browser Anda:
* **Portal Dokumentasi Interaktif**: [http://localhost:5000/docs](http://localhost:5000/docs)
* **Spesifikasi Mentah OpenAPI 3.1 JSON**: [http://localhost:5000/api/v1/openapi.json](http://localhost:5000/api/v1/openapi.json)

---

## 👥 Akun Bawaan untuk Eksplorasi (Seed Data)

Seluruh akun seed menggunakan kata sandi seragam: `Panda2026!`

| Peran | Identifier (NIM / NIP / ID) | Nama | Deskripsi Akun |
|---|:---:|---|---|
| **Admin** | `ADM001` | Budi Santoso, S.Kom. | Administrator BAAK Utama |
| **Admin** | `ADM002` | Ratna Dewi, S.T. | Staf BAAK & Kurikulum |
| **Dosen** | `198503152010121002` | Dr. Ir. Budi Santoso, M.Kom. | Dosen Pengampu IF3101 & DPA (NIDN: `0615038501`) |
| **Dosen** | `198807202014042001` | Dr. Ratna Wulandari, M.T. | Dosen Pengampu SI (NIDN: `0620078802`) |
| **Mahasiswa** | `22010188` | Nadya Putri Maharani | S1 Teknik Informatika (Angkatan 2022, Semester 5) |
| **Mahasiswa** | `22010189` | Arya Wicaksana | S1 Teknik Informatika (Angkatan 2022, Semester 5) |
| **Mahasiswa** | `22010191` | Bayu Kurniawan | S1 Sistem Informasi (Angkatan 2022, Semester 5) |

---

## 🧰 Alat Bantu Pengembang yang Direkomendasikan (Opsional)

Untuk kemudahan inspeksi data dan pengujian API selama pengembangan, pengembang dapat menggunakan alat bantu desktop berikut:
1. **DBeaver Community** atau **pgAdmin 4**: Untuk inspeksi visual tabel relasional, foreign keys, dan indeks database PostgreSQL.
2. **Bruno** atau **Postman**: Untuk pengujian HTTP manual dengan cookie jar management otomatis.

---

## 🏛️ Arsitektur & Aturan Bisnis Kampus

Dokumentasi rancangan teknis mendalam, algoritma deteksi bentrok jadwal, aturan pembobotan nilai (10/20/35/35), rumus batas SKS berbasis IPS, serta diagram relasi entitas (**ERD Mermaid**) tersedia di dokumen:
👉 **[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)**
