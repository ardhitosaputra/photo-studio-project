# 🛠️ Issue: Overhaul UI/UX to Full Monochrome (Black & White), Shoot Options (1/2/4), & End-Stage Layout/Frame Selection

> **Scope**: UI/UX Redesign, Design System Overhaul, Capture Flow Refactor, & Canvas Aspect Ratio Optimization  
> **Target**: Modern Desktop & Mobile Web Browsers  
> **Status**: ✅ **COMPLETED**  
> **Assignee**: Programmer / AI Agent  

---

## 📌 Ringkasan Objektif

Project ini akan mengalami perombakan besar (overhaul) pada estetika dan alur pengguna:
1. **Tema Monochrome Murni (Hitam & Putih)**:
   - Mengubah seluruh design system dari aksen warna-warni (ungu, biru, hijau, dsb) menjadi tema monokrom minimalis (Hitam `#000000`, Putih `#ffffff`, dan gradasi Abu-abu/Charcoal).
   - Tombol, badge, glow effect, border, dan partikel animasi diubah menjadi gaya monokrom editorial modern.
2. **Stiker & Frame Bertema Monokrom**:
   - Seluruh katalog stiker diganti atau difilter menjadi hitam-putih (simbol estetis, monochrome emojis, doodle, font stamp, starburst, ribbons, props hitam-putih).
   - Seluruh frame dan tema photocard dibatasi hanya palet hitam-putih (Classic White, Pitch Black, Minimal Slate, Paper Gray, High-Contrast Inverted).
3. **Penyederhanaan Mode Pengambilan Foto di Halaman Awal**:
   - Menghilangkan pilihan tata letak (strip / grid) dari halaman utama (Landing Page).
   - Halaman awal hanya berfokus pada **jumlah bidikan foto**:
     - **Single Shot** (1 foto)
     - **2 Shots** (2 foto)
     - **4 Shots** (4 foto)
4. **Pemilihan Grid & Frame Dipindahkan ke Akhir (Halaman Export)**:
   - Pemilihan layout (Strip, Grid, Polaroid, Duo) dan bingkai frame dilakukan secara fleksibel di tahap akhir (Export / Preview).
   - Opsi layout menyesuaikan dengan jumlah foto yang diambil:
     - 1 Foto: Single Card / Polaroid / Borderless.
     - 2 Foto: 2-Cut Vertical Strip / 2-Photo Split Duo.
     - 4 Foto: 4-Cut Classic Strip / 2×2 Grid Photocard.
5. **Penyesuaian Ukuran & Proporsi Foto (Aspect Ratio Matching)**:
   - Menyelaraskan aspect ratio kamera dengan slot pada canvas frame/grid agar foto tidak terpotong (cropping) secara canggung pada area wajah.
   - Layout 2-shot dan 4-shot memiliki proporsi dimensi photobooth standar yang pas tanpa ruang kosong berlebih.

---

## 📋 Task Checklist & Spesifikasi Teknis

### [x] Task 1: Overhaul Design Tokens & Global CSS ke Full Monochrome
- **File Terkait**:
  - `src/styles/index.css`
  - `src/styles/components.css`
  - `src/styles/home.css`
  - `src/styles/camera.css`
  - `src/styles/editor.css`
  - `src/styles/export.css`
- **Spesifikasi Pengerjaan**:
  1. Perbarui CSS variables di `src/styles/index.css`:
     - `--bg-primary`: `#000000` (atau `#0a0a0a`)
     - `--bg-secondary`: `#121212`
     - `--bg-surface`: `#1a1a1a`
     - `--bg-surface-hover`: `#262626`
     - `--accent`: `#ffffff` (menggantikan ungu `#a78bfa`)
     - `--accent-dim`: `rgba(255, 255, 255, 0.15)`
     - `--accent-glow`: `rgba(255, 255, 255, 0.25)`
     - `--accent-secondary`: `#e5e7eb` (menggantikan biru `#60a5fa`)
     - `--text-accent`: `#ffffff`
     - Ganti warna success, warning, error ke status monokrom/high-contrast badge.
  2. Perbarui `src/styles/components.css`:
     - `.btn-primary`: Latar belakang putih bersih (`#ffffff`) dengan teks hitam (`#000000`), hover state abu-abu terang (`#e5e7eb`), shadow monokromatik.
     - `.btn-secondary`: Border abu-abu tipis dengan latar transparan kaca gelap (`rgba(255, 255, 255, 0.05)`).
     - `.badge`: Latar belakang hitam dengan border putih tipis.
  3. Perbarui `src/styles/home.css`:
     - Hapus radial gradient warna ungu/biru pada `.home-bg::before` dan `::after`, ganti dengan pencahayaan monokrom lembut (`rgba(255,255,255,0.06)`).
     - Partikel di `home.js` diubah menjadi warna putih / silver (`#ffffff` / `#a1a1aa`).
  4. Perbarui tombol capture kamera di `src/styles/camera.css`:
     - Mengubah gradient warna ungu-biru menjadi ring putih minimalis modern dengan aksen hitam-putih.
