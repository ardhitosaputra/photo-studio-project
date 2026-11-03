# 📤 Phase 3: Export, Photocard Print & Google Drive Sync

> **Milestone**: Phase 3 (Week 5 - 6)  
> **Target**: Photocard Canvas Layout Engine, Print Formatting, Social Media Sharing, Clipboard Copy & Google Drive Cloud Sync  
> **Status**: ✅ **COMPLETED**  
> **Assignee**: Programmer / AI Agent  

---

## 📌 Ringkasan Objektif

Mentransformasikan halaman hasil akhir (`export.js`) menjadi sistem distribusi dan pencetakan foto yang lengkap dan siap produksi:
1. **Photocard Layout Canvas Generator**: Menggabungkan kumpulan foto hasil editan menjadi satu lembar photocard utuh (*vertical 4-cut strip*, *2×2 grid*, atau *single polaroid*) dengan pilihan warna kartu (*white, black, pink, blue, cream*) dan teks memo/timestamp kustom.
2. **Download & Cetak Presisi**: Mengunduh satu file gambar photocard jadi (PNG resolusi tinggi) dan mencetak fisik secara proporsional via optimasi `@media print`.
3. **Social Media Sharing**: Berbagi instan via native Web Share API (mobile), tombol *Copy Image to Clipboard*, serta modal share intent langsung ke WhatsApp, Twitter/X, dan Facebook.
4. **Google Drive Cloud Sync**: Mengunggah photocard langsung ke Google Drive pengguna menggunakan Google Identity Services (GIS) & Google Drive API v3 secara client-side.

---

## 📋 Task Checklist & Spesifikasi Teknis

### [x] Task 3.1: Photocard Canvas Layout Engine
- **File Terkait**:
  - `src/utils/photocard.js` *(baru)*
- **Spesifikasi Pengerjaan**:
  Buat fungsi generator kanvas lembar photocard beresolusi tinggi:
  1. **Mode Strip (Vertical 4-cut)**:
     - Dimensi kanvas proporsional (1200 × 3600 px untuk rasio strip 1:3).
     - Susun 4 foto secara vertikal berjarak rapi dengan margin tepi yang konsisten.
     - Bagian footer memuat logo/branding *"✦ PHOTO STUDIO ✦"* dan tanggal otomatis (contoh: `2026.11.03`) atau teks memo pilihan pengguna.
  2. **Mode Grid (2×2)**:
     - Dimensi kanvas 2400 × 1800 px (rasio 4:3) dengan 4 foto terbagi rata 2 kolom × 2 baris.
  3. **Mode Single Polaroid**:
     - Format polaroid klasik dengan area bawah lebih lebar untuk catatan memo kustom.
  4. **Pilihan Warna Kartu Photocard**:
     - *Classic White* (`#ffffff`), *Midnight Black* (`#121212`), *Pastel Pink* (`#ffe4e6`), *Sky Blue* (`#e0f2fe`), dan *Vintage Cream* (`#fef3c7`).
- **Kriteria Lolos Uji (Acceptance Criteria)**:
  - Menghasilkan satu string Base64 DataURL gambar photocard utuh beresolusi tinggi.

---

### [x] Task 3.2: Antarmuka Kustomisasi Photocard & Preview Interaktif
- **File Terkait**:
  - `src/pages/export.js`
  - `src/styles/export.css`
- **Spesifikasi Pengerjaan**:
  1. Tampilkan canvas preview photocard interaktif di bagian tengah halaman.
  2. Tambahkan panel kontrol kustomisasi:
     - **Pilihan Warna Photocard**: Lingkaran palet warna (*White, Black, Pink, Blue, Cream*).
     - **Input Teks Memo/Caption**: Kolom input teks opsional untuk menambahkan pesan singkat di photocard.
  3. Tombol **"Download Photocard"**:
     - Mengunduh file photocard utuh (`photocard-studio-[timestamp].png`).
     - Sediakan tautan kecil alternatif: *"Download Individual Photos"* jika pengguna ingin mengunduh foto mentah satu per satu.
- **Kriteria Lolos Uji**:
  - Mengubah warna atau teks memo langsung memperbarui preview photocard secara instan.
  - File yang terunduh adalah satu lembar photocard komplit, bukan foto terpisah.

---

### [x] Task 3.3: Optimasi Format Cetak Fisik (`@media print`)
- **File Terkait**:
  - `src/styles/print.css`
- **Spesifikasi Pengerjaan**:
  1. Di dalam `@media print`:
     - Sembunyikan seluruh UI navigasi, tombol, header, dan pemilih warna (`.no-print`).
     - Pusatkan kanvas photocard di tengah halaman cetak (`page-break-inside: avoid`).
     - Set margin cetak halaman: `@page { margin: 0; size: auto; }`.
  2. Tombol **"Print Photocard"** memanggil `window.print()`.
