/**
 * App-wide constants & configuration (Monochrome Edition)
 */

export const APP_NAME = 'Photo Studio';
export const APP_TAGLINE = 'Noir & Minimalist Photobooth';

// Capture modes (Strictly shots count: 1, 2, or 4)
export const CAPTURE_MODE = {
  SINGLE: 'single',
  TWO_SHOT: 'two_shot',
  FOUR_SHOT: 'four_shot',
};

// Capture mode configs for Landing Page
export const CAPTURE_CONFIG = {
  [CAPTURE_MODE.SINGLE]: { shots: 1, label: 'Single Shot', iconName: 'singleShot', desc: '1 Photo' },
  [CAPTURE_MODE.TWO_SHOT]: { shots: 2, label: '2 Shots', iconName: 'twoShot', desc: '2 Photos' },
  [CAPTURE_MODE.FOUR_SHOT]: { shots: 4, label: '4 Shots', iconName: 'fourShot', desc: '4 Photos' },
};

// Filter presets (Curated Monochrome & Noir grading)
export const FILTERS = [
  { id: 'none', name: 'Original', matrix: null },
  { id: 'bw-classic', name: 'B&W Classic', css: 'grayscale(100%)' },
  { id: 'noir', name: 'High Noir', css: 'grayscale(100%) contrast(155%) brightness(88%)' },
  { id: 'silver', name: 'Silvertone', css: 'grayscale(100%) contrast(110%) brightness(108%)' },
  { id: 'matte', name: 'Matte Charcoal', css: 'grayscale(100%) contrast(90%) brightness(115%)' },
  { id: 'high-key', name: 'High Key', css: 'grayscale(100%) contrast(125%) brightness(120%)' },
  { id: 'darkroom', name: 'Darkroom', css: 'grayscale(100%) contrast(175%) brightness(80%)' },
  { id: 'vintage-bw', name: 'Faded B&W', css: 'grayscale(100%) contrast(95%) sepia(15%)' },
];

// Sticker catalog (Monochrome aesthetic symbols, props, and stamps)
export const STICKERS = {
  symbols: [
    { id: 's1', content: '✦', label: 'Spark' },
    { id: 's2', content: '✧', label: 'Star Light' },
    { id: 's3', content: '★', label: 'Star Solid' },
    { id: 's4', content: '☆', label: 'Star Hollow' },
    { id: 's5', content: '🖤', label: 'Black Heart' },
    { id: 's6', content: '🤍', label: 'White Heart' },
    { id: 's7', content: '♠️', label: 'Spade' },
    { id: 's8', content: '♣️', label: 'Club' },
    { id: 's9', content: '♟️', label: 'Pawn' },
    { id: 's10', content: '⚡', label: 'Lightning' },
    { id: 's11', content: '〰️', label: 'Wavy' },
    { id: 's12', content: '☾', label: 'Crescent Moon' },
  ],
  props: [
    { id: 'p1', content: '🕶️', label: 'Sunglasses' },
    { id: 'p2', content: '🎩', label: 'Top Hat' },
    { id: 'p3', content: '📸', label: 'Camera' },
    { id: 'p4', content: '🎞️', label: 'Film Strip' },
    { id: 'p5', content: '🎧', label: 'Headphones' },
    { id: 'p6', content: '🕊️', label: 'Dove' },
    { id: 'p7', content: '☕', label: 'Coffee' },
    { id: 'p8', content: '🎀', label: 'Ribbon' },
  ],
};

// Available Fonts for Text Insertion Feature
export const TEXT_FONTS = [
  { id: 'space', name: 'Display', fontFamily: "'Space Grotesk', sans-serif" },
  { id: 'serif', name: 'Serif', fontFamily: "'Playfair Display', Georgia, serif" },
  { id: 'handwriting', name: 'Script', fontFamily: "'Caveat', cursive" },
  { id: 'typewriter', name: 'Typewriter', fontFamily: "'Courier Prime', monospace" },
  { id: 'clean', name: 'Sans', fontFamily: "'Inter', sans-serif" },
];

// Dynamic Layout options for the Export page (determined by photo count)
export const LAYOUT_OPTIONS = {
  1: [
    { id: 'polaroid', name: 'Polaroid', iconName: 'layoutPolaroid', desc: 'Classic Polaroid' },
    { id: 'minimal', name: 'Minimal Card', iconName: 'layoutMinimal', desc: 'Sleek Border' },
    { id: 'borderless', name: 'Borderless', iconName: 'layoutBorderless', desc: 'Full Bleed' },
  ],
  2: [
    { id: 'strip_2', name: '2-Cut Strip', iconName: 'layoutStrip2', desc: 'Vertical Duo' },
    { id: 'duo_card', name: 'Duo Split', iconName: 'layoutDuo', desc: 'Side by Side' },
  ],
  4: [
    { id: 'strip_4', name: '4-Cut Strip', iconName: 'layoutStrip4', desc: 'Classic Photobooth' },
    { id: 'grid_2x2', name: '2×2 Grid', iconName: 'layoutGrid2x2', desc: 'Quad Grid' },
  ],
};

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
