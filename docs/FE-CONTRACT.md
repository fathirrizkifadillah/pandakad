# UNPANDA Frontend-Backend API Contract (`docs/FE-CONTRACT.md`)

Dokumen ini mendefinisikan kontrak data resmi antara antarmuka pengguna frontend (`pandakad`) dan backend monolith REST API (`pandakad-backend`). Seluruh rute API berawalan `/api/v1` dan mengembalikan respons terstandarisasi.

---

## Standar Envelope Response

### Sukses:
```json
{
  "data": { ... }
}
```

### Gagal / Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL_SERVER_ERROR",
    "message": "Pesan deskriptif yang ramah pengguna",
    "details": { ... } // Opsional: rincian error per field
  }
}
```

---

## 1. Modul Autentikasi & Sesi (Milestone 1)

### Halaman: Login Portal (`src/pages/LoginPage.tsx`)

#### `POST /api/v1/auth/login`
* **Deskripsi:** Autentikasi pengguna berdasarkan NIM/NIP/ID, kata sandi, dan role portal. Mengatur cookie `sessionId` (`HttpOnly`, `Signed`, `SameSite=Lax`).
* **Header:** `Content-Type: application/json`
* **Request Body:**
| Field | Tipe | Wajib | Aturan Validasi |
| :--- | :--- | :--- | :--- |
| `identifier` | `string` | Ya | NIM / NIP / ID staff (minimal 3 karakter, trim) |
| `password` | `string` | Ya | Minimal 6 karakter, maksimal 100 karakter |
| `role` | `enum` | Ya | Salah satu dari: `"Mahasiswa"`, `"Dosen"`, atau `"Admin"` |

* **Response 200 OK:**
```json
{
  "data": {
    "user": {
      "id": "c1f79f42-...",
      "identifier": "22010189",
      "email": "arya.wicaksana@unpanda.ac.id",
      "name": "Arya Wicaksana",
      "role": "Mahasiswa",
      "avatar": "https://...",
      "isActive": true,
      "createdAt": "2026-10-29T02:00:00.000Z",
      "updatedAt": "2026-10-29T02:00:00.000Z"
    },
    "sessionId": "b4a8e231-..."
  }
}
```
* **Cookie Diset:** `sessionId=<signed_token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
* **Response Error:**
  - `400 Bad Request`: `VALIDATION_ERROR` (format field tidak valid)
  - `401 Unauthorized`: `UNAUTHORIZED` ("NIM/NIP atau kata sandi tidak valid untuk peran yang dipilih")
  - `429 Too Many Requests`: `TOO_MANY_REQUESTS` (melebihi limit percobaan masuk)

---

### Halaman: Global / Navigasi / Sesi Aktif

#### `GET /api/v1/auth/me`
* **Deskripsi:** Mengambil data profil pengguna yang saat ini sedang aktif dari cookie sesi atau Bearer token.
* **Autentikasi:** Wajib (Signed Cookie `sessionId` atau `Authorization: Bearer <sessionId>`)
* **Response 200 OK:**
```json
{
  "data": {
    "user": {
      "id": "c1f79f42-...",
      "identifier": "22010189",
      "email": "arya.wicaksana@unpanda.ac.id",
      "name": "Arya Wicaksana",
      "role": "Mahasiswa",
      "avatar": "https://...",
      "isActive": true,
      "createdAt": "2026-10-29T02:00:00.000Z",
      "updatedAt": "2026-10-29T02:00:00.000Z"
    }
  }
}
```
* **Response Error:**
  - `401 Unauthorized`: `UNAUTHORIZED` (sesi tidak valid atau telah kedaluwarsa)

---

#### `POST /api/v1/auth/logout`
* **Deskripsi:** Mengakhiri sesi, menghapus record session dari database PostgreSQL, dan membersihkan cookie browser.
* **Autentikasi:** Opsional/Wajib
* **Response 200 OK:**
```json
{
  "data": {
    "message": "Berhasil keluar dari sesi portal akademik UNPANDA."
  }
}
```

---

## 2. Akun Dummy Bawaan (Hasil Seeding - Total 15 Akun)

*Password seragam untuk semua akun pengujian:* `Panda2026!`

### Administrator (2 Akun)
| Identifier (ID) | Nama | Email | Role |
| :--- | :--- | :--- | :--- |
| `ADM001` | Siti Rahmawati, S.Kom. (Kepala Biro Akademik) | `admin.akademik@unpanda.ac.id` | Admin |
| `ADM002` | Hendra Kurniawan, S.T. (Staf BAAK & IT) | `hendra.kurniawan@unpanda.ac.id` | Admin |

