# 🚀 Phase 4: Polish, PWA, Gestures & Deployment

> **Milestone**: Phase 4 (Week 7 - 8)  
> **Target**: PWA (Installable & Offline), Touch Gestures & Keyboard Shortcuts, Audio Mute Toggle, SEO/Open Graph, dan GitHub Pages Automated Deployment (CI/CD)  
> **Status**: ✅ **COMPLETED**  
> **Assignee**: Programmer / AI Agent  

---

## 📌 Ringkasan Objektif

Menyempurnakan aplikasi Photo Studio dari status *feature-complete* menjadi **siap produksi (production-ready)** dengan standar web modern:
1. **PWA (Progressive Web App)**: Dapat di-install di layar utama perangkat (*standalone*) dan mendukung penggunaan offline dengan Service Worker.
2. **Mobile Gestures & Keyboard Shortcuts**: Mengeliminasi *pull-to-refresh* yang mengganggu saat manipulasi kanvas, mendukung gestur sentuh yang halus, dan tombol keyboard (*Space* shutter, *Delete* stiker, *1-4* slot switcher, *Esc* modal).
3. **Audio Control**: Fitur mute/unmute efek suara dengan persistensi ke `localStorage`.
4. **SEO & Open Graph Meta Tags**: Kartu pratinjau tautan media sosial yang kaya dan deteksi status jaringan (*online/offline* toast).
5. **CI/CD Deployment**: Workflow GitHub Actions untuk otomatis build dan deploy ke **GitHub Pages**.

---

## 📋 Task Checklist & Spesifikasi Teknis

### [x] Task 4.1: PWA (Progressive Web App) & Dukungan Offline
- **File Terkait**:
  - `public/manifest.json` *(baru)*
  - `public/sw.js` *(baru)*
  - `index.html`
  - `src/main.js`
- **Spesifikasi Pengerjaan**:
  1. Buat `public/manifest.json` berisi konfigurasi nama aplikasi, tema gelap (`#0a0a0a`), orientasi portrait, dan icon.
  2. Buat `public/sw.js` untuk cache statis aset aplikasi.
  3. Daftarkan Service Worker pada `src/main.js`.
  4. Tambahkan link manifest di `index.html`.
- **Kriteria Lolos Uji (Acceptance Criteria)**:
  - Browser menampilkan opsi install aplikasi (*Install App / Add to Home Screen*).
  - Halaman tetap dapat dimuat dan fitur kamera/editor berfungsi saat perangkat offline.

---

### [x] Task 4.2: Penyempurnaan Gestur Layar Sentuh & Pintasan Keyboard
- **File Terkait**:
  - `src/pages/editor.js`
  - `src/pages/camera.js`
  - `src/styles/editor.css`
- **Spesifikasi Pengerjaan**:
  1. Atur `touch-action: none` dan `overscroll-behavior: none` pada area kanvas editor.
  2. Tambahkan handler event keyboard:
     - `Space`: Shutter foto di kamera.
     - `Delete` / `Backspace`: Menghapus stiker yang sedang dipilih.
     - `1`, `2`, `3`, `4`: Berpindah slot foto di editor multi-shot.
     - `Esc`: Menutup modal aktif.
- **Kriteria Lolos Uji**:
  - Menggeser stiker di layar ponsel tidak memicu reload browser.
  - Shortcut keyboard berfungsi responsif di desktop.

---

### [x] Task 4.3: Pengaturan Audio Mute / Unmute
- **File Terkait**:
  - `src/utils/audio.js`
  - `src/pages/camera.js`
  - `src/styles/components.css`
- **Spesifikasi Pengerjaan**:
  1. Sediakan state mute di `src/utils/audio.js` dengan persistensi ke `localStorage`.
  2. Tambahkan tombol toggle suara (🔊 / 🔇) di antarmuka kamera / header.
  3. Bila mute aktif, fungsi audio tidak membunyikan suara beep maupun shutter.
- **Kriteria Lolos Uji**:
  - Suara dapat dimatikan/dihidupkan dengan sekali klik dan statusnya tersimpan antar sesi.

---

### [x] Task 4.4: SEO, Open Graph & Deteksi Status Jaringan
- **File Terkait**:
  - `index.html`
  - `src/main.js`
- **Spesifikasi Pengerjaan**:
  1. Tambahkan meta tags Open Graph (`og:image`, `og:title`, `og:description`, `og:url`) dan Twitter Card (`summary_large_image`) di `index.html`.
  2. Pasang event listener `online` dan `offline` di `src/main.js` yang memicu notifikasi toast informatif.
- **Kriteria Lolos Uji**:
  - Link preview terbaca sempurna pada media sosial.
  - Terputus dari internet memunculkan toast pemberitahuan mode offline.

---

### [x] Task 4.5: Otomasi Deployment ke GitHub Pages (CI/CD)
- **File Terkait**:
  - `vite.config.js`
  - `.github/workflows/deploy.yml` *(baru)*
- **Spesifikasi Pengerjaan**:
  1. Di `vite.config.js`, atur `base: './'` agar path aset relatif.
  2. Buat file workflow GitHub Actions `.github/workflows/deploy.yml` untuk otomatis build dan deploy folder `dist/` ke GitHub Pages pada setiap push ke branch `main`.
- **Kriteria Lolos Uji**:
  - Workflow GitHub Actions berhasil mem-publish situs live tanpa error 404 path aset.

---

### [x] Task 4.6: Verifikasi Akhir Build Produksi
- Jalankan perintah:
  ```bash
  npm run build
  ```
- **Kriteria Lolos Uji**:
  - Build produksi Vite menghasilkan bundle `dist/` tanpa error sintaks atau modul unresolved.

---

## 🤖 Prompt Instruksi untuk AI Agent / Programmer (Copy-Paste)

```markdown
Implementasikan Phase 4: Polish, PWA, Gestures & Deployment untuk project Photo Studio (Vite + Vanilla JS) sesuai dengan spesifikasi teknis berikut:

1. Buat `public/manifest.json` dan Service Worker `public/sw.js` untuk dukungan PWA (Progressive Web App), lalu daftarkan di `src/main.js` agar aplikasi dapat di-install dan berjalan offline.
2. Sempurnakan interaksi di `src/pages/editor.js` dan `src/pages/camera.js`:
   - Cegah pull-to-refresh dan scrolling yang tidak disengaja saat menyeret stiker (touch-action: none).
   - Tambahkan pintasan keyboard desktop: tombol Space untuk shutter kamera, tombol Delete untuk menghapus stiker terpilih, tombol 1-4 untuk berpindah slot foto.
3. Tambahkan fitur Mute / Unmute audio (tersimpan di localStorage) pada `src/utils/audio.js` dan sediakan tombol toggle ikon suara di header.
4. Lengkapi Open Graph & Twitter meta tags di `index.html`, serta tambahkan listener offline/online toast di `src/main.js`.
5. Atur `base: './'` pada `vite.config.js` dan buat workflow GitHub Actions `.github/workflows/deploy.yml` untuk otomatis build & deploy ke GitHub Pages saat push ke branch `main`.
6. Pastikan `npm run build` berhasil 100%.
```
