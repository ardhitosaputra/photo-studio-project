# 🛠️ Refactor: Remove Google Drive Feature & Add Dynamic Timer Badge on Camera Button

> **Scope**: Feature Cleanup & Camera UX Enhancement  
> **Target**: Modern Desktop & Mobile Browsers  
> **Status**: ✅ **COMPLETED**  
> **Assignee**: Programmer / AI Agent  

---

## 📌 Ringkasan Objektif

1. **Eliminasi Fitur Google Drive**:
   - Menghapus dependensi Google Identity Services (GIS) dari `index.html`.
   - Menghapus seluruh kartu Google Drive Backup, modal pengaturan Client ID, serta integrasi REST API v3 dari halaman Export.
   - Halaman ekspor kini berfokus murni pada aksi cepat: **Download PNG resolusi tinggi**, **Cetak Photocard fisik**, dan **Share ke Media Sosial/Clipboard**.

2. **Tampilan Tombol Timer Dinamis di Kamera**:
   - Memperbaiki tampilan tombol timer `#btn-timer` pada halaman kamera dengan badge teks/angka (`#timer-badge`).
   - Tombol menampilkan durasi hitung mundur aktif secara real-time (`3s`, `5s`, `10s`, atau `Off`).
   - Setiap klik memutar opsi durasi (`3s` ➔ `5s` ➔ `10s` ➔ `Off` ➔ `3s`), memperbarui badge teks dan status tombol aktif.

---

## 📋 Task Checklist & Spesifikasi Teknis

### [x] Task 1: Hapus Script Google Identity Services dari `index.html`
- **File Terkait**:
  - `index.html`
- **Spesifikasi Pengerjaan**:
  1. Hapus tag `<script src="https://accounts.google.com/gsi/client" async defer></script>`.
- **Kriteria Lolos Uji**:
  - Tidak ada request eksternal ke domain Google Identity Services saat aplikasi dimuat.

---

### [x] Task 2: Hapus Seluruh Integrasi Google Drive di Halaman Export
- **File Terkait**:
  - `src/pages/export.js`
  - `src/styles/export.css`
- **Spesifikasi Pengerjaan**:
  1. Hapus impor fungsi-fungsi Google Drive (`signInGoogleDrive`, `uploadFileToGoogleDrive`, dsb).
  2. Hapus container `#gdrive-card` dari template HTML halaman ekspor.
  3. Hapus fungsi-fungsi pembantu Google Drive: `renderGDriveUI()`, `handleConnectDrive()`, `performConnect()`, `handleUploadDrive()`, `handleDisconnectDrive()`, dan `promptClientIdModal()`.
  4. Bersihkan stylesheet `src/styles/export.css` dari seluruh aturan `.gdrive-sync-card` dan kelas terkaitnya.
- **Kriteria Lolos Uji**:
  - Halaman ekspor bersih tanpa komponen Google Drive, fokus pada 3 tombol aksi: Download, Print, dan Share.

---

### [x] Task 3: Tambahkan Badge Durasi Dinamis pada Tombol Timer Kamera
- **File Terkait**:
  - `src/pages/camera.js`
  - `src/styles/camera.css`
- **Spesifikasi Pengerjaan**:
  1. Perbarui markup tombol `#btn-timer` agar memuat elemen `<span class="timer-badge" id="timer-badge">3s</span>`.
  2. Kelola daftar durasi timer: `[3, 5, 10, 0]` (0 = Off).
  3. Pada event listener klik `#btn-timer`:
     - Putar indeks durasi timer.
     - Perbarui teks pada `#timer-badge` (`3s`, `5s`, `10s`, atau `Off`).
     - Tambahkan/hapus kelas `.active` pada tombol `#btn-timer`.
     - Tampilkan toast pemberitahuan durasi yang aktif.
  4. Pastikan hitung mundur kamera menghormati durasi yang sedang dipilih (jika `0`, langsung ambil foto tanpa countdown).
  5. Tambahkan styling estetis untuk `.timer-badge` di `src/styles/camera.css`.
- **Kriteria Lolos Uji**:
  - Pengguna dapat melihat langsung berapa detik timer yang aktif pada tombol kamera.
  - Mengklik tombol secara instan mengubah angka yang tertera pada tombol.

---

### [x] Task 4: Validasi Build & Regresi
- **Spesifikasi Pengerjaan**:
  1. Jalankan `npm run build` dan pastikan tidak ada error kompilasi atau modul hilang.
- **Kriteria Lolos Uji**:
  - Build selesai dengan exit code 0 tanpa peringatan modul tak ditemukan.
