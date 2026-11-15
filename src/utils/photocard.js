/**
 * Photocard Canvas Layout Engine (Monochrome Edition)
 * Generates unified, high-resolution printable photocard sheets:
 * - 1 Photo: Polaroid, Minimal Card, Borderless
 * - 2 Photos: 2-Cut Vertical Strip, Duo Split Card
 * - 4 Photos: 4-Cut Classic Strip, 2x2 Quad Grid
 */

import { loadImage } from './canvas-utils.js';

export const CARD_THEMES = [
  { id: 'white', name: 'Classic White', bg: '#ffffff', text: '#111111', subtext: '#555555', border: '#e5e7eb' },
  { id: 'black', name: 'Midnight Black', bg: '#0a0a0a', text: '#ffffff', subtext: '#a1a1aa', border: '#262626' },
  { id: 'paper', name: 'Paper Gray', bg: '#f4f4f5', text: '#18181b', subtext: '#71717a', border: '#d4d4d8' },
  { id: 'charcoal', name: 'Dark Charcoal', bg: '#18181b', text: '#fafafa', subtext: '#a1a1aa', border: '#27272a' },
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
 * @param {string} [options.layout] - Layout type
 * @param {string} [options.themeId='white'] - Theme ID from CARD_THEMES
 * @param {string} [options.memoText=''] - Optional custom user caption
 * @returns {Promise<{ canvas: HTMLCanvasElement, dataUrl: string, blob: Blob }>}
 */
export async function renderPhotocard({ photos = [], layout, themeId = 'white', memoText = '' }) {
  const theme = CARD_THEMES.find(t => t.id === themeId) || CARD_THEMES[0];
  const loadedImgs = await Promise.all(photos.map(src => loadImage(src)));
  const dateStr = getFormattedDate();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Normalize layout based on photo count if not provided
  let activeLayout = layout;
  if (!activeLayout) {
    if (photos.length === 1) activeLayout = 'polaroid';
    else if (photos.length === 2) activeLayout = 'strip_2';
    else activeLayout = 'strip_4';
  }

  switch (activeLayout) {
    // 2-Shot Layouts
    case 'strip_2':
      renderVerticalStrip2(canvas, ctx, loadedImgs, theme, memoText, dateStr);
      break;
    case 'duo_card':
      renderDuoSplit(canvas, ctx, loadedImgs, theme, memoText, dateStr);
      break;

    // 4-Shot Layouts
    case 'grid':
    case 'grid_2x2':
      renderGrid2x2(canvas, ctx, loadedImgs, theme, memoText, dateStr);
      break;
    case 'strip':
    case 'strip_4':
      renderVerticalStrip4(canvas, ctx, loadedImgs, theme, memoText, dateStr);
      break;

    // 1-Shot Layouts
    case 'minimal':
      renderMinimalCard(canvas, ctx, loadedImgs[0], theme, memoText, dateStr);
      break;
    case 'borderless':
      renderBorderless(canvas, ctx, loadedImgs[0], theme, memoText, dateStr);
      break;
    case 'polaroid':
    default:
      renderPolaroid(canvas, ctx, loadedImgs[0], theme, memoText, dateStr);
      break;
  }

  const dataUrl = canvas.toDataURL('image/png', 0.98);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.98));

  return { canvas, dataUrl, blob };
}

/**
 * Render Vertical 4-Cut Photobooth Strip
 */
function renderVerticalStrip4(canvas, ctx, images, theme, memoText, dateStr) {
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

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;

    const radius = 18;
    ctx.beginPath();
    ctx.roundRect(marginX, y, photoW, photoH, radius);
    ctx.clip();

    drawImageCover(ctx, img, marginX, y, photoW, photoH);
    ctx.restore();
  });

  // Footer area
  const footerY = marginTop + count * photoH + (count - 1) * gap;
  drawStripFooter(ctx, width, footerY, theme, memoText, dateStr);
}

/**
 * Render Vertical 2-Cut Photobooth Strip
 */
function renderVerticalStrip2(canvas, ctx, images, theme, memoText, dateStr) {
  const width = 1200;
  const marginX = 80;
  const marginTop = 80;
  const gap = 50;
  const photoW = width - marginX * 2; // 1040px
  const photoH = Math.round(photoW * 0.75); // 780px (4:3 aspect ratio)
  const count = Math.min(images.length, 2);

  const footerH = 360;
  const height = marginTop + count * photoH + (count - 1) * gap + footerH;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw 2 photos
  images.slice(0, count).forEach((img, i) => {
    const y = marginTop + i * (photoH + gap);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;

    const radius = 20;
    ctx.beginPath();
    ctx.roundRect(marginX, y, photoW, photoH, radius);
    ctx.clip();

    drawImageCover(ctx, img, marginX, y, photoW, photoH);
    ctx.restore();
  });

  // Footer area
  const footerY = marginTop + count * photoH + (count - 1) * gap;
  drawStripFooter(ctx, width, footerY, theme, memoText, dateStr);
}

