/**
 * Photocard Canvas Layout Engine
 * Generates unified, high-resolution printable photocard sheets (Strip, Grid 2x2, Polaroid)
 */

import { loadImage } from './canvas-utils.js';

export const CARD_THEMES = [
  { id: 'white', name: 'Classic White', bg: '#ffffff', text: '#111111', subtext: '#555555', border: '#e5e7eb' },
  { id: 'black', name: 'Midnight Black', bg: '#121212', text: '#f3f4f6', subtext: '#9ca3af', border: '#262626' },
  { id: 'pink', name: 'Pastel Pink', bg: '#ffe4e6', text: '#881337', subtext: '#9f1239', border: '#fecdd3' },
  { id: 'blue', name: 'Sky Blue', bg: '#e0f2fe', text: '#0369a1', subtext: '#0284c7', border: '#bae6fd' },
  { id: 'cream', name: 'Vintage Cream', bg: '#fef3c7', text: '#78350f', subtext: '#92400e', border: '#fde68a' },
];

/**
 * Format current date string: YYYY.MM.DD
 */
export function getFormattedDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

/**
 * Generate a complete photocard canvas with given photos, layout, and theme
 * @param {Object} options
 * @param {string[]} options.photos - Array of Base64 DataURLs
 * @param {'strip'|'grid'|'single'} options.layout - Layout type
 * @param {string} [options.themeId='white'] - Theme ID from CARD_THEMES
 * @param {string} [options.memoText=''] - Optional custom user caption
 * @returns {Promise<{ canvas: HTMLCanvasElement, dataUrl: string, blob: Blob }>}
 */
export async function renderPhotocard({ photos, layout = 'strip', themeId = 'white', memoText = '' }) {
  const theme = CARD_THEMES.find(t => t.id === themeId) || CARD_THEMES[0];
  const loadedImgs = await Promise.all(photos.map(src => loadImage(src)));
  const dateStr = getFormattedDate();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (layout === 'strip') {
    renderVerticalStrip(canvas, ctx, loadedImgs, theme, memoText, dateStr);
  } else if (layout === 'grid') {
    renderGrid2x2(canvas, ctx, loadedImgs, theme, memoText, dateStr);
  } else {
    renderPolaroid(canvas, ctx, loadedImgs[0], theme, memoText, dateStr);
  }

  const dataUrl = canvas.toDataURL('image/png', 0.98);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.98));

  return { canvas, dataUrl, blob };
}

/**
 * Render Vertical 4-Cut Photobooth Strip
 */
