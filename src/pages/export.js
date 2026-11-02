/**
 * Export & Share Page
 * Displays finalized composite photos with layout selector, print, and download actions
 */

import { router } from '../router.js';
import { icon } from '../utils/icons.js';
import { showToast } from '../components/toast.js';
import { CAPTURE_MODE, CAPTURE_CONFIG, LAYOUTS } from '../utils/constants.js';

export function createExportPage(data = {}) {
  const routerData = router.getData();
  const finalPhotos = data.finalPhotos || routerData.finalPhotos || [];
  const mode = data.mode || routerData.mode || CAPTURE_MODE.SINGLE;
  const config = CAPTURE_CONFIG[mode] || CAPTURE_CONFIG[CAPTURE_MODE.SINGLE];

  const page = document.createElement('div');
  page.className = 'export-page';

  if (!finalPhotos.length) {
    page.innerHTML = `
      <div class="export-header">
        <button class="btn btn-ghost" id="btn-back">
          ${icon('arrowLeft', 20)}
          <span>Editor</span>
        </button>
        <span class="export-title">Export & Share</span>
        <div></div>
      </div>
      <div class="export-content" style="justify-content: center; text-align: center;">
        <div style="font-size: 48px;">🖼️</div>
        <h3 style="font-family: var(--font-display); font-size: var(--text-xl);">No Final Photos Found</h3>
        <p style="color: var(--text-secondary); max-width: 360px;">
          Please edit your photos in the canvas editor first.
        </p>
        <button class="btn btn-primary" id="btn-go-home" style="margin-top: var(--space-4);">
          ${icon('camera', 18)} Start New Session
        </button>
      </div>
    `;

    requestAnimationFrame(() => {
      page.querySelector('#btn-back')?.addEventListener('click', () => router.navigate('editor'));
      page.querySelector('#btn-go-home')?.addEventListener('click', () => router.navigate('home'));
    });

    return page;
  }

  let selectedLayout = mode === CAPTURE_MODE.STRIP ? 'strip' : (mode === CAPTURE_MODE.GRID ? 'grid' : 'single');

  page.innerHTML = `
    <!-- Header -->
    <div class="export-header">
      <button class="btn btn-ghost" id="btn-back">
        ${icon('arrowLeft', 20)}
        <span>Editor</span>
      </button>
      <div style="display: flex; align-items: center; gap: var(--space-2);">
        <span class="export-title">Export & Share</span>
        <span class="badge">${config.icon} ${config.label}</span>
      </div>
      <button class="btn btn-ghost" id="btn-new">
        <span>New Photo</span>
      </button>
    </div>

    <!-- Content -->
    <div class="export-content">
      <!-- Preview Container -->
      <div class="export-preview print-content" id="export-preview-card">
        ${renderPreviewLayout(finalPhotos, selectedLayout)}
      </div>

      <!-- Layout Selector (if multi-photo) -->
      ${finalPhotos.length > 1 ? `
        <div class="layout-section no-print">
          <h3>Photocard Layout</h3>
          <div class="layout-options" id="layout-options">
            ${LAYOUTS.map(l => `
              <div class="layout-option ${l.id === selectedLayout ? 'active' : ''}" data-layout="${l.id}">
                <div class="layout-icon">${l.icon}</div>
                <div class="layout-label">${l.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Actions Grid -->
      <div class="export-actions no-print">
        <button class="export-action-btn" id="btn-download">
          <div class="export-action-icon download">${icon('download', 24)}</div>
          <div class="export-action-label">Download</div>
          <div class="export-action-desc">Save image to device</div>
        </button>

        <button class="export-action-btn" id="btn-print">
          <div class="export-action-icon print">${icon('printer', 24)}</div>
          <div class="export-action-label">Print Photocard</div>
          <div class="export-action-desc">Ready to print</div>
        </button>

        <button class="export-action-btn" id="btn-share">
          <div class="export-action-icon share">${icon('share', 24)}</div>
          <div class="export-action-label">Share</div>
          <div class="export-action-desc">Send to socials</div>
        </button>

        <button class="export-action-btn" id="btn-drive">
          <div class="export-action-icon drive">${icon('cloud', 24)}</div>
          <div class="export-action-label">Google Drive</div>
          <div class="export-action-desc">Save to cloud</div>
        </button>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    // Back to Editor
    page.querySelector('#btn-back')?.addEventListener('click', () => {
      router.navigate('editor');
    });

    // Start New
    page.querySelector('#btn-new')?.addEventListener('click', () => {
      router.navigate('home');
    });

    // Layout switcher
    const layoutContainer = page.querySelector('#layout-options');
    if (layoutContainer) {
      layoutContainer.addEventListener('click', (e) => {
        const option = e.target.closest('.layout-option');
        if (!option) return;

        selectedLayout = option.dataset.layout;
        layoutContainer.querySelectorAll('.layout-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');

        const previewCard = page.querySelector('#export-preview-card');
        if (previewCard) {
          previewCard.innerHTML = renderPreviewLayout(finalPhotos, selectedLayout);
        }
      });
    }

    // Download button
    page.querySelector('#btn-download')?.addEventListener('click', () => {
      finalPhotos.forEach((src, idx) => {
        const link = document.createElement('a');
        link.download = `photobooth-${Date.now()}-${idx + 1}.png`;
        link.href = src;
        link.click();
      });
      showToast('Photos downloaded successfully!', 'success');
    });

    // Print button
    page.querySelector('#btn-print')?.addEventListener('click', () => {
      window.print();
    });

    // Share button
    page.querySelector('#btn-share')?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          const res = await fetch(finalPhotos[0]);
          const blob = await res.blob();
          const file = new File([blob], 'photobooth.png', { type: 'image/png' });
          await navigator.share({
            title: 'My Photo Studio Shot',
            text: 'Look at my photobooth photo! #PhotoStudio',
            files: [file],
          });
          showToast('Shared successfully!', 'success');
        } catch (err) {
          if (err.name !== 'AbortError') {
            showToast('Sharing cancelled or unavailable', 'info');
          }
        }
      } else {
        showToast('Web Share API is available on mobile devices. Use Download to share manually.', 'info', 3500);
      }
    });

    // Drive button
    page.querySelector('#btn-drive')?.addEventListener('click', () => {
      showToast('Google Drive integration will be configured in Phase 3!', 'info', 3000);
    });
  });

  return page;
}

/**
 * Helper to render photocard layout preview
 */
function renderPreviewLayout(photos, layout) {
  if (layout === 'strip') {
    return `
      <div style="display: flex; flex-direction: column; gap: 8px; padding: 16px; background: #ffffff; border-radius: var(--radius-xl);">
        ${photos.map((src, i) => `
          <img src="${src}" alt="Shot ${i + 1}" style="width: 100%; border-radius: var(--radius-md); aspect-ratio: 4/3; object-fit: cover;" />
        `).join('')}
        <div style="text-align: center; font-family: var(--font-display); font-size: 11px; font-weight: 600; color: #111; letter-spacing: 2px; padding-top: 6px;">
          ✦ PHOTO STUDIO ✦
        </div>
      </div>
    `;
  }

  if (layout === 'grid') {
    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 16px; background: #ffffff; border-radius: var(--radius-xl);">
        ${photos.map((src, i) => `
          <img src="${src}" alt="Shot ${i + 1}" style="width: 100%; border-radius: var(--radius-md); aspect-ratio: 4/3; object-fit: cover;" />
        `).join('')}
      </div>
    `;
  }

  // Single layout
  return `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${photos.map((src, i) => `
        <img src="${src}" alt="Final Photo ${i + 1}" style="width: 100%; border-radius: var(--radius-xl);" />
      `).join('')}
    </div>
  `;
}
