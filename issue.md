# 🛠️ Refactor: Remove Frame/Border Features & Implement Explicit Google Drive Login Flow

> **Scope**: UI Simplification & Cloud Storage Auth Refactor  
> **Target**: Modern Desktop & Mobile Browsers  
> **Status**: ✅ **COMPLETED**  
> **Assignee**: Programmer / AI Agent  

---

## 📌 Ringkasan Objektif

1. **Eliminasi Fitur Frame & Border**:
   - Menghapus drawer bingkai tematik (Polaroid, Vintage, Neon, Minimal, 35mm Film Strip, Gradient) dari Editor.
   - Mengoptimalkan canvas compositing pipeline agar murni memproses **Foto + Filter + Stiker**.
   - Menyesuaikan layout photocard agar borderless/clean tanpa margin tebal bingkai.

2. **Refactor Alur Google Drive Sync**:
   - Memisahkan alur otentikasi login dari aksi upload.
   - Menambahkan status koneksi akun Google: **"Belum Terhubung"** vs **"Terhubung sebagai [Nama/Email]"**.
   - Pengguna menghubungkan akun terlebih dahulu melalui tombol *"Hubungkan Google Drive"*, setelah login berhasil tombol *"Upload ke Google Drive"* aktif bersama opsi *"Putuskan Akun"*.

---

## 📋 Task Checklist & Spesifikasi Teknis

### [x] Task 1: Hapus UI Frame & Border dari Editor
- **File Terkait**:
  - `src/pages/editor.js`
  - `src/styles/editor.css`
- **Spesifikasi Pengerjaan**:
  1. Hapus tab navigasi `#tab-frames` dan container drawer `#drawer-frames`.
  2. Tab navigasi editor kini hanya menyisakan **Filter** dan **Stiker**.
  3. Hapus state `selectedFrame` atau set default ke `null` / `'none'`.
  4. Hapus event listener interaksi pemilihan item frame.
- **Kriteria Lolos Uji**:
  - Antarmuka editor bersih tanpa tab bingkai/frame.
  - Pengguna hanya berpindah antara panel filter dan stiker.

---

### [x] Task 2: Bersihkan Pipeline Komposisi Canvas
- **File Terkait**:
  - `src/utils/canvas-utils.js`
  - `src/utils/frames.js` *(opsional: hapus atau jadikan no-op)*
- **Spesifikasi Pengerjaan**:
  1. Pada fungsi `renderCompositeCanvas()` / `mergeLayers()`, hilangkan eksekusi penggambaran layer frame overlay (`drawFrameOverlay`).
  2. Pastikan layer yang dirender hanyalah:
     - Layer 1: Foto hasil tangkapan kamera (beserta filter aktif).
     - Layer 2: Seluruh stiker dekoratif yang ditambahkan pengguna.
- **Kriteria Lolos Uji**:
  - Render preview dan hasil akhir foto tidak mengandung overlay bingkai apapun.

---

### [x] Task 3: Penyesuaian Layout Photocard Siap Cetak
- **File Terkait**:
  - `src/utils/photocard.js`
  - `src/styles/export.css`
- **Spesifikasi Pengerjaan**:
  1. Sesuaikan padding/margin layout Single, 4-Cut Strip vertikal, dan 2x2 Grid agar tidak menyisakan ruang kosong bingkai polaroid.
  2. Pertahankan proporsi foto yang rapi dan estetis dengan layout minimalis.
- **Kriteria Lolos Uji**:
  - Hasil photocard di halaman export dan mode print tampak proporsional, bersih, dan borderless.

---

### [x] Task 4: Pemisahan Modul Autentikasi Google Drive
- **File Terkait**:
  - `src/utils/drive.js`
- **Spesifikasi Pengerjaan**:
  1. Buat state lokal `accessToken` dan `currentUserProfile` di dalam modul `drive.js`.
  2. Implementasikan fungsi-fungsi berikut:
     - `isGoogleDriveConnected()`: Mengembalikan boolean status token aktif.
     - `getGoogleDriveUser()`: Mengembalikan info profil akun yang sedang terhubung.
     - `signInGoogleDrive()`: Meminta token via Google Identity Services (`google.accounts.oauth2.initTokenClient`), fetch user info dasar dari Google UserInfo API (`https://www.googleapis.com/oauth2/v3/userinfo`), simpan token di memori.
     - `signOutGoogleDrive()`: Melakukan revoke token (`google.accounts.oauth2.revoke`) dan mereset state lokal ke `null`.
  3. Modifikasi fungsi `uploadToGoogleDrive(blob, filename)`:
     - Memeriksa ketersediaan `accessToken`. Jika belum ada, lemparkan error untuk mengarahkan pengguna login terlebih dahulu.
     - Mengunggah file secara multipart ke Drive API v3.
- **Kriteria Lolos Uji**:
  - Pemanggilan fungsi login berhasil menampilkan popup consent Google dan menyimpan token aktif.
  - Sign-out menghapus hak akses sesi saat ini.

---

### [x] Task 5: Refactor Komponen UI Google Drive di Halaman Export
- **File Terkait**:
  - `src/pages/export.js`
  - `src/styles/export.css`
- **Spesifikasi Pengerjaan**:
  1. Sediakan komponen status akun Google Drive:
     - Indikator status & teks nama akun/email aktif.
     - Tombol **"Hubungkan Google Drive"** (muncul saat belum login).
     - Tombol **"Upload ke Google Drive"** & tautan **"Putuskan Akun"** (muncul saat sudah login).
  2. Pasang event listener:
     - Klik "Hubungkan": Menjalankan `signInGoogleDrive()`, memunculkan loading state, lalu merefresh status UI jika berhasil.
     - Klik "Upload": Menjalankan `uploadToGoogleDrive()`, menampilkan progress/toast berhasil beserta tautan file Drive.
     - Klik "Putuskan Akun": Menjalankan `signOutGoogleDrive()` dan mengembalikan tampilan UI ke status belum terhubung.
- **Kriteria Lolos Uji**:
  - Pengguna tidak bisa upload sebelum login.
  - Alur otentikasi jelas dan status akun terlihat transparan di halaman ekspor.

---

### [x] Task 6: Verifikasi Build & Regresi
- **Spesifikasi Pengerjaan**:
  1. Jalankan `npm run build` dan pastikan build selesai tanpa error sintaks atau modul hilang.
  2. Jalankan `npm run preview` untuk memastikan tidak ada pemanggilan fungsi frame yang menyebabkan exception runtime.
- **Kriteria Lolos Uji**:
  - `dist/` terbentuk sukses (exit code 0).
