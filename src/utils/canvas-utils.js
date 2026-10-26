/**
 * Canvas utility functions
 */

/**
 * Draw image to canvas maintaining aspect ratio
 */
export function drawImageToCanvas(canvas, image, filter = null) {
  const ctx = canvas.getContext('2d');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  
  ctx.save();
  if (filter) {
    ctx.filter = filter;
  }
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}

/**
 * Apply CSS filter string to canvas
 */
export function applyFilterToCanvas(canvas, sourceCanvas, filterCSS) {
  const ctx = canvas.getContext('2d');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  
  ctx.save();
  if (filterCSS) {
    ctx.filter = filterCSS;
  }
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.restore();
}

/**
 * Draw emoji text as sticker on canvas
 */
export function drawEmojiOnCanvas(ctx, emoji, x, y, size) {
  ctx.save();
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);
  ctx.restore();
}

/**
 * Draw frame overlay on canvas
 */
export function drawFrame(canvas, frameId) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.save();
  
  switch (frameId) {
    case 'polaroid':
      drawPolaroidFrame(ctx, w, h);
      break;
    case 'vintage':
      drawVintageFrame(ctx, w, h);
      break;
    case 'neon':
      drawNeonFrame(ctx, w, h);
      break;
    case 'minimal':
      drawMinimalFrame(ctx, w, h);
      break;
    case 'film':
      drawFilmFrame(ctx, w, h);
      break;
    case 'gradient':
      drawGradientFrame(ctx, w, h);
      break;
  }
  
  ctx.restore();
}

function drawPolaroidFrame(ctx, w, h) {
  const border = Math.min(w, h) * 0.04;
  const bottomBorder = border * 3;
  
  // White border
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, border); // top
  ctx.fillRect(0, 0, border, h); // left
  ctx.fillRect(w - border, 0, border, h); // right
  ctx.fillRect(0, h - bottomBorder, w, bottomBorder); // bottom (wider)
  
  // Subtle shadow line
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(border, border, w - border * 2, h - border - bottomBorder);
}

function drawVintageFrame(ctx, w, h) {
  const border = Math.min(w, h) * 0.05;
  
  // Warm toned border
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(0, 0, w, border);
  ctx.fillRect(0, 0, border, h);
  ctx.fillRect(w - border, 0, border, h);
  ctx.fillRect(0, h - border, w, border);
  
  // Inner line
  const inner = border * 0.3;
  ctx.strokeStyle = '#b8956a';
  ctx.lineWidth = 2;
  ctx.strokeRect(border - inner, border - inner, w - (border - inner) * 2, h - (border - inner) * 2);
  
  // Corner decorations
  const cs = border * 0.6;
  ctx.strokeStyle = '#c4a882';
  ctx.lineWidth = 1.5;
  
  // Top-left
  ctx.beginPath();
  ctx.arc(border, border, cs, 0, Math.PI / 2);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.arc(w - border, border, cs, Math.PI / 2, Math.PI);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.arc(border, h - border, cs, -Math.PI / 2, 0);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.arc(w - border, h - border, cs, Math.PI, Math.PI * 1.5);
  ctx.stroke();
}

function drawNeonFrame(ctx, w, h) {
  const border = Math.min(w, h) * 0.02;
  const offset = border + 4;
  
  // Glow layers
  for (let i = 3; i >= 0; i--) {
    const glow = i * 4;
    ctx.shadowColor = '#a78bfa';
    ctx.shadowBlur = 10 + glow * 2;
    ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 + i * 0.15})`;
    ctx.lineWidth = border + glow;
    ctx.strokeRect(offset + glow, offset + glow, w - (offset + glow) * 2, h - (offset + glow) * 2);
  }
  
  // Second color glow
  ctx.shadowColor = '#60a5fa';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
  ctx.lineWidth = border;
  ctx.strokeRect(offset - 2, offset - 2, w - (offset - 2) * 2, h - (offset - 2) * 2);
  
  ctx.shadowBlur = 0;
}

function drawMinimalFrame(ctx, w, h) {
  const border = Math.min(w, h) * 0.025;
  
  // Thin elegant white border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(border, border, w - border * 2, h - border * 2);
  
  // Outer subtle line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(border * 0.5, border * 0.5, w - border, h - border);
}

function drawFilmFrame(ctx, w, h) {
  const stripWidth = Math.min(w, h) * 0.06;
  
  // Black strips top and bottom
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, w, stripWidth);
  ctx.fillRect(0, h - stripWidth, w, stripWidth);
  
  // Film holes
  const holeSize = stripWidth * 0.4;
  const holeGap = holeSize * 2;
  const holesCount = Math.floor(w / holeGap);
  
  ctx.fillStyle = '#333333';
  for (let i = 0; i < holesCount; i++) {
    const x = holeGap * 0.5 + i * holeGap;
    // Top holes
    ctx.beginPath();
    ctx.roundRect(x - holeSize / 2, (stripWidth - holeSize) / 2, holeSize, holeSize, 2);
    ctx.fill();
    // Bottom holes
    ctx.beginPath();
    ctx.roundRect(x - holeSize / 2, h - stripWidth + (stripWidth - holeSize) / 2, holeSize, holeSize, 2);
    ctx.fill();
  }
}

function drawGradientFrame(ctx, w, h) {
  const border = Math.min(w, h) * 0.03;
  
  // Gradient border using four rects
  const gradient1 = ctx.createLinearGradient(0, 0, w, 0);
  gradient1.addColorStop(0, '#a78bfa');
  gradient1.addColorStop(0.5, '#60a5fa');
  gradient1.addColorStop(1, '#4ade80');
  
  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, w, border); // top
  ctx.fillRect(0, h - border, w, border); // bottom
  
  const gradient2 = ctx.createLinearGradient(0, 0, 0, h);
  gradient2.addColorStop(0, '#a78bfa');
  gradient2.addColorStop(0.5, '#60a5fa');
  gradient2.addColorStop(1, '#4ade80');
  
  ctx.fillStyle = gradient2;
  ctx.fillRect(0, 0, border, h); // left
  ctx.fillRect(w - border, 0, border, h); // right
}

/**
 * Canvas to blob
 */
export function canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

/**
 * Canvas to data URL
 */
export function canvasToDataURL(canvas, type = 'image/png', quality = 0.92) {
  return canvas.toDataURL(type, quality);
}

/**
 * Load image from URL
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Create a thumbnail canvas
 */
export function createThumbnail(sourceCanvas, size = 64) {
  const thumb = document.createElement('canvas');
  thumb.width = size;
  thumb.height = size;
  const ctx = thumb.getContext('2d');
  
  // Center crop
  const srcAspect = sourceCanvas.width / sourceCanvas.height;
  let sx = 0, sy = 0, sw = sourceCanvas.width, sh = sourceCanvas.height;
  
  if (srcAspect > 1) {
    sw = sourceCanvas.height;
    sx = (sourceCanvas.width - sw) / 2;
  } else {
    sh = sourceCanvas.width;
    sy = (sourceCanvas.height - sh) / 2;
  }
  
  ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, size, size);
  return thumb;
}
