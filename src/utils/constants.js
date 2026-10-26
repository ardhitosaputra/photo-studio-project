/**
 * App-wide constants & configuration
 */

export const APP_NAME = 'Photo Studio';
export const APP_TAGLINE = 'Capture. Edit. Share.';

// Capture modes
export const CAPTURE_MODE = {
  SINGLE: 'single',
  STRIP: 'strip',    // 4 photos vertical
  GRID: 'grid',      // 2x2 grid
};

// Capture mode configs
export const CAPTURE_CONFIG = {
  [CAPTURE_MODE.SINGLE]: { shots: 1, label: 'Single Shot', icon: '📸', desc: '1 photo' },
  [CAPTURE_MODE.STRIP]: { shots: 4, label: 'Photo Strip', icon: '🎞️', desc: '4 photos' },
  [CAPTURE_MODE.GRID]: { shots: 4, label: 'Grid 2×2', icon: '⊞', desc: '4 photos' },
};

// Filter presets
export const FILTERS = [
  { id: 'none', name: 'Original', matrix: null },
  { id: 'grayscale', name: 'B&W', css: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', css: 'sepia(80%) saturate(120%)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(40%) contrast(110%) brightness(90%) saturate(80%)' },
  { id: 'warm', name: 'Warm', css: 'sepia(20%) saturate(140%) brightness(105%)' },
  { id: 'cool', name: 'Cool', css: 'saturate(80%) hue-rotate(20deg) brightness(105%)' },
  { id: 'dramatic', name: 'Dramatic', css: 'contrast(130%) saturate(120%) brightness(90%)' },
  { id: 'fade', name: 'Fade', css: 'contrast(90%) brightness(110%) saturate(70%)' },
  { id: 'noir', name: 'Noir', css: 'grayscale(100%) contrast(140%) brightness(90%)' },
  { id: 'vivid', name: 'Vivid', css: 'saturate(180%) contrast(110%)' },
  { id: 'pastel', name: 'Pastel', css: 'saturate(60%) brightness(115%) contrast(90%)' },
  { id: 'retro', name: 'Retro', css: 'sepia(30%) hue-rotate(-10deg) saturate(130%) contrast(95%)' },
];

// Sticker catalog
export const STICKERS = {
  emoji: [
    { id: 'e1', content: '😎', label: 'Cool' },
    { id: 'e2', content: '🥳', label: 'Party' },
    { id: 'e3', content: '💖', label: 'Heart' },
    { id: 'e4', content: '✨', label: 'Sparkle' },
    { id: 'e5', content: '🔥', label: 'Fire' },
    { id: 'e6', content: '🌟', label: 'Star' },
    { id: 'e7', content: '😍', label: 'Love' },
    { id: 'e8', content: '🦋', label: 'Butterfly' },
    { id: 'e9', content: '🌈', label: 'Rainbow' },
    { id: 'e10', content: '💫', label: 'Dizzy' },
    { id: 'e11', content: '🎉', label: 'Tada' },
    { id: 'e12', content: '💕', label: 'Hearts' },
  ],
  props: [
    { id: 'p1', content: '🕶️', label: 'Sunglasses' },
    { id: 'p2', content: '👑', label: 'Crown' },
    { id: 'p3', content: '🎩', label: 'Top Hat' },
    { id: 'p4', content: '🎀', label: 'Ribbon' },
    { id: 'p5', content: '🌸', label: 'Flower' },
    { id: 'p6', content: '🧢', label: 'Cap' },
    { id: 'p7', content: '🎭', label: 'Mask' },
    { id: 'p8', content: '🪄', label: 'Wand' },
  ],
  text: [
    { id: 't1', content: '📸', label: 'Camera' },
    { id: 't2', content: '💬', label: 'Speech' },
    { id: 't3', content: '❤️', label: 'Red Heart' },
    { id: 't4', content: '⭐', label: 'Star' },
    { id: 't5', content: '🎵', label: 'Music' },
    { id: 't6', content: '💋', label: 'Kiss' },
  ],
  decorative: [
    { id: 'd1', content: '🌺', label: 'Hibiscus' },
    { id: 'd2', content: '🍀', label: 'Clover' },
    { id: 'd3', content: '❄️', label: 'Snow' },
    { id: 'd4', content: '🎈', label: 'Balloon' },
    { id: 'd5', content: '🌙', label: 'Moon' },
    { id: 'd6', content: '☀️', label: 'Sun' },
    { id: 'd7', content: '🎀', label: 'Bow' },
    { id: 'd8', content: '🍂', label: 'Leaf' },
    { id: 'd9', content: '🌊', label: 'Wave' },
    { id: 'd10', content: '⚡', label: 'Lightning' },
  ],
};

// Frame definitions (drawn via Canvas)
export const FRAMES = [
  { id: 'none', name: 'None', icon: '○' },
  { id: 'polaroid', name: 'Polaroid', icon: '🖼️' },
  { id: 'vintage', name: 'Vintage', icon: '📜' },
  { id: 'neon', name: 'Neon', icon: '💜' },
  { id: 'minimal', name: 'Minimal', icon: '▢' },
  { id: 'film', name: 'Film', icon: '🎞️' },
  { id: 'gradient', name: 'Gradient', icon: '🌈' },
];

// Layout options for export
export const LAYOUTS = [
  { id: 'single', name: 'Single', icon: '🖼️', desc: 'One photo' },
  { id: 'strip', name: 'Strip', icon: '🎞️', desc: '4 vertical' },
  { id: 'grid', name: '2×2 Grid', icon: '⊞', desc: '4 photos' },
];

// Camera defaults
export const CAMERA_DEFAULTS = {
  countdown: 3,
  facingMode: 'user',
  width: 1280,
  height: 960,
};

// Social share URLs
export const SHARE_URLS = {
  twitter: (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  facebook: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  whatsapp: (text) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
};

// Google Drive config
export const DRIVE_CONFIG = {
  scope: 'https://www.googleapis.com/auth/drive.file',
  uploadUrl: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
};
