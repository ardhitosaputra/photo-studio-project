/**
 * Interactive Canvas Editor Page
 * Full-featured photo editor with real-time filters, interactive stickers, frames,
 * multi-slot photo selector, and high-resolution compositing pipeline.
 */

import { router } from '../router.js';
import { icon } from '../utils/icons.js';
import { showToast } from '../components/toast.js';
import { CAPTURE_MODE, CAPTURE_CONFIG, FILTERS, STICKERS, FRAMES } from '../utils/constants.js';
import { drawFrame, compositePhoto, loadImage } from '../utils/canvas-utils.js';

export function createEditorPage(data = {}) {
  const routerData = router.getData();
  const rawPhotos = data.photos || routerData.photos || [];
  const mode = data.mode || routerData.mode || CAPTURE_MODE.SINGLE;
  const config = CAPTURE_CONFIG[mode] || CAPTURE_CONFIG[CAPTURE_MODE.SINGLE];

  const page = document.createElement('div');
  page.className = 'editor-page';

  if (!rawPhotos.length) {
    page.innerHTML = `
      <div class="editor-header">
        <button class="btn btn-ghost" id="btn-back">
          ${icon('arrowLeft', 20)}
          <span>Back</span>
        </button>
        <span class="editor-title">Photo Studio Editor</span>
        <div></div>
      </div>
      <div class="editor-canvas-area" style="flex-direction: column; gap: var(--space-4); text-align: center;">
        <div style="font-size: 48px;">📷</div>
        <h3 style="font-family: var(--font-display); font-size: var(--text-xl);">No Photos to Edit</h3>
        <p style="color: var(--text-secondary); max-width: 380px;">
          Please capture or upload photos from the camera first.
        </p>
        <button class="btn btn-primary" id="btn-go-camera" style="margin-top: var(--space-4);">
          ${icon('camera', 18)} Go to Camera
        </button>
      </div>
    `;

    requestAnimationFrame(() => {
      page.querySelector('#btn-back')?.addEventListener('click', () => router.navigate('home'));
      page.querySelector('#btn-go-camera')?.addEventListener('click', () => router.navigate('camera', { mode }));
    });

    return page;
  }

  // --- Editor State ---
  let activeIndex = 0;
  let activeTab = 'filters'; // 'filters' | 'stickers' | 'frames' | null
  let activeStickerCategory = 'emoji';
  let selectedStickerId = null;
  let isCompositing = false;

  // Individual edit state for each photo
  const photoEdits = rawPhotos.map(() => ({
    filter: 'none',
    frame: 'none',
    stickers: [], // Array of { id, content, x (%), y (%), size (px), rotation (deg) }
  }));

  // Pre-load image elements for fast switching
  const loadedImages = [];
  rawPhotos.forEach((src, idx) => {
    const img = new Image();
    img.src = src;
    loadedImages[idx] = img;
  });

  page.innerHTML = `
    <!-- Header -->
    <div class="editor-header">
      <button class="btn btn-ghost" id="btn-back">
        ${icon('arrowLeft', 20)}
        <span>Retake</span>
      </button>
      <div style="display: flex; align-items: center; gap: var(--space-2);">
        <span class="editor-title">Studio Editor</span>
        <span class="badge">${config.icon} ${config.label}</span>
      </div>
      <button class="btn btn-primary btn-sm" id="btn-done">
        ${icon('check', 18)}
        <span id="btn-done-text">Done</span>
      </button>
    </div>

    <!-- Multi-slot Photo Selector (Shown if multiple photos) -->
    ${rawPhotos.length > 1 ? `
      <div class="photo-slot-bar" id="photo-slot-bar">
        ${rawPhotos.map((src, i) => `
          <div class="photo-slot-item ${i === activeIndex ? 'active' : ''}" data-index="${i}">
            <img src="${src}" alt="Slot ${i + 1}" />
            <span class="photo-slot-badge">#${i + 1}</span>
          </div>
        `).join('')}
        <button class="apply-all-btn" id="btn-apply-all-filter" title="Apply active filter to all photos">
          Apply Filter All
        </button>
        <button class="apply-all-btn" id="btn-apply-all-frame" title="Apply active frame to all photos">
          Apply Frame All
        </button>
      </div>
    ` : ''}

    <!-- Main Editor Canvas Area -->
    <div class="editor-canvas-area" id="canvas-area">
      <div class="editor-canvas-wrapper" id="canvas-wrapper">
        <canvas id="editor-canvas"></canvas>
        <div class="sticker-canvas" id="sticker-container"></div>
      </div>
    </div>

    <!-- Bottom Drawer Panels -->
    <div class="editor-panel open" id="editor-panel">
      <div class="editor-panel-inner" id="panel-content">
        <!-- Rendered dynamically depending on active tab -->
      </div>
    </div>

    <!-- Toolbar -->
    <div class="editor-toolbar">
      <div class="toolbar">
        <div class="toolbar-item ${activeTab === 'filters' ? 'active' : ''}" data-tab="filters">
          ${icon('palette', 20)}
          <span>Filters</span>
        </div>
        <div class="toolbar-item ${activeTab === 'stickers' ? 'active' : ''}" data-tab="stickers">
          ${icon('sticker', 20)}
          <span>Stickers</span>
        </div>
        <div class="toolbar-item ${activeTab === 'frames' ? 'active' : ''}" data-tab="frames">
          ${icon('frame', 20)}
          <span>Frames</span>
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    const canvas = page.querySelector('#editor-canvas');
    const wrapper = page.querySelector('#canvas-wrapper');
    const stickerContainer = page.querySelector('#sticker-container');
    const panel = page.querySelector('#editor-panel');
    const panelContent = page.querySelector('#panel-content');
    const slotBar = page.querySelector('#photo-slot-bar');

    // Initial render
    renderMainCanvas();
    renderStickerOverlay();
    renderPanel();

    // --- Keyboard Shortcuts ---
    const handleEditorKeyDown = (e) => {
      if (e.target.matches('input, textarea')) return;

      // Delete selected sticker
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedStickerId) {
        e.preventDefault();
        const edit = photoEdits[activeIndex];
        edit.stickers = edit.stickers.filter(s => s.id !== selectedStickerId);
        selectedStickerId = null;
        renderStickerOverlay();
        showToast('Sticker deleted', 'info', 1200);
        return;
      }

      // Escape deselects
      if (e.key === 'Escape' && selectedStickerId) {
        selectedStickerId = null;
        renderStickerOverlay();
        return;
      }

      // 1-4 switch photo slot
      if (slotBar && ['1', '2', '3', '4'].includes(e.key)) {
        const slotIdx = parseInt(e.key, 10) - 1;
        if (slotIdx >= 0 && slotIdx < rawPhotos.length && slotIdx !== activeIndex) {
          activeIndex = slotIdx;
          selectedStickerId = null;
          slotBar.querySelectorAll('.photo-slot-item').forEach(el => el.classList.remove('active'));
          slotBar.querySelector(`[data-index="${slotIdx}"]`)?.classList.add('active');
          renderMainCanvas();
          renderStickerOverlay();
          renderPanel();
        }
      }
    };
    window.addEventListener('keydown', handleEditorKeyDown);

    // --- Back / Retake Handler ---
    page.querySelector('#btn-back')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to retake? Current edits will be lost.')) {
        window.removeEventListener('keydown', handleEditorKeyDown);
        router.navigate('camera', { mode });
      }
    });

    // --- Done / Finish Handler ---
    page.querySelector('#btn-done')?.addEventListener('click', async () => {
      if (isCompositing) return;
      isCompositing = true;

      const doneBtnText = page.querySelector('#btn-done-text');
      if (doneBtnText) doneBtnText.textContent = 'Processing...';

      try {
        showToast('Compositing final photos...', 'info', 1500);

        const displayWidth = canvas.clientWidth || 600;
        const finalPhotos = [];

        for (let i = 0; i < rawPhotos.length; i++) {
          const edit = photoEdits[i];
          const filterObj = FILTERS.find(f => f.id === edit.filter);
          const filterCSS = filterObj ? filterObj.css : 'none';

          const compositeDataUrl = await compositePhoto({
            photoSrc: rawPhotos[i],
            filterCSS: filterCSS,
            frameId: edit.frame,
            stickers: edit.stickers,
            displayWidth: displayWidth,
          });

          finalPhotos.push(compositeDataUrl);
        }

        window.removeEventListener('keydown', handleEditorKeyDown);
        showToast('Photos rendered successfully!', 'success');
        router.navigate('export', { finalPhotos, mode });
      } catch (err) {
        console.error('Compositing error:', err);
        showToast('Failed to composite photos. Please try again.', 'error');
      } finally {
        isCompositing = false;
        if (doneBtnText) doneBtnText.textContent = 'Done';
      }
    });

    // --- Photo Slot Switching ---
    if (slotBar) {
      slotBar.addEventListener('click', (e) => {
        const item = e.target.closest('.photo-slot-item');
        if (!item) return;

        const newIndex = parseInt(item.dataset.index, 10);
        if (newIndex === activeIndex) return;

        activeIndex = newIndex;
        selectedStickerId = null;

        slotBar.querySelectorAll('.photo-slot-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        renderMainCanvas();
        renderStickerOverlay();
        renderPanel();
      });

      // Apply Filter to All
      page.querySelector('#btn-apply-all-filter')?.addEventListener('click', () => {
        const currentFilter = photoEdits[activeIndex].filter;
        photoEdits.forEach(p => (p.filter = currentFilter));
        showToast(`Filter applied to all ${rawPhotos.length} photos!`, 'success');
      });

      // Apply Frame to All
      page.querySelector('#btn-apply-all-frame')?.addEventListener('click', () => {
        const currentFrame = photoEdits[activeIndex].frame;
        photoEdits.forEach(p => (p.frame = currentFrame));
        showToast(`Frame applied to all ${rawPhotos.length} photos!`, 'success');
      });
    }

    // --- Toolbar Tabs Switching ---
    page.querySelector('.toolbar')?.addEventListener('click', (e) => {
      const item = e.target.closest('.toolbar-item');
      if (!item) return;

      const tab = item.dataset.tab;
      if (activeTab === tab) {
        // Toggle panel collapse
        panel.classList.toggle('open');
      } else {
        activeTab = tab;
        panel.classList.add('open');
        page.querySelectorAll('.toolbar-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        renderPanel();
      }
    });

    // --- Render Main Canvas ---
    function renderMainCanvas() {
      const img = loadedImages[activeIndex];
      if (!img || !img.complete) {
        loadImage(rawPhotos[activeIndex]).then(loadedImg => {
          loadedImages[activeIndex] = loadedImg;
          renderMainCanvas();
        });
        return;
      }

      const w = img.naturalWidth || img.width || 1280;
      const h = img.naturalHeight || img.height || 960;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      const edit = photoEdits[activeIndex];
      const filterObj = FILTERS.find(f => f.id === edit.filter);

      // 1. Draw base photo with filter
      ctx.save();
      if (filterObj && filterObj.css) {
        ctx.filter = filterObj.css;
      }
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();

      // 2. Draw frame overlay
      if (edit.frame && edit.frame !== 'none') {
        drawFrame(canvas, edit.frame);
      }
    }

    // --- Render Interactive Sticker Overlay ---
    function renderStickerOverlay() {
      stickerContainer.innerHTML = '';
      const edit = photoEdits[activeIndex];

      edit.stickers.forEach((sticker) => {
        const el = document.createElement('div');
        el.className = `sticker-item ${sticker.id === selectedStickerId ? 'selected' : ''}`;
        el.dataset.id = sticker.id;

        el.style.left = `${sticker.x}%`;
        el.style.top = `${sticker.y}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg)`;
        el.style.fontSize = `${sticker.size || 48}px`;

        el.innerHTML = `
          <span>${sticker.content}</span>
          <div class="sticker-delete" title="Delete sticker">✕</div>
          <div class="sticker-resize" title="Resize sticker"></div>
        `;

        setupStickerInteractions(el, sticker, wrapper);
        stickerContainer.appendChild(el);
      });
    }

    // --- Setup Sticker Drag & Resize ---
    function setupStickerInteractions(el, sticker, container) {
      let isDragging = false;
      let isResizing = false;
      let startX = 0, startY = 0;
      let startSize = sticker.size || 48;

      // Click to select
      el.addEventListener('pointerdown', (e) => {
        if (e.target.classList.contains('sticker-delete')) {
          e.stopPropagation();
          const edit = photoEdits[activeIndex];
          edit.stickers = edit.stickers.filter(s => s.id !== sticker.id);
          selectedStickerId = null;
          renderStickerOverlay();
          return;
        }

        if (e.target.classList.contains('sticker-resize')) {
          e.stopPropagation();
          isResizing = true;
          startX = e.clientX;
          startSize = sticker.size || 48;
          el.setPointerCapture(e.pointerId);
          return;
        }

        isDragging = true;
        selectedStickerId = sticker.id;
        startX = e.clientX;
        startY = e.clientY;
        el.setPointerCapture(e.pointerId);

        // Update selected state visual
        container.querySelectorAll('.sticker-item').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
      });

      el.addEventListener('pointermove', (e) => {
        if (isDragging) {
          const rect = container.getBoundingClientRect();
          const deltaX = ((e.clientX - startX) / rect.width) * 100;
          const deltaY = ((e.clientY - startY) / rect.height) * 100;

          sticker.x = Math.max(5, Math.min(95, sticker.x + deltaX));
          sticker.y = Math.max(5, Math.min(95, sticker.y + deltaY));

          startX = e.clientX;
          startY = e.clientY;

          el.style.left = `${sticker.x}%`;
          el.style.top = `${sticker.y}%`;
        } else if (isResizing) {
          const delta = e.clientX - startX;
          const newSize = Math.max(24, Math.min(140, startSize + delta));
          sticker.size = newSize;
          el.style.fontSize = `${newSize}px`;
        }
      });

      const stopInteraction = (e) => {
        if (isDragging || isResizing) {
          isDragging = false;
          isResizing = false;
          try {
            el.releasePointerCapture(e.pointerId);
          } catch {}
        }
      };

      el.addEventListener('pointerup', stopInteraction);
      el.addEventListener('pointercancel', stopInteraction);
    }

    // --- Render Bottom Panel (Drawer Tabs) ---
    function renderPanel() {
      const edit = photoEdits[activeIndex];

      if (activeTab === 'filters') {
        panelContent.innerHTML = `
          <div class="editor-panel-header">
            <span class="editor-panel-title">Photo Filters (${FILTERS.length})</span>
            <span style="font-size: var(--text-xs); color: var(--text-muted);">Select a preset</span>
          </div>
          <div class="filter-list" id="filter-list">
            ${FILTERS.map(f => `
              <div class="filter-item ${f.id === edit.filter ? 'active' : ''}" data-filter="${f.id}">
                <div class="filter-thumb">
                  <div style="width: 100%; height: 100%; background: var(--bg-surface-hover); filter: ${f.css || 'none'}; border-radius: var(--radius-md);">
                    <img src="${rawPhotos[activeIndex]}" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                </div>
                <span class="filter-name">${f.name}</span>
              </div>
            `).join('')}
          </div>
        `;

        panelContent.querySelector('#filter-list')?.addEventListener('click', (e) => {
          const item = e.target.closest('.filter-item');
          if (!item) return;

          const filterId = item.dataset.filter;
          edit.filter = filterId;

          panelContent.querySelectorAll('.filter-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');

          renderMainCanvas();
        });
      } else if (activeTab === 'stickers') {
        const categoryList = Object.keys(STICKERS);

        panelContent.innerHTML = `
          <div class="editor-panel-header">
            <span class="editor-panel-title">Stickers & Props</span>
            <span style="font-size: var(--text-xs); color: var(--text-muted);">${edit.stickers.length} added</span>
          </div>

          <!-- Category Buttons -->
          <div class="sticker-categories" id="sticker-categories">
            ${categoryList.map(cat => `
              <button class="sticker-category-btn ${cat === activeStickerCategory ? 'active' : ''}" data-category="${cat}">
                ${cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            `).join('')}
          </div>

          <!-- Sticker Grid -->
          <div class="sticker-grid" id="sticker-grid">
            ${(STICKERS[activeStickerCategory] || []).map(s => `
              <div class="sticker-picker-item ripple" data-content="${s.content}" title="${s.label}">
                <span>${s.content}</span>
              </div>
            `).join('')}
          </div>
        `;

        // Switch sticker category
        panelContent.querySelector('#sticker-categories')?.addEventListener('click', (e) => {
          const btn = e.target.closest('.sticker-category-btn');
          if (!btn) return;
          activeStickerCategory = btn.dataset.category;
          renderPanel();
        });

        // Add sticker on click
        panelContent.querySelector('#sticker-grid')?.addEventListener('click', (e) => {
          const item = e.target.closest('.sticker-picker-item');
          if (!item) return;

          const content = item.dataset.content;
          const newSticker = {
            id: 'stk_' + Date.now(),
            content: content,
            x: 45 + Math.random() * 10,
            y: 45 + Math.random() * 10,
            size: 54,
            rotation: 0,
          };

          edit.stickers.push(newSticker);
          selectedStickerId = newSticker.id;
          renderStickerOverlay();
          showToast(`Sticker ${content} added! Drag to move.`, 'info', 1800);
        });
      } else if (activeTab === 'frames') {
        panelContent.innerHTML = `
          <div class="editor-panel-header">
            <span class="editor-panel-title">Frames & Borders</span>
            <span style="font-size: var(--text-xs); color: var(--text-muted);">Frame style</span>
          </div>
          <div class="frame-list" id="frame-list">
            ${FRAMES.map(fr => `
              <div class="frame-item ${fr.id === edit.frame ? 'active' : ''}" data-frame="${fr.id}">
                <div class="frame-thumb">
                  <span style="font-size: 24px;">${fr.icon}</span>
                </div>
                <span class="frame-name">${fr.name}</span>
              </div>
            `).join('')}
          </div>
        `;

        panelContent.querySelector('#frame-list')?.addEventListener('click', (e) => {
          const item = e.target.closest('.frame-item');
          if (!item) return;

          const frameId = item.dataset.frame;
          edit.frame = frameId;

          panelContent.querySelectorAll('.frame-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');

          renderMainCanvas();
        });
      }
    }
  });

  return page;
}