### Dosen Pengajar FTI (5 Akun)
| Identifier (NIP) | Nama & Gelar | Bidang Keahlian | Role |
| :--- | :--- | :--- | :--- |
| `198503152010121002` | Dr. Ir. Budi Santoso, M.Kom. | Kecerdasan Buatan & Algoritma | Dosen |
| `198807202014042001` | Prof. Dr. Ratna Wulandari, S.T., M.T. | Jaringan & Keamanan Siber | Dosen |
| `199011122018031003` | Denny Prasetyo, M.Cs. | Rekayasa Web & Komputasi Awan | Dosen |
| `198205042008122001` | Dr. Maya Indah Lestari, M.Si. | Sains Data & Matematika Diskrit | Dosen |
| `199201152019031002` | Fikri Alamsyah, M.Kom. | Rekayasa Perangkat Lunak | Dosen |

### Mahasiswa Berbagai Angkatan FTI (8 Akun)
| Identifier (NIM) | Nama Mahasiswa | Program Studi / Angkatan | Role |
| :--- | :--- | :--- | :--- |
| `22010189` | Arya Wicaksana | Teknik Informatika (2022 - Semester 5) | Mahasiswa |
| `22010190` | Nadya Putri Savitri | Teknik Informatika (2022 - Semester 5) | Mahasiswa |
| `22010191` | Dimas Aditya Pratama | Teknik Informatika (2022 - Semester 5) | Mahasiswa |
| `23010045` | Farhan Maulana | Sistem Informasi (2023 - Semester 3) | Mahasiswa |
| `23010046` | Zahra Amalia | Sistem Informasi (2023 - Semester 3) | Mahasiswa |
| `24010012` | Rizky Ramadhan | Teknik Komputer (2024 - Semester 1) | Mahasiswa |
| `24010013` | Putri Anggraini | Teknik Komputer (2024 - Semester 1) | Mahasiswa |
| `21010088` | Kevin Sanjaya | Teknik Informatika (2021 - Tingkat Akhir) | Mahasiswa |

---

## 3. Modul Data Master, Periode Akademik & Katalog (Milestone 2)

### A. Pengaturan Institusi
* `GET /api/v1/master/settings` (Publik): Mengembalikan identitas UNPANDA, FTI, akreditasi, kontak, dan logo.
* `PUT /api/v1/master/settings` (Khusus Admin): Mengubah identitas institusi.

### B. Periode / Tahun Akademik
* `GET /api/v1/master/terms/active` (Terautentikasi): Mengembalikan periode akademik yang sedang berjalan (mis. `20261` - Semester Ganjil 2026/2027) beserta status jendela buka/tutup KRS dan input nilai.
* `GET /api/v1/master/terms` (Terautentikasi): Mengembalikan seluruh riwayat periode akademik.
* `POST /api/v1/master/terms` (Khusus Admin): Mendaftarkan periode akademik baru.
* `PATCH /api/v1/master/terms/:id/activate` (Khusus Admin): Mengaktifkan periode akademik tertentu secara atomik (periode lain otomatis non-aktif).

### C. Program Studi, Gedung & Ruangan
* `GET /api/v1/master/programs` (Terautentikasi): Mengembalikan daftar prodi di FTI (`IF`, `SI`, `TK`).
* `GET /api/v1/master/buildings` (Terautentikasi): Mengembalikan daftar gedung kampus (`GD-A`, `GD-B`, `GD-C`, `GD-REK`) bersarang dengan ruangannya.
* `GET /api/v1/master/rooms?buildingId=` (Terautentikasi): Mengembalikan daftar ruangan kelas/lab beserta kapasitas dan tipe.

### D. Katalog Kurikulum & Mata Kuliah
* `GET /api/v1/master/courses` (Terautentikasi): Mengembalikan katalog mata kuliah FTI.
  - Parameter Query: `search` (pencarian nama/kode), `semester` (filter semester 1-8), `studyProgramId` (filter prodi).
* `POST /api/v1/master/courses` (Khusus Admin): Mendaftarkan mata kuliah baru ke kurikulum.

---

## 4. Modul Kelas Perkuliahan & Penjadwalan (Milestone 3)

### A. Katalog & Manajemen Kelas
* `GET /api/v1/classes` (Terautentikasi):
  - Query parameters: `termId`, `studyProgramId`, `courseId`, `lecturerId`, `search`.
  - Mengembalikan daftar kelas perkuliahan aktif bersarang dengan data mata kuliah, jadwal per hari/jam, dan nama dosen pengampu.
