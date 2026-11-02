# 🚀 Phase 1: Foundation & Camera Core Implementation

> **Milestone**: Phase 1 (Week 1 - 2)  
> **Target**: Implementasi Fondasi, Entry Point, Web Audio SFX, Live Camera Capture & Fallback  
> **Status**: ✅ **COMPLETED**  
> **Assignee**: Programmer / AI Agent  

---

## 📌 Ringkasan Objektif

Membuat alur aplikasi berfungsi penuh dari **Landing Page** (pemilihan mode single / strip / grid) hingga **Camera Capture** (tangkapan foto real-time dengan countdown, mirror, audio SFX, dan fallback upload), serta mengarahkan hasil tangkapan ke halaman **Editor Stub** tanpa error.

---

## 📋 Task Checklist & Spesifikasi Teknis

### [x] Task 1.1: Integrasi Entry Point & Global Stylesheet
- **File Terkait**:
  - `src/styles/index.css`
  - `src/main.js`
- **Spesifikasi Pengerjaan**:
  1. Pada `src/styles/index.css`, sertakan import seluruh modul styling:
     ```css
     @import './components.css';
     @import './animations.css';
     @import './home.css';
     @import './camera.css';
     @import './editor.css';
     @import './export.css';
     @import './print.css';
     ```
  2. Ganti konten default Vite di `src/main.js`:
     - Import `src/styles/index.css`
     - Import `router` dari `./router.js`
     - Import `initToast` dari `./components/toast.js`
     - Import `initModal` dari `./components/modal.js`
     - Import `createHomePage` dari `./pages/home.js`
     - Import `createCameraPage` dari `./pages/camera.js`
     - Import `createEditorPage` dari `./pages/editor.js`
     - Registrasi rute: `'home'`, `'camera'`, dan `'editor'`
     - Jalankan `router.init(document.getElementById('app'))`
- **Kriteria Lolos Uji (Acceptance Criteria)**:
  - Saat `npm run dev` dibuka di browser, muncul Landing Page Photo Studio bertema gelap (bukan template counter Vite).
  - Mengklik tombol "Start Capturing" memicu transisi halaman ke kamera (`#camera`).

---

### [x] Task 1.2: Sintesis Audio Efek (Web Audio API)
- **File Terkait**:
  - `src/utils/audio.js` *(baru)*
  - `src/pages/camera.js`
- **Spesifikasi Pengerjaan**:
  Hindari ketergantungan file MP3 eksternal dengan membuat audio sintetis menggunakan `AudioContext`:
  1. `playCountdownBeep()`: Frekuensi ~800Hz, durasi 100ms, volume fade-out halus.
  2. `playShutterSound()`: White noise burst berdurasi 150ms dengan lowpass filter menyerupai shutter analog mekanik.
  3. Hubungkan `playCountdownBeep()` pada setiap detik hitungan mundur (3, 2, 1) di `camera.js`.
  4. Hubungkan `playShutterSound()` saat shutter flash terpicu di `camera.js`.
- **Kriteria Lolos Uji**:
  - Suara beep terdengar sinkron saat angka hitung mundur berubah.
  - Suara jepretan kamera terdengar ketika frame ditangkap.

---

### [x] Task 1.3: Lifecycle Kamera, Mirroring & Fallback Upload
- **File Terkait**:
  - `src/pages/camera.js`
- **Spesifikasi Pengerjaan**:
  1. **Lifecycle Stream**: Hentikan semua video tracks (`stream.getTracks().forEach(t => t.stop())`) saat tombol "Back" diklik atau halaman di-unmount.
  2. **Camera Flip**: Toggle antara `facingMode: 'user'` (kamera depan - cermin) dan `'environment'` (kamera belakang).
  3. **Error & Fallback Handling**:
     - Jika browser menolak akses kamera (`NotAllowedError`), sembunyikan video viewport dan tampilkan UI upload foto.
     - Sediakan input file `<input type="file" accept="image/*">` yang mampu memuat foto pengguna ke canvas.
- **Kriteria Lolos Uji**:
  - Lampu webcam fisik mati saat kembali ke halaman home.
  - Tombol flip kamera berfungsi beralih mode.
  - Fitur upload foto bekerja lancar saat kamera tidak tersedia.

---

### [x] Task 1.4: Multi-Shot Capture Mechanics (Mode Single, Strip, Grid)
- **File Terkait**:
  - `src/pages/camera.js`
  - `src/utils/constants.js`
- **Spesifikasi Pengerjaan**:
  1. Mode **Single**: Mengambil 1 foto lalu langsung mengarahkan ke editor.
  2. Mode **Strip / Grid**:
     - Memerlukan 4 foto.
     - Setiap foto yang diambil menampilkan thumbnail pada preview strip di bawah viewport.
     - Counter menampilkan progres: `1 / 4`, `2 / 4`, dst.
     - Setelah foto ke-4 selesai, otomatis navigasi ke router editor:
       ```javascript
       router.navigate('editor', { photos: capturedPhotos, mode });
       ```
- **Kriteria Lolos Uji**:
  - Mode single menyimpan 1 foto format Base64 PNG.
  - Mode strip dan grid menyimpan tepat 4 foto berurutan sebelum berpindah halaman.

---

### [x] Task 1.5: Halaman Editor Stub (Transisi Sementara)
- **File Terkait**:
  - `src/pages/editor.js` *(baru)*
- **Spesifikasi Pengerjaan**:
  Buat halaman stub sederhana agar alur tidak terputus:
  1. Ambil data: `const { photos = [], mode } = router.getData()`.
  2. Tampilkan grid pratinjau foto-foto yang baru saja ditangkap.
  3. Tombol aksi:
     - Tombol "Ambil Ulang" (`Retake`) $\rightarrow$ navigasi kembali ke `#camera`.
     - Tombol "Selesai" (`Done`) $\rightarrow$ menampilkan notifikasi toast siap lanjut ke Phase 2.
- **Kriteria Lolos Uji**:
  - Setelah capture selesai, foto langsung tampil di halaman editor tanpa error 404 / halaman kosong.

---

### [x] Task 1.6: Build Verification
- Jalankan perintah:
  ```bash
  npm run build
  ```
- **Kriteria Lolos Uji**:
  - Build produksi Vite menghasilkan bundle `dist/` tanpa error atau modul unresolved.

---

## 🤖 Prompt Instruksi untuk AI Agent / Programmer

```markdown
Implementasikan Phase 1 untuk project Photo Studio (Vite + Vanilla JS) sesuai dengan spesifikasi teknis berikut:
1. Hubungkan semua stylesheet di `src/styles/index.css` dan perbarui `src/main.js` untuk menginisialisasi router, toast, modal, dan mendaftarkan halaman 'home', 'camera', serta 'editor'.
2. Buat `src/utils/audio.js` menggunakan Web Audio API untuk efek suara countdown beep dan shutter snap, lalu integrasikan ke `src/pages/camera.js`.
3. Sempurnakan `src/pages/camera.js` untuk menghentikan media track saat navigasi keluar, mendukung flip kamera depan/belakang, dan fallback upload gambar lokal.
4. Dukung alur multi-shot (single 1 shot, strip/grid 4 shot berturut-turut) dengan indikator thumbnail progres.
5. Buat halaman stub `src/pages/editor.js` untuk menampilkan preview foto hasil jepretan dan tombol ambil ulang (retake).
6. Pastikan `npm run build` berjalan sukses 100%.
```