/**
 * Render Side-by-Side Duo Split Photocard (2 Photos)
 */
function renderDuoSplit(canvas, ctx, images, theme, memoText, dateStr) {
  const width = 2400;
  const marginX = 100;
  const marginTop = 100;
  const gap = 60;
  const colW = (width - marginX * 2 - gap) / 2; // 1070px
  const colH = Math.round(colW * 0.75); // 802px (4:3 aspect ratio, exact match with camera)
  const footerH = 340;
  const height = marginTop + colH + footerH;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // 2 Photos side-by-side
  const count = Math.min(images.length, 2);
  for (let i = 0; i < count; i++) {
    const x = marginX + i * (colW + gap);
    const img = images[i];
    if (!img) continue;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;

    const radius = 20;
    ctx.beginPath();
    ctx.roundRect(x, marginTop, colW, colH, radius);
    ctx.clip();

    drawImageCover(ctx, img, x, marginTop, colW, colH);
    ctx.restore();
  }

  // Footer area
  const footerY = marginTop + colH;
  drawStripFooter(ctx, width, footerY, theme, memoText, dateStr);
}

/**
 * Render 2x2 Grid Photocard (4 Photos)
 */
function renderGrid2x2(canvas, ctx, images, theme, memoText, dateStr) {
  const width = 2400;
  const marginX = 100;
  const marginTop = 100;
  const gap = 60;
  const colW = (width - marginX * 2 - gap) / 2; // 1070px
  const colH = Math.round(colW * 0.75); // 802px (4:3 aspect ratio)
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
  });

  // Footer
  const footerY = marginTop + colH * 2 + gap;
  drawStripFooter(ctx, width, footerY, theme, memoText, dateStr);
}

/**
 * Render Single Classic Polaroid
 */
function renderPolaroid(canvas, ctx, img, theme, memoText, dateStr) {
  const width = 1400;
  const marginX = 100;
  const marginTop = 100;
  const photoW = width - marginX * 2; // 1200px
  const photoH = Math.round(photoW * 0.75); // 900px (4:3 matching camera exactly!)
  const footerH = 380;
  const height = marginTop + photoH + footerH;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw Photo
  if (img) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.14)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;

    const radius = 18;
    ctx.beginPath();
    ctx.roundRect(marginX, marginTop, photoW, photoH, radius);
    ctx.clip();

    drawImageCover(ctx, img, marginX, marginTop, photoW, photoH);
    ctx.restore();
  }

  // Footer
  const footerY = marginTop + photoH;
  drawStripFooter(ctx, width, footerY, theme, memoText, dateStr);
}

/**
 * Render Single Minimal Card with Thin Modern Border
 */
function renderMinimalCard(canvas, ctx, img, theme, memoText, dateStr) {
  const width = 1400;
  const marginX = 80;
  const marginTop = 80;
  const photoW = width - marginX * 2;
  const photoH = Math.round(photoW * 0.75); // 4:3
  const footerH = 320;
  const height = marginTop + photoH + footerH;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle outer framing line
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Draw Photo
  if (img) {
    ctx.save();
    const radius = 8;
    ctx.beginPath();
    ctx.roundRect(marginX, marginTop, photoW, photoH, radius);
    ctx.clip();
    drawImageCover(ctx, img, marginX, marginTop, photoW, photoH);
    ctx.restore();
  }

  // Footer
  const footerY = marginTop + photoH;
  drawStripFooter(ctx, width, footerY, theme, memoText, dateStr);
}

/**
 * Render Single Borderless Modern Card
 */
function renderBorderless(canvas, ctx, img, theme, memoText, dateStr) {
  const width = 1400;
  const photoW = width;
  const photoH = Math.round(photoW * 0.75); // 4:3
  const footerH = 280;
  const height = photoH + footerH;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Draw Photo full bleed on top
  if (img) {
    drawImageCover(ctx, img, 0, 0, photoW, photoH);
  }

  // Footer
  const footerY = photoH;
  drawStripFooter(ctx, width, footerY, theme, memoText, dateStr);
}

/**
 * Universal Shared Footer Generator
 */
function drawStripFooter(ctx, width, footerY, theme, memoText, dateStr) {
  ctx.save();
  ctx.textAlign = 'center';

  // Branding
  ctx.fillStyle = theme.text;
  ctx.font = '700 38px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '8px';
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
    ctx.letterSpacing = '4px';
    ctx.fillText(dateStr, width / 2, footerY + 245);
  } else {
    // Date
    ctx.fillStyle = theme.subtext;
    ctx.font = '400 28px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText(dateStr, width / 2, footerY + 185);
  }

  // Micro dot accent
  ctx.fillStyle = theme.subtext;
  ctx.beginPath();
  ctx.arc(width / 2, footerY + 275, 4, 0, Math.PI * 2);
  ctx.fill();

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