* `GET /api/v1/classes/:id` (Terautentikasi):
  - Mengembalikan detail 1 kelas perkuliahan beserta riwayat jadwal dan ruangan.
* `POST /api/v1/classes` (Khusus Admin):
  - Membuat kelas perkuliahan baru dengan validasi otomatis bentrok ruangan dan bentrok dosen.
  - Skema Input:
    ```json
    {
      "code": "IF3101-A",
      "courseId": "uuid-course",
      "academicTermId": "uuid-term",
      "lecturerId": "uuid-lecturer",
      "quota": 40,
      "schedules": [
        {
          "roomId": "uuid-room",
          "dayOfWeek": "Senin",
          "startTime": "08:00",
          "endTime": "10:30"
        }
      ]
    }
    ```
* `GET /api/v1/classes/my-classes` (Khusus Dosen):
  - Mengembalikan kelas-kelas yang diampu oleh dosen yang sedang login.

---

## 5. Modul KRS - Kartu Rencana Studi (Milestone 4)

### A. Alur Mahasiswa
* `GET /api/v1/krs/me`:
  - Mengembalikan draf dan mata kuliah yang diambil mahasiswa pada semester aktif.
  - Dilengkapi perhitungan `totalSks`, `maxSks` dinamis berdasarkan IPK/IPS, status KRS (`Draft` / `Menunggu Persetujuan` / `Disetujui`), dan identitas Dosen Pembimbing Akademik (DPA).
* `POST /api/v1/krs/enroll`:
  - Menambahkan kelas ke dalam KRS mahasiswa secara atomik (`prisma.$transaction`).
  - Aturan Bisnis & Guard:
    1. Jendela KRS harus berstatus aktif dan waktu saat ini di dalam `krsStartDate` - `krsEndDate`.
    2. Mahasiswa tidak boleh mengambil kelas yang sama dua kali.
    3. Mahasiswa tidak boleh mengambil 2 kelas berbeda untuk mata kuliah yang sama.
    4. Kuota kelas tidak boleh melebihi batas (`enrolledCount < quota`).
    5. Jadwal tidak boleh bertabrakan dengan kelas yang sudah diambil (`startA < endB && endA > startB`).
    6. Total SKS akumulatif tidak boleh melebihi batas SKS mahasiswa.
  - Body: `{ "classId": "uuid-class" }`
* `DELETE /api/v1/krs/drop`:
  - Membatalkan pengambilan kelas berstatus `Draft`.
  - Kuota kelas dikembalikan secara atomik (`decrement: 1`).
  - Body: `{ "classId": "uuid-class" }`
* `POST /api/v1/krs/submit`:
  - Mengajukan KRS ke DPA. Status seluruh mata kuliah draf berubah menjadi `Submitted` (`Menunggu Persetujuan`).
  - Body: `{ "notes": "Catatan pengajuan ke DPA" }`

### B. Alur DPA (Dosen Pembimbing Akademik) & Admin
* `GET /api/v1/krs/dpa/advisees` (Khusus Dosen):
  - Mengembalikan daftar mahasiswa bimbingan akademik dosen yang sedang login beserta status KRS dan total SKS yang diambil.
* `POST /api/v1/krs/review` (Khusus Dosen & Admin):
  - Menyetujui atau menolak pengajuan KRS mahasiswa bimbingan.
  - Body:
    ```json
    {
      "studentId": "uuid-student-profile",
      "status": "Approved", // atau "Rejected"
      "notes": "KRS disetujui DPA."
    }
    ```

---

## 6. Modul Penilaian, KHS, Transkrip & Audit Log (Milestone 5)

### A. Formula Penilaian & Skala Nilai FTI UNPANDA
* Formula Nilai Akhir:
  $$\text{Nilai Akhir} = 10\% \times \text{Kehadiran} + 20\% \times \text{Tugas} + 35\% \times \text{UTS} + 35\% \times \text{UAS}$$
* Konversi Huruf Mutu & Bobot:
  - $\ge 85$: `A` (Bobot 4.00)
  - $\ge 80$: `A-` (Bobot 3.75)
  - $\ge 75$: `B+` (Bobot 3.50)
  - $\ge 70$: `B` (Bobot 3.00)
  - $\ge 65$: `B-` (Bobot 2.75)
  - $\ge 60$: `C+` (Bobot 2.50)
  - $\ge 55$: `C` (Bobot 2.00)
  - $\ge 40$: `D` (Bobot 1.00)
  - $< 40$: `E` (Bobot 0.00)

