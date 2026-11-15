# 📸 Photo Studio

> **A Minimalist Noir & Monochrome Photobooth Web Application**  
> Capture, customize with noir filters, typography & stickers, style frames, print photocards, and share seamlessly.

---

## ✨ Features

- 🖤 **Full Monochrome Design System**: Elegant, high-contrast black & white aesthetic with custom vector SVG icons, smooth micro-interactions, and dark editorial styling.
- 📸 **Session Shoot Selection**: Simple and focused session selection on the landing page:
  - **Single Shot** (1 Photo)
  - **2 Shots** (2 Photos)
  - **4 Shots** (4 Photos)
- ⏱️ **Camera Viewfinder & Dynamic Timer**:
  - Center-cropped 4:3 aspect ratio matching the camera stream to photocard frames.
  - Interactive timer button with real-time badge cycling (`3s` ➔ `5s` ➔ `10s` ➔ `Off`).
  - Shutter sound, countdown audio feedback, mirror flip, and shutter flash.
- 🎞️ **Curated Noir & B&W Filters**:
  - *Original*
  - *B&W Classic* (100% Grayscale)
  - *High Noir* (High contrast, deep shadows)
  - *Silvertone* (Luminous silver monochrome)
  - *Matte Charcoal* (Soft, low-contrast darkroom matte)
  - *High Key* (Bright, crisp highlights)
  - *Darkroom* (Intense contrast & analog darkroom feel)
  - *Faded B&W* (Vintage faded tones)
- ✍️ **Custom Typography & Text Tool**:
  - Add text directly onto photos with real-time drag, resize, rotate, and delete controls.
  - **5 Curated Font Styles**:
    - **Display**: *Space Grotesk*
    - **Serif**: *Playfair Display*
    - **Script**: *Caveat* (Handwritten)
    - **Typewriter**: *Courier Prime*
    - **Sans**: *Inter*
  - Dual monochrome text color options (Crisp White & Deep Black) with high-contrast drop shadows.
- ✦ **Monochrome Aesthetic Stickers & Props**:
  - **Symbols**: `✦`, `✧`, `★`, `☆`, `🖤`, `🤍`, `♠️`, `♣️`, `♟️`, `⚡`, `〰️`, `☾`
  - **Props**: `🕶️`, `🎩`, `📸`, `🎞️`, `🎧`, `🕊️`, `☕`, `🎀`
  - Built-in `grayscale(100%)` canvas compositing pipeline ensuring zero OS color bleeding.
- 🖼️ **End-Stage Layout & Frame Selection**:
  - Layout selection is presented at the final preview stage based on your shot count:
    - **1 Shot**: Classic Polaroid, Minimal Card, Borderless
    - **2 Shots**: 2-Cut Vertical Strip, Side-by-Side Duo Split
    - **4 Shots**: 4-Cut Classic Photobooth Strip, 2×2 Quad Grid
- 🏁 **Monochrome Card Themes & Memo**:
  - *Classic White*, *Midnight Black*, *Paper Gray*, and *Dark Charcoal*.
  - Personalized memo/caption input and automatic date stamping.
- 🖨️ **Export, Print & Share**:
  - High-resolution unified PNG download.
  - Secondary individual shot downloads.
  - 1-click clipboard image copy (paste directly into chat/Discord).
  - Print-ready CSS `@media print` output.
  - Native Web Share API integration with social share intents.

---

## 🧭 User Workflow

```
[ Home Page ] ➔ Choose Shoot Mode (Single, 2 Shots, 4 Shots)
       ↓
[ Camera Viewport ] ➔ Adjust Timer (3s/5s/10s/Off) ➔ Capture Photos
       ↓
[ Studio Editor ] ➔ Apply Noir Filters ➔ Place Stickers & Custom Typography
       ↓
[ Export & Share ] ➔ Pick Layout (Strip / Grid / Polaroid / Duo) ➔ Pick Card Theme ➔ Download & Print
```

---

## 🛠️ Tech Stack

- **Frontend Core**: Vanilla JavaScript (ES2022+), HTML5, Canvas 2D API
- **Styling**: Vanilla CSS (Custom Properties, Glassmorphism, Dark Mode)
- **Typography**: Google Fonts (*Space Grotesk*, *Playfair Display*, *Caveat*, *Courier Prime*, *Inter*)
- **Icons**: Custom Monochrome Vector SVG System
- **Build Tool**: [Vite](https://vite.dev/)

---

## 📁 Project Structure

```
photo-studio-project/
├── index.html                  # HTML entry point with typography preloading
├── package.json                # Project dependencies & build scripts
├── vite.config.js              # Vite configuration
├── src/
│   ├── main.js                 # Application initialization
│   ├── router.js               # Client-side SPA navigation router
│   ├── pages/
│   │   ├── home.js             # Landing page (Session shot count selection)
│   │   ├── camera.js           # Live camera feed, timer badge, shutter capture
│   │   ├── editor.js           # Filter, sticker, and custom text editor
│   │   └── export.js           # Final layout selection, card theme, export & share
│   ├── components/
│   │   ├── modal.js            # Accessible modal dialogs
│   │   └── toast.js            # Transient notification toasts
│   ├── utils/
│   │   ├── audio.js            # Audio feedback (timer beeps, shutter click)
│   │   ├── canvas-utils.js     # Image compositing & canvas operations
│   │   ├── constants.js        # Configs, shoot modes, monochrome stickers & filters
│   │   ├── icons.js            # Lucide-style vector SVG icons
│   │   └── photocard.js        # Photocard canvas layout & print rendering engine
│   └── styles/
│       ├── index.css           # Global design tokens & monochrome CSS variables
│       ├── components.css      # Reusable button, modal, toast, and badge styles
│       ├── home.css            # Home landing page styles
│       ├── camera.css          # Viewport, controls, shutter, and timer badge styles
│       ├── editor.css          # Editor canvas, sticker & typography panel styles
│       ├── export.css          # Export layout options, swatches, and actions styles
│       ├── animations.css      # Smooth transitions & keyframe effects
│       └── print.css           # CSS print media styles
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- Modern web browser with camera access (Chrome, Edge, Safari, Firefox)

### Installation

```bash
# Clone the repository
git clone https://github.com/ardhitosaputra/photo-studio-project.git

# Navigate to project directory
cd photo-studio-project

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📄 License

MIT License.