- **Kriteria Lolos Uji**:
  - Dialog print browser menampilkan kartu foto bersih di tengah tanpa elemen tombol web di sekelilingnya.

---

### [x] Task 3.4: Modal Social Media Sharing & Clipboard API
- **File Terkait**:
  - `src/pages/export.js`
  - `src/components/modal.js`
- **Spesifikasi Pengerjaan**:
  1. **Mobile Web Share API**:
     - Cek `navigator.canShare && navigator.canShare({ files })`. Jika didukung, langsung panggil dialog share native ponsel.
  2. **Desktop Fallback (Share Modal)**:
     - Jika share file tidak didukung browser desktop, buka modal share dengan opsi:
       - **Copy Image to Clipboard**: Menggunakan `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` sehingga pengguna bisa langsung *Ctrl+V* di WhatsApp Web, DM Instagram, atau Discord.
       - **WhatsApp Direct**: Buka tautan `https://api.whatsapp.com/send?text=...`.
       - **Twitter / X Direct**: Buka tautan `https://twitter.com/intent/tweet?text=...`.
       - **Facebook Direct**: Buka tautan sharer Facebook.
- **Kriteria Lolos Uji**:
  - Tombol "Copy Image" berhasil menyalin binary foto ke clipboard dan memunculkan toast konfirmasi.
  - Tautan WhatsApp / X terbuka di tab baru dengan teks pesan default.

---

### [x] Task 3.5: Integrasi Google Drive Sync (Client-Side GIS & REST API v3)
- **File Terkait**:
  - `src/utils/drive.js` *(baru)*
  - `index.html`
  - `src/pages/export.js`
- **Spesifikasi Pengerjaan**:
  1. Di `index.html`, muat script Google Identity Services:
     ```html
     <script src="https://accounts.google.com/gsi/client" async defer></script>
     ```
  2. **Inisialisasi Token Client**:
     - Gunakan `google.accounts.oauth2.initTokenClient` dengan scope `https://www.googleapis.com/auth/drive.file`.
  3. **Konfigurasi Client ID**:
     - Simpan `google_client_id` di `localStorage`.
     - Jika Client ID belum diisi oleh pengguna/developer, tampilkan modal pengaturan ringkas untuk memasukkan Client ID Google Cloud mereka (dengan petunjuk singkat).
  4. **Unggah File ke Drive**:
     - Konversi dataURL photocard ke Blob.
     - Kirim request `multipart/related` POST ke `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart` berisi metadata nama file dan konten binary.
  5. **Feedback UI**:
     - Tampilkan animasi spinner loading saat proses upload berlangsung.
     - Tampilkan notifikasi toast/modal sukses berisi tombol **"Open in Google Drive"** yang mengarah ke `https://drive.google.com/file/d/{fileId}/view`.
- **Kriteria Lolos Uji**:
  - Pengguna dapat login via popup Google, memilih akun, dan file berhasil masuk ke folder Google Drive mereka.

---

### [x] Task 3.6: Build Verification
- Jalankan perintah:
  ```bash
  npm run build
  ```
- **Kriteria Lolos Uji**:
  - Build produksi Vite menghasilkan bundle `dist/` tanpa error sintaks atau modul unresolved.

---

## 🤖 Prompt Instruksi untuk AI Agent / Programmer (Copy-Paste)

```markdown
Implementasikan Phase 3: Export, Photocard Print & Google Drive Sync untuk project Photo Studio (Vite + Vanilla JS) sesuai dengan spesifikasi teknis berikut:

1. Buat modul generator photocard di `src/utils/photocard.js` untuk menggabungkan foto-foto menjadi satu lembar photocard utuh beresolusi tinggi (pilihan format: 4-cut vertical strip, 2x2 grid, dan single polaroid) dengan pilihan warna kartu (white, black, pink, blue, cream) serta tanggal/memo teks.
2. Sempurnakan `src/pages/export.js` dengan preview interaktif canvas photocard, pemilih warna kartu, tombol download file photocard utuh (PNG), dan tombol cetak via browser print.
3. Tambahkan fitur Social Sharing di `src/pages/export.js`:
   - Gunakan native Web Share API jika didukung perangkat.
   - Sediakan modal fallback untuk desktop dengan fitur "Copy Image to Clipboard" dan tautan share langsung ke WhatsApp, X/Twitter, dan Facebook.
4. Buat modul Google Drive di `src/utils/drive.js` menggunakan Google Identity Services (GIS) & Drive API v3 (scope drive.file). Dukung konfigurasi Client ID yang tersimpan di localStorage dan upload multipart/related foto ke Drive user dengan link konfirmasi sukses.
5. Sempurnakan CSS print di `src/styles/print.css` agar hasil cetak photocard pas di kertas dan bersih dari elemen UI website.
6. Pastikan `npm run build` berhasil 100%.
```