### B. Alur Dosen & Admin (Penginputan & Koreksi Nilai)
* `GET /api/v1/grades/class/:classId` (Khusus Dosen Pengampu & Admin):
  - Mengembalikan daftar mahasiswa aktif di kelas beserta nilai yang sudah tersimpan (kehadiran, tugas, uts, uas, nilai akhir, huruf, status).
* `POST /api/v1/grades/batch` (Khusus Dosen Pengampu & Admin):
  - Menyimpan nilai massal satu kelas.
  - Body:
    ```json
    {
      "classId": "uuid-class",
      "status": "Draft", // atau "Final"
      "grades": [
        {
          "enrollmentId": "uuid-enrollment",
          "attendanceScore": 90,
          "assignmentScore": 85,
          "midtermScore": 80,
          "finalExamScore": 88,
          "reason": "Input draf nilai semester"
        }
      ]
    }
    ```
  - Jika `status: "Final"`, nilai langsung dipublikasikan ke mahasiswa dan memicu rekalkulasi otomatis IPK & total SKS mahasiswa.
* `PATCH /api/v1/grades/:id` (Khusus Dosen & Admin):
  - Koreksi nilai individual mahasiswa (misal pasca masa sanggah nilai).
  - Wajib menyertakan alasan (`reason`, min 5 karakter) untuk dicatat ke audit log.
* `GET /api/v1/grades/:id/audit-logs` (Khusus Dosen & Admin):
  - Mengembalikan riwayat kronologis perubahan nilai: siapa yang mengubah (`changedBy`, role), nilai sebelum, nilai sesudah, huruf mutu sebelum/sesudah, dan alasan.

### C. Alur Mahasiswa (KHS & Transkrip Akademik)
* `GET /api/v1/grades/khs?academicTermId=` (Khusus Mahasiswa):
  - Mengembalikan Kartu Hasil Studi per semester.
  - Nilai yang masih berstatus `Draft` disembunyikan / ditampilkan sebagai "Belum Rilis" dan belum dihitung ke IPS.
  - Nilai `Final` dihitung otomatis:
    $$\text{IPS} = \frac{\sum (\text{SKS} \times \text{Bobot})}{\sum \text{SKS}}$$
* `GET /api/v1/grades/transcript` (Khusus Mahasiswa):
  - Mengembalikan Transkrip Akademik Kumulatif lengkap seluruh semester.
  - Menerapkan aturan pengulangan: jika mata kuliah diambil lebih dari sekali, nilai tertinggi yang dihitung.
  - Menghitung IPK kumulatif, total SKS lulus, dan predikat kelulusan (`Cumlaude`, `Sangat Memuaskan`, `Memuaskan`, `Cukup`).

---

## 7. Modul Presensi & Absensi Perkuliahan (Milestone 6)

### A. Alur Dosen & Admin (Pencatatan Presensi Sesi 1 - 16)
* `POST /api/v1/attendance/session` (Khusus Dosen Pengampu & Admin):
  - Membuka atau memperbarui catatan kehadiran pada sesi pertemuan tertentu (pertemuan 1 s.d. 16).
  - Skema Input:
    ```json
    {
      "classId": "uuid-class",
      "sessionNumber": 5, // Rentang 1 s.d. 16
      "date": "2026-10-12",
      "startTime": "08:00",
      "endTime": "10:30",
      "topic": "Algoritma Machine Learning Lanjut",
      "records": [
        {
          "studentId": "uuid-student",
          "status": "Hadir", // "Hadir" | "Izin" | "Sakit" | "Alpa"
          "notes": "Hadir tepat waktu"
        }
      ]
    }
    ```
* `GET /api/v1/attendance/class/:classId/session/:sessionNumber` (Khusus Dosen Pengampu & Admin):
  - Mengembalikan data sesi pertemuan beserta status absensi masing-masing mahasiswa yang terdaftar di kelas.
* `GET /api/v1/attendance/class/:classId/recap` (Khusus Dosen Pengampu & Admin):
  - Mengembalikan rekapitulasi kehadiran kelas secara agregat: total pertemuan terlaksana, jumlah hadir, izin, sakit, alpa per mahasiswa, persentase kehadiran, dan status kelayakan UAS (`Memenuhi Syarat` jika $\ge 75\%$, `Tidak Memenuhi Syarat` jika $< 75\%$).