function renderVerticalStrip(canvas, ctx, images, theme, memoText, dateStr) {
  const width = 1200;
  const marginX = 80;
  const marginTop = 80;
  const gap = 44;
  const photoW = width - marginX * 2; // 1040px
  const photoH = Math.round(photoW * 0.75); // 780px (4:3 aspect ratio)
  const count = Math.min(images.length, 4);

  const footerH = 380;
  const height = marginTop + count * photoH + (count - 1) * gap + footerH;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw photos
  images.slice(0, count).forEach((img, i) => {
    const y = marginTop + i * (photoH + gap);

    // Photo shadow & border
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;

    // Rounded rectangle clip
    const radius = 18;
    ctx.beginPath();
    ctx.roundRect(marginX, y, photoW, photoH, radius);
    ctx.clip();

    drawImageCover(ctx, img, marginX, y, photoW, photoH);
    ctx.restore();

    // Subtle outline
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(marginX, y, photoW, photoH, radius);
    ctx.stroke();
  });

  // Footer area
  const footerY = marginTop + count * photoH + (count - 1) * gap;
  ctx.save();
  ctx.textAlign = 'center';

  // Branding
  ctx.fillStyle = theme.text;
  ctx.font = '700 38px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('✦ PHOTO STUDIO ✦', width / 2, footerY + 110);

  // Custom Memo Text
  if (memoText && memoText.trim()) {
    ctx.fillStyle = theme.text;
    ctx.font = '500 32px "Inter", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(`"${memoText.trim()}"`, width / 2, footerY + 185);

    // Date
    ctx.fillStyle = theme.subtext;
    ctx.font = '400 24px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(dateStr, width / 2, footerY + 245);
  } else {
    // Date (larger if no memo)
    ctx.fillStyle = theme.subtext;
    ctx.font = '400 28px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(dateStr, width / 2, footerY + 185);
  }

  // Micro dot accent
  ctx.fillStyle = theme.subtext;
  ctx.beginPath();
  ctx.arc(width / 2, footerY + 280, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render 2x2 Grid Photocard
 */
function renderGrid2x2(canvas, ctx, images, theme, memoText, dateStr) {
  const width = 2400;
  const marginX = 100;
  const marginTop = 100;
  const gap = 60;
  const colW = (width - marginX * 2 - gap) / 2; // 1070px
  const colH = Math.round(colW * 0.75); // 802px
  const footerH = 340;
  const height = marginTop + colH * 2 + gap + footerH;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw 4 photos
  const positions = [
    { x: marginX, y: marginTop },
    { x: marginX + colW + gap, y: marginTop },
    { x: marginX, y: marginTop + colH + gap },
    { x: marginX + colW + gap, y: marginTop + colH + gap },
  ];

  positions.forEach((pos, i) => {
    const img = images[i] || images[0];
    if (!img) return;

    ctx.save();
    const radius = 24;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, colW, colH, radius);
    ctx.clip();

    drawImageCover(ctx, img, pos.x, pos.y, colW, colH);
    ctx.restore();

    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, colW, colH, radius);
    ctx.stroke();
  });

  // Footer
  const footerY = marginTop + colH * 2 + gap;
  ctx.save();
  ctx.textAlign = 'center';

  // Branding
  ctx.fillStyle = theme.text;
  ctx.font = '700 52px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('✦ PHOTO STUDIO ✦', width / 2, footerY + 120);

  if (memoText && memoText.trim()) {
    ctx.font = '500 40px "Inter", sans-serif';
    ctx.fillText(`"${memoText.trim()}"`, width / 2, footerY + 200);

    ctx.fillStyle = theme.subtext;
    ctx.font = '400 30px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(dateStr, width / 2, footerY + 265);
  } else {
    ctx.fillStyle = theme.subtext;
    ctx.font = '400 36px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(dateStr, width / 2, footerY + 210);
  }

  ctx.restore();
}

/**
 * Render Single Polaroid Card
 */
function renderPolaroid(canvas, ctx, img, theme, memoText, dateStr) {
  const width = 1400;
  const marginX = 100;
  const marginTop = 100;
  const photoW = width - marginX * 2; // 1200px
  const photoH = Math.round(photoW * 0.85); // 1020px
  const footerH = 440;
  const height = marginTop + photoH + footerH;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Outer border line
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Draw Photo
  if (img) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;

    const radius = 12;
    ctx.beginPath();
    ctx.roundRect(marginX, marginTop, photoW, photoH, radius);
    ctx.clip();

    drawImageCover(ctx, img, marginX, marginTop, photoW, photoH);
    ctx.restore();

    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(marginX, marginTop, photoW, photoH, radius);
    ctx.stroke();
  }

  // Footer Memo & Date
  const footerY = marginTop + photoH;
  ctx.save();
  ctx.textAlign = 'center';

  if (memoText && memoText.trim()) {
    ctx.fillStyle = theme.text;
    ctx.font = '600 48px "Inter", cursive, sans-serif';
    ctx.fillText(`"${memoText.trim()}"`, width / 2, footerY + 160);

    ctx.fillStyle = theme.subtext;
    ctx.font = '400 30px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(dateStr, width / 2, footerY + 240);
  } else {
    ctx.fillStyle = theme.text;
    ctx.font = '700 44px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('✦ PHOTO STUDIO ✦', width / 2, footerY + 160);

    ctx.fillStyle = theme.subtext;
    ctx.font = '400 30px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(dateStr, width / 2, footerY + 230);
  }

  ctx.restore();
}

/**
 * Helper to draw an image centered and cropped (cover style)
 */
function drawImageCover(ctx, img, x, y, targetW, targetH) {
  const srcAspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
  const targetAspect = targetW / targetH;

  let sx = 0, sy = 0, sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;

  if (srcAspect > targetAspect) {
    sw = sh * targetAspect;
    sx = ((img.naturalWidth || img.width) - sw) / 2;
  } else {
    sh = sw / targetAspect;
    sy = ((img.naturalHeight || img.height) - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, targetW, targetH);
}

