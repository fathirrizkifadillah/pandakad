# UNPANDA · Sistem Akademik

Frontend statis dari desain Figma. Semua 21 artboard ditampilkan sebagai hasil render langsung dari file `.fig`, sehingga detail visual seperti ikon, teks, dan logo mengikuti sumbernya.

## Menjalankan Proyek

### Menggunakan Vite (Direkomendasikan)

Pastikan Node.js sudah terpasang, lalu jalankan:

```powershell
# Pasang dependensi (jika baru pertama kali)
npm install

# Jalankan dev server dengan Hot Module Replacement (HMR)
npm run dev
```

Buka URL lokal yang muncul (default: `http://localhost:3000`).

### Perintah Tersedia

- `npm run dev` — Menjalankan development server Vite dengan auto-reload.
- `npm run build` — Melakukan build produksi ke folder `dist/` beserta seluruh aset layar.
- `npm run preview` — Menjalankan preview lokal dari hasil build `dist/`.
- `npm run lint` — Mengecek kualitas kode dan aksesibilitas menggunakan Biome.
- `npm run format` — Memformat seluruh kode secara otomatis menggunakan Biome.

### Menggunakan Python (Alternatif Ringan)

```powershell
python -m http.server 8000
```

Buka `http://localhost:8000`.

---

## Navigasi & Pintasan Keyboard

- **Pilih Peran:** Pada halaman awal (Screen 1), pilih peran **Admin**, **Dosen**, atau **Mahasiswa**, lalu klik tombol masuk.
- **Navigasi Langsung:** Buka parameter URL `?screen=1` hingga `?screen=21`.
- **Browser History:** Tombol **Back** dan **Forward** di browser kini berfungsi penuh.
- **Pintasan Keyboard:**
  - `H` — Menampilkan/menyembunyikan garis bantu hotspot (area klik) untuk kemudahan pengetesan.
  - `Alt + Panah Kanan` — Pindah ke layar berikutnya.
  - `Alt + Panah Kiri` — Pindah ke layar sebelumnya.

---

## Struktur Berkas

- `index.html` — Struktur halaman utama dengan metadata dan aksesibilitas semantic.
- `styles.css` — Gaya tata letak responsif dan visualisasi fokus/hotspot.
- `app.js` — Logika navigasi peran, manajemen hotspot, preloading gambar, dan history state.
- `screens.json` — Konfigurasi metadata dan resolusi 21 layar Figma.
- `assets/screens/` — Render 21 layar prototipe (`01.png` - `21.png`).
- `assets/` — Logo dan maskot resmi UNPANDA.
- `vite.config.js` — Konfigurasi bundler Vite dan penyalinan aset statis.
- `biome.json` — Konfigurasi linter & code formatter.
