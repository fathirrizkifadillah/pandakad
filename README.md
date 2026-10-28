# UNPANDA · Sistem Akademik

Frontend statis dari desain Figma. Semua 21 artboard ditampilkan sebagai hasil render langsung dari file `.fig`, sehingga detail visual seperti ikon, teks, dan logo mengikuti sumbernya.

## Menjalankan

Di folder proyek, jalankan:

```powershell
python -m http.server 8000
```

Buka `http://localhost:8000`. Pilih peran di halaman masuk, lalu gunakan menu di dalam desain untuk berpindah halaman. Untuk membuka artboard tertentu, gunakan `?screen=2` sampai `?screen=21`.

Halaman masuk, navigasi menu, tombol keluar, dan beberapa tombol utama berfungsi di sisi frontend. Tidak ada backend atau penyimpanan data.

## Berkas

- `index.html`, `styles.css`, `app.js` — halaman dan navigasi frontend.
- `screens.json` dan `assets/screens/` — daftar serta render 21 layar dari Figma.
- `assets/` — logo dan maskot UNPANDA.
