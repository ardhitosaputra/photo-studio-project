# 🎨 Phase 2: Canvas Editor Engine (Filters, Stickers, Frames & Compositing)

> **Milestone**: Phase 2 (Week 3 - 4)  
> **Target**: Implementasi Canvas Editor Interaktif, 12 Filter Presets, Stiker Drag & Drop, Frame Overlays, Multi-Slot Selector, dan Compositing Engine  
> **Status**: 🟡 **OPEN**  
> **Assignee**: Programmer / AI Agent  

---

## 📌 Ringkasan Objektif

Mentransformasikan halaman editor dari tampilan preview mentah menjadi **Studio Canvas Editor Interaktif** lengkap. Pengguna dapat:
1. Memilih slot foto yang ingin diedit jika mengambil multi-shot (4 foto strip/grid).
2. Memilih dan melihat pratinjau real-time dari **12 filter artistik**.
3. Menambahkan **stiker dekoratif** dan memanipulasinya secara interaktif (*drag & drop*, *resize*, dan *delete*).
4. Menerapkan **bingkai/frame tematik** (*Polaroid, Vintage, Neon, Minimalist, 35mm Film Strip, Gradient*).
5. Menggabungkan (*flatten/composite*) seluruh layer foto, filter, stiker, dan bingkai menjadi satu file gambar beresolusi penuh saat menekan tombol **Done**, lalu berpindah ke halaman **Export**.

---

## 📋 Task Checklist & Spesifikasi Teknis

### [ ] Task 2.1: Arsitektur State Editor & Multi-Slot Selector
- **File Terkait**:
  - `src/pages/editor.js`
- **Spesifikasi Pengerjaan**:
  1. Kelola state editor per foto:
     ```javascript
     const editorState = {
       photos: [/* array base64 string */],
       activePhotoIndex: 0,
       photoEdits: [
         // objek edit tersimpan per slot foto:
         { filter: 'none', frame: 'none', stickers: [] }
       ]
     };
     ```
  2. Untuk mode **Photo Strip** atau **2×2 Grid** (4 foto):
     - Sediakan bilah pemilih thumbnail foto (*Photo Slot Selector*) di atas atau samping kanvas.
     - Mengklik thumbnail berpindah ke foto tersebut tanpa menghilangkan hasil editan foto lainnya.
     - Sediakan tombol pintas *"Apply Filter/Frame to All Photos"* untuk kemudahan pengguna.
- **Kriteria Lolos Uji (Acceptance Criteria)**:
  - Berpindah antar slot foto mempertahankan state filter, stiker, dan frame masing-masing slot.

---

### [ ] Task 2.2: Filter Drawer & Live Thumbnail Preview (12 Preset)
- **File Terkait**:
  - `src/pages/editor.js`
  - `src/utils/constants.js`
  - `src/utils/canvas-utils.js`
- **Spesifikasi Pengerjaan**:
  1. Tambahkan tab toolbar **"🎨 Filters"**.
  2. Tampilkan panel drawer bawah berisi 12 filter preset (*Original, B&W, Sepia, Vintage, Warm, Cool, Dramatic, Fade, Noir, Vivid, Pastel, Retro*).
  3. Render thumbnail preview mini menggunakan `createThumbnail(sourceCanvas, 64)` yang telah diberi filter CSS.
  4. Klik pada filter langsung mengaplikasikan efek pada kanvas aktif secara real-time.
- **Kriteria Lolos Uji**:
  - Filter langsung ter-render pada kanvas utama saat thumbnail diklik.
  - Filter aktif memiliki penanda visual (border warna aksen ungu/violet).

---

### [ ] Task 2.3: Stiker Drawer & Interaksi (Drag, Resize, Delete)
- **File Terkait**:
  - `src/pages/editor.js`
  - `src/utils/constants.js`
- **Spesifikasi Pengerjaan**:
  1. Tambahkan tab toolbar **"🏷️ Stickers"** dengan kategori tab: *Emoji*, *Props*, *Text*, dan *Decorative*.
  2. Mengklik stiker pada drawer menambahkan objek stiker baru ke tengah kanvas:
     ```javascript
     {
       id: 'stk_' + Date.now(),
       content: '🕶️',
       x: 50,  // persentase relatif (0 - 100%)
       y: 50,
       size: 54, // ukuran dalam piksel
       rotation: 0
     }
     ```
  3. Interaksi manipulasi stiker:
     - **Drag & Drop**: Menggunakan Pointer Events (`pointerdown`, `pointermove`, `pointerup`) dengan batas area kanvas.
     - **Resize Handle**: Pegangan kontrol di sudut stiker untuk membesarkan/mengecilkan ukuran stiker.
     - **Delete Button**: Tombol silang merah (✕) di sudut atas stiker untuk menghapus stiker.
     - **Touch Friendly**: Berfungsi lancar di perangkat mobile (layar sentuh) maupun mouse desktop.