- **Kriteria Lolos Uji**:
  - Seluruh halaman web (Home, Camera, Editor, Export) tampil murni dalam estetika hitam-putih minimalis tanpa ada warna primer (ungu/biru/pink) yang tersisa.

---

### [x] Task 2: Refactor Capture Modes (Single, 2 Shots, 4 Shots)
- **File Terkait**:
  - `src/utils/constants.js`
  - `src/pages/home.js`
  - `src/styles/home.css`
- **Spesifikasi Pengerjaan**:
  1. Ubah konfigurasi `CAPTURE_MODE` dan `CAPTURE_CONFIG` di `src/utils/constants.js`:
     ```javascript
     export const CAPTURE_MODE = {
       SINGLE: 'single',
       TWO_SHOT: 'two_shot',
       FOUR_SHOT: 'four_shot',
     };

     export const CAPTURE_CONFIG = {
       [CAPTURE_MODE.SINGLE]: { shots: 1, label: 'Single Shot', icon: '📸', desc: '1 Photo' },
       [CAPTURE_MODE.TWO_SHOT]: { shots: 2, label: '2 Shots', icon: '✌️', desc: '2 Photos' },
       [CAPTURE_MODE.FOUR_SHOT]: { shots: 4, label: '4 Shots', icon: '🎞️', desc: '4 Photos' },
     };
     ```
  2. Perbarui `src/pages/home.js`:
     - Selector hanya menampilkan 3 pilihan: Single Shot (1), 2 Shots (2), dan 4 Shots (4).
     - Hilangkan seluruh istilah layout seperti "Strip" atau "Grid" di halaman utama.
  3. Sesuaikan styling kartu pilihan di `src/styles/home.css` agar 3 kartu mode tampil sejajar dan proporsional (grid 3 kolom di desktop, responsive di mobile).
- **Kriteria Lolos Uji**:
  - Pengguna hanya disuguhkan opsi jumlah foto (1, 2, atau 4) di halaman awal.
  - Kamera mengambil foto tepat sejumlah shot yang dipilih (1, 2, atau 4 kali).

---

### [x] Task 3: Katalog Stiker & Filter Serba Hitam-Putih (Monochrome)
- **File Terkait**:
  - `src/utils/constants.js`
  - `src/pages/editor.js`
  - `src/utils/canvas-utils.js`
- **Spesifikasi Pengerjaan**:
  1. Perbarui daftar stiker `STICKERS` di `src/utils/constants.js`:
     - Kategori **Symbols / Aesthetic**: `['✦', '✧', '★', '☆', '🖤', '🤍', '♠️', '♣️', '♟️', '⚡', '〰️', '☾', '☼']`
     - Kategori **Photobooth Props**: `['🕶️', '🎩', '📸', '🎞️', '🎧', '🕊️', '☕', '🎀']`
     - Kategori **Quotes / Stamps**: `['NOIR', 'VIBE', 'STUDIO', 'MEMO', '✦ ✦ ✦', 'B&W', 'CLASSIC']`
  2. Tambahkan CSS styling pada `.sticker-picker-item` dan `.sticker-item` di `src/styles/editor.css` dengan `filter: grayscale(100%) contrast(120%)` untuk memastikan emoji dan stiker tampil 100% monokrom tanpa warna bawaan OS yang bocor.
  3. Pastikan fungsi rendering canvas `compositePhoto()` di `src/utils/canvas-utils.js` menggambar stiker dalam gaya monokrom jika menggunakan font/emoji rendering.
  4. Perbarui preset `FILTERS` di `src/utils/constants.js` dengan penekanan pada filter estetika hitam-putih:
     - `none` (Original)
     - `bw-classic` (B&W Classic: `grayscale(100%)`)
     - `noir` (High Contrast Noir: `grayscale(100%) contrast(150%) brightness(90%)`)
     - `silver` (Silver Tone: `grayscale(100%) contrast(110%) brightness(108%)`)
     - `matte` (Matte Charcoal: `grayscale(100%) contrast(90%) brightness(115%)`)
     - `vintage-bw` (Faded B&W: `grayscale(100%) contrast(95%) sepia(15%)`)