### B. Alur Mahasiswa (Rekapitulasi Presensi Kuliah)
* `GET /api/v1/attendance/my-recap?academicTermId=` (Khusus Mahasiswa):
  - Mengembalikan rekap kehadiran mahasiswa untuk seluruh mata kuliah yang diambil pada semester aktif:
    ```json
    [
      {
        "id": "uuid-enrollment",
        "kode": "IF3101",
        "matkul": "Kecerdasan Buatan & Machine Learning",
        "sks": 3,
        "dosen": "Dr. Ir. Budi Santoso, M.Kom.",
        "totalPertemuan": 14,
        "hadir": 13,
        "izin": 1,
        "sakit": 0,
        "alpa": 0,
        "persentase": 93,
        "isEligible": true,
        "status": "Memenuhi Syarat"
      }
    ]
    ```

---

## 8. Modul Dashboard & Laporan / Ekspor CSV (Milestone 7)

### A. Dashboard Portal Berbasis Peran
* `GET /api/v1/dashboard/admin` (Khusus Administrator Utama):
  - Mengembalikan metrik agregasi seluruh institusi, periode berjalan, ringkasan per prodi, okupansi ruangan, dan status KRS.
  - Respons:
    ```json
    {
      "status": "success",
      "data": {
        "activePeriod": {
          "id": "uuid-term",
          "code": "20261",
          "name": "Semester Ganjil 2026/2027",
          "academicYear": "2026/2027",
          "semester": "Ganjil",
          "isKrsOpen": true,
          "isGradeInputOpen": false
        },
        "stats": {
          "totalStudents": 24,
          "totalLecturers": 7,
          "totalCourses": 8,
          "totalClasses": 12,
          "totalRooms": 8,
          "totalUsers": 35,
          "totalEnrollments": 6,
          "occupancyRate": 100,
          "krsOverview": {
            "submitted": 0,
            "approved": 6,
            "draft": 0
          }
        },
        "studyPrograms": [
          {
            "id": "uuid-sp",
            "code": "IF",
            "name": "Teknik Informatika",
            "degree": "S1",
            "accreditation": "Unggul",
            "studentCount": 18,
            "lecturerCount": 4,
            "courseCount": 6
          }
        ]
      }
    }
    ```

* `GET /api/v1/dashboard/lecturer?day=Senin` (Khusus Dosen & Admin):
  - Mengembalikan profil dosen pengampu, metrik beban mengajar, persentase kelengkapan nilai, permohonan KRS bimbingan, jadwal hari ini, serta daftar kelas semester berjalan.
  - Query opsional: `day` (nama hari dalam bahasa Indonesia, e.g. "Senin"), `termId` (UUID periode).

* `GET /api/v1/dashboard/student?day=Senin` (Khusus Mahasiswa & Admin):
  - Mengembalikan profil mahasiswa, IPK kumulatif, total SKS lulus, SKS semester berjalan, persentase presensi agregat, status kelayakan UAS ($\ge 75\%$), jadwal kuliah hari ini, dan daftar kelas yang diikuti.

### B. Laporan & Ekspor CSV (RFC 4180 + Mitigasi CSV Formula Injection)
* `GET /api/v1/reports/grades/:classId/csv` (Dosen Pengampu & Admin):
  - Mengunduh rekap nilai akhir kelas dalam format CSV murni.
  - Headers:
    - `Content-Type: text/csv; charset=utf-8`
    - `Content-Disposition: attachment; filename="rekap_nilai_<classCode>_<courseCode>.csv"`
  - Format Kolom: `No,NIM,Nama Mahasiswa,Program Studi,Kehadiran (10%),Tugas (20%),UTS (35%),UAS (35%),Nilai Akhir,Nilai Huruf,Bobot,Status Kelulusan`.
  - Keamanan: Proteksi IDOR (Dosen lain ditolak 403) dan mitigasi formula injection (karakter awalan `=`, `+`, `-`, `@` otomatis di-escape dengan prefix petik tunggal).

* `GET /api/v1/reports/attendance/:classId/csv` (Dosen Pengampu & Admin):
  - Mengunduh matriks absensi 16 pertemuan kelas dalam format CSV.
  - Headers:
    - `Content-Type: text/csv; charset=utf-8`
    - `Content-Disposition: attachment; filename="rekap_presensi_<classCode>_<courseCode>.csv"`
  - Format Kolom: `No,NIM,Nama Mahasiswa,Program Studi,P1,P2,...,P16,Total Hadir,Total Izin,Total Sakit,Total Alpa,Persentase Kehadiran (%),Status UAS`.

* `GET /api/v1/reports/summary/academic` (Khusus Administrator Utama):
  - Mengembalikan laporan eksekutif statistik IPK rata-rata kampus, rekap IPK per program studi, dan distribusi nilai huruf (A s.d. E).

---

*(Kontrak akan terus diperbarui secara inkremental pada milestone berikutnya: M8 Hardening & Swagger, M9 Integrasi Frontend).*