- **Kriteria Lolos Uji**:
  - Stiker dapat digeser, diatur ukurannya, dan dihapus tanpa distorsi posisi saat viewport berubah.

---

### [ ] Task 2.4: Frame Drawer & Overlay Rendering
- **File Terkait**:
  - `src/pages/editor.js`
  - `src/utils/constants.js`
  - `src/utils/canvas-utils.js` (`drawFrame`)
- **Spesifikasi Pengerjaan**:
  1. Tambahkan tab toolbar **"🖼️ Frames"**.
  2. Sediakan pilihan bingkai: *None*, *Polaroid*, *Vintage*, *Neon*, *Minimal*, *Film (35mm)*, dan *Gradient*.
  3. Saat bingkai dipilih, panggil fungsi `drawFrame(canvas, frameId)` dari `canvas-utils.js` di layer kanvas.
- **Kriteria Lolos Uji**:
  - Bingkai terpasang presisi di tepian foto.
  - Memilih *None* menghapus bingkai dan mengembalikan foto ke format border polos.

---

### [ ] Task 2.5: Render Pipeline & Compositing Flattening Engine
- **File Terkait**:
  - `src/pages/editor.js`
  - `src/utils/canvas-utils.js`
- **Spesifikasi Pengerjaan**:
  1. Buat pipeline compositing resolusi penuh:
     - Siapkan kanvas offscreen dengan resolusi asli gambar (misal 1280×960).
     - Layer 1: Gambar foto dasar dengan filter CSS/Canvas.
     - Layer 2: Render bingkai overlay jika frame dipilih.
     - Layer 3: Render seluruh stiker sesuai koordinat persentase `(x, y)` dan skala ukuran.
  2. Saat tombol **"Done / Selesai"** diklik:
     - Lakukan flattening seluruh foto yang ada di state.
     - Hasilkan array foto final dalam format Base64 DataURL / Blob.
     - Navigasi ke rute export:
       ```javascript
       router.navigate('export', { finalPhotos, mode });
       ```
- **Kriteria Lolos Uji**:
  - Hasil render final menggabungkan foto, filter, frame, dan stiker secara permanen dengan resolusi tinggi.

---

### [ ] Task 2.6: Halaman Stub Export (`src/pages/export.js`)
- **File Terkait**:
  - `src/pages/export.js` *(baru)*
  - `src/main.js`
- **Spesifikasi Pengerjaan**:
  1. Buat file `src/pages/export.js` yang menerima `{ finalPhotos = [], mode }` dari router.
  2. Tampilkan kartu preview foto final hasil editan dan tombol navigasi kembali (*Back to Editor*).
  3. Daftarkan rute `'export'` pada `src/main.js`.
- **Kriteria Lolos Uji**:
  - Menekan tombol "Done" di editor berhasil berpindah ke halaman `#export` tanpa error 404.

---

### [ ] Task 2.7: Build Verification
- Jalankan perintah:
  ```bash
  npm run build
  ```
- **Kriteria Lolos Uji**:
  - Build produksi Vite menghasilkan bundle `dist/` tanpa error sintaks atau modul unresolved.

---

## 🤖 Prompt Instruksi untuk AI Agent / Programmer (Copy-Paste)

```markdown
Implementasikan Phase 2: Canvas Editor Engine untuk project Photo Studio (Vite + Vanilla JS) sesuai dengan spesifikasi teknis berikut:
1. Rombak `src/pages/editor.js` menjadi studio canvas editor interaktif dengan bilah tab toolbar:
   - "Filters": 12 preset filter dengan kartu preview mini dan live render.
   - "Stickers": katalog stiker dengan tab kategori, mendukung drag-and-drop pointer, resize, dan tombol hapus (delete).
   - "Frames": pilihan frame tematik (Polaroid, Vintage, Neon, Film, Minimal, Gradient) menggunakan fungsi drawFrame di canvas-utils.js.
2. Jika mode multi-shot (4 foto), sediakan selector slot foto agar pengguna bisa mengedit foto 1 sampai 4 secara bergantian.
3. Buat fungsi compositing offscreen canvas untuk menggabungkan (flatten) foto + filter + stiker + frame menjadi satu gambar final beresolusi tinggi saat tombol "Done" ditekan.
4. Buat halaman stub `src/pages/export.js` untuk menerima hasil foto final dan daftarkan ke `src/main.js`.
5. Pastikan `npm run build` berjalan sukses 100%.
```