- **Kriteria Lolos Uji**:
  - Seluruh stiker yang ditempel ke foto berpenampilan hitam-putih.
  - Preset filter berfokus pada variasi grading hitam-putih yang kaya kontras.

---

### [x] Task 4: Pemindahan Pilihan Grid, Strip, & Frame ke Halaman Export
- **File Terkait**:
  - `src/pages/export.js`
  - `src/utils/photocard.js`
  - `src/utils/constants.js`
  - `src/styles/export.css`
- **Spesifikasi Pengerjaan**:
  1. Perbarui definisi tema photocard `CARD_THEMES` di `src/utils/photocard.js` menjadi monokrom:
     - **Classic White**: Background `#ffffff`, Text `#111111`, Subtext `#666666`, Border `#e5e7eb`
     - **Midnight Black**: Background `#0a0a0a`, Text `#ffffff`, Subtext `#888888`, Border `#222222`
     - **Paper Gray**: Background `#f4f4f5`, Text `#18181b`, Subtext `#71717a`, Border `#e4e4e7`
     - **Dark Charcoal**: Background `#18181b`, Text `#fafafa`, Subtext `#a1a1aa`, Border `#27272a`
  2. Sesuaikan opsi layout dinamis di `src/pages/export.js`:
     - Jika foto berjumlah **1**: Opsi layout = `['polaroid', 'minimal', 'borderless']`
     - Jika foto berjumlah **2**: Opsi layout = `['strip_2', 'duo_card']`
     - Jika foto berjumlah **4**: Opsi layout = `['strip_4', 'grid_2x2']`
  3. Pengguna dapat memilih tata letak (Layout) dan tema warna kartu (Hitam/Putih/Abu) di halaman ini dengan live preview instan sebelum dicetak atau diunduh.
- **Kriteria Lolos Uji**:
  - Halaman Export menampilkan pilihan layout yang relevan dengan jumlah foto yang diambil pengguna.
  - Pengguna bebas memilih tata letak bingkai di akhir alur kerja.

---

### [x] Task 5: Penyesuaian Ukuran & Proporsi Foto (Aspect Ratio Matching)
- **File Terkait**:
  - `src/utils/photocard.js`
  - `src/pages/camera.js`
  - `src/styles/camera.css`
- **Spesifikasi Pengerjaan**:
  1. **Keselarasan Kamera**:
     - Viewport kamera dan panduan sudut (`.camera-guide`) menggunakan aspect ratio yang konsisten (4:3 horizontal di desktop, 3:4 vertikal di mobile).
     - Pengambilan gambar dari feed video menggunakan pemotongan (crop) terpusat yang presisi sesuai framing yang dilihat pengguna.
  2. **Implementasi Layout Engine 2-Foto**:
     - Tambahkan fungsi `renderVerticalStrip2(canvas, ctx, images, theme, memoText, dateStr)` di `src/utils/photocard.js`:
       - Lebar standar photobooth strip (misal: 1200px lebar, 1700px tinggi).
       - Memuat 2 foto dengan aspect ratio proporsional (4:3 atau 3:2), margin seragam, dan footer branding di bawah.
     - Tambahkan fungsi `renderDuoCard(canvas, ctx, images, theme, memoText, dateStr)` untuk tampilan 2 foto berdampingan (side-by-side).
  3. **Penyempurnaan Layout 4-Foto & Single**:
     - Pastikan `renderVerticalStrip` (4-cut) dan `renderGrid2x2` menjaga rasio foto tanpa distorsi atau pemotongan wajah yang ekstrem menggunakan helper `drawImageCover`.
- **Kriteria Lolos Uji**:
  - Foto pada layout 2-cut, 4-cut, dan grid terpasang dengan proporsi yang rapi tanpa celah aneh atau kompresi gambar yang gepeng/terdistorsi.

---

### [x] Task 6: Validasi Build, Regresi, & Testing
- **Spesifikasi Pengerjaan**:
  1. Jalankan `npm run build` dan pastikan proses kompilasi Vite selesai tanpa error (exit code 0).
  2. Uji seluruh siklus:
     - Home (Pilih 1, 2, atau 4 shot) -> Kamera -> Editor (Filter & Stiker B&W) -> Export (Pilih layout & tema B&W) -> Download & Print.
- **Kriteria Lolos Uji**:
  - Tidak ada modul yang hilang atau error runtime JavaScript di konsol browser.
  - Seluruh fungsionalitas download PNG dan print fisik berjalan sempurna.
